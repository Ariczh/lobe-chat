import { type ChatToolPayload } from '@lobechat/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_TOOL_RESULT_MAX_LENGTH } from '@/server/utils/truncateToolResult';

import { ToolExecutionService } from './index';
import { type ToolExecutionContext } from './types';

// Mock external dependencies
vi.mock('../discover');
vi.mock('../mcp/contentProcessor', () => ({
  contentBlocksToString: vi.fn((blocks: any[]) => {
    if (!blocks || blocks.length === 0) return '';
    return blocks.map((b: any) => b.text || b.data || '').join('\n\n');
  }),
}));

const createMockContext = (overrides?: Partial<ToolExecutionContext>): ToolExecutionContext => ({
  toolManifestMap: {},
  ...overrides,
});

const createMockPayload = (overrides?: Partial<ChatToolPayload>): ChatToolPayload => ({
  apiName: 'testApi',
  arguments: '{}',
  id: 'tool-call-1',
  identifier: 'test-tool',
  type: 'default' as any,
  ...overrides,
});

describe('ToolExecutionService', () => {
  let service: ToolExecutionService;
  let mockBuiltinToolsExecutor: any;
  let mockMcpService: any;
  let mockPluginGatewayService: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockBuiltinToolsExecutor = {
      execute: vi.fn().mockResolvedValue({
        content: 'builtin result',
        success: true,
      }),
    };

    mockMcpService = {
      callTool: vi.fn().mockResolvedValue('mcp result'),
    };

    mockPluginGatewayService = {
      execute: vi.fn().mockResolvedValue({
        content: 'plugin result',
        success: true,
      }),
    };

    service = new ToolExecutionService({
      builtinToolsExecutor: mockBuiltinToolsExecutor,
      mcpService: mockMcpService,
      pluginGatewayService: mockPluginGatewayService,
    });
  });

  describe('executeTool', () => {
    describe('builtin tool type', () => {
      it('should route to builtinToolsExecutor for builtin type', async () => {
        const payload = createMockPayload({ type: 'builtin' as any });
        const context = createMockContext();

        const result = await service.executeTool(payload, context);

        expect(mockBuiltinToolsExecutor.execute).toHaveBeenCalledWith(payload, context);
        expect(mockMcpService.callTool).not.toHaveBeenCalled();
        expect(mockPluginGatewayService.execute).not.toHaveBeenCalled();
        expect(result.content).toBe('builtin result');
        expect(result.success).toBe(true);
      });

      it('should include execution time in the response', async () => {
        const payload = createMockPayload({ type: 'builtin' as any });
        const context = createMockContext();

        const result = await service.executeTool(payload, context);

        expect(result.executionTime).toBeGreaterThanOrEqual(0);
        expect(typeof result.executionTime).toBe('number');
      });
    });

    describe('mcp tool type', () => {
      it('should route to executeMCPTool for mcp type', async () => {
        const payload = createMockPayload({
          apiName: 'myTool',
          identifier: 'my-mcp-server',
          type: 'mcp' as any,
        });
        const context = createMockContext({
          toolManifestMap: {
            'my-mcp-server': {
              identifier: 'my-mcp-server',
              mcpParams: { type: 'stdio', command: 'npx', args: ['server'] },
            } as any,
          },
        });

        await service.executeTool(payload, context);

        expect(mockMcpService.callTool).toHaveBeenCalledWith({
          argsStr: '{}',
          clientParams: { type: 'stdio', command: 'npx', args: ['server'] },
          toolName: 'myTool',
        });
        expect(mockBuiltinToolsExecutor.execute).not.toHaveBeenCalled();
        expect(mockPluginGatewayService.execute).not.toHaveBeenCalled();
      });

      it('should return error when manifest not found for mcp tool', async () => {
        const payload = createMockPayload({
          identifier: 'missing-tool',
          type: 'mcp' as any,
        });
        const context = createMockContext({ toolManifestMap: {} });

        const result = await service.executeTool(payload, context);

        expect(result.success).toBe(false);
        expect(result.content).toContain('Manifest not found for tool: missing-tool');
        expect(result.error?.code).toBe('MANIFEST_NOT_FOUND');
        expect(mockMcpService.callTool).not.toHaveBeenCalled();
      });

      it('should return error when MCP config not found in manifest', async () => {
        const payload = createMockPayload({
          identifier: 'tool-no-mcp',
          type: 'mcp' as any,
        });
        const context = createMockContext({
          toolManifestMap: {
            'tool-no-mcp': { identifier: 'tool-no-mcp' } as any, // No mcpParams
          },
        });

        const result = await service.executeTool(payload, context);

        expect(result.success).toBe(false);
        expect(result.content).toContain('MCP configuration not found for tool: tool-no-mcp');
        expect(result.error?.code).toBe('MCP_CONFIG_NOT_FOUND');
      });

      it('should return MCP result as success when callTool returns string', async () => {
        mockMcpService.callTool.mockResolvedValue('string result');
        const payload = createMockPayload({
          identifier: 'my-mcp',
          type: 'mcp' as any,
        });
        const context = createMockContext({
          toolManifestMap: {
            'my-mcp': {
              identifier: 'my-mcp',
              mcpParams: { type: 'http', url: 'http://localhost:3000' },
            } as any,
          },
        });

        const result = await service.executeTool(payload, context);

        expect(result.success).toBe(true);
        expect(result.content).toBe('string result');
      });

      it('should return MCP result as JSON when callTool returns object', async () => {
        const mockObj = { key: 'value', count: 42 };
        mockMcpService.callTool.mockResolvedValue(mockObj);
        const payload = createMockPayload({
          identifier: 'my-mcp',
          type: 'mcp' as any,
        });
        const context = createMockContext({
          toolManifestMap: {
            'my-mcp': {
              identifier: 'my-mcp',
              mcpParams: { type: 'sse', url: 'http://localhost:3000/sse' },
            } as any,
          },
        });

        const result = await service.executeTool(payload, context);

        expect(result.success).toBe(true);
        expect(result.content).toBe(JSON.stringify(mockObj));
        expect(result.state).toEqual(mockObj);
      });

      it('should handle MCP execution error and return error result', async () => {
        mockMcpService.callTool.mockRejectedValue(new Error('Connection refused'));
        const payload = createMockPayload({
          identifier: 'my-mcp',
          type: 'mcp' as any,
        });
        const context = createMockContext({
          toolManifestMap: {
            'my-mcp': {
              identifier: 'my-mcp',
              mcpParams: { type: 'stdio', command: 'npx', args: [] },
            } as any,
          },
        });

        const result = await service.executeTool(payload, context);

        expect(result.success).toBe(false);
        expect(result.content).toBe('Connection refused');
        expect(result.error?.code).toBe('MCP_EXECUTION_ERROR');
      });
    });

    describe('cloud MCP tool type', () => {
      it('should route cloud type MCP to executeCloudMCPTool', async () => {
        const { DiscoverService } = await import('../discover');
        const mockCallCloudMcp = vi.fn().mockResolvedValue({
          content: [{ type: 'text', text: 'cloud result' }],
          isError: false,
        });
        vi.mocked(DiscoverService).mockImplementation(
          () =>
            ({
              callCloudMcpEndpoint: mockCallCloudMcp,
            }) as any,
        );

        const payload = createMockPayload({
          apiName: 'cloudApi',
          arguments: '{"param":"value"}',
          identifier: 'cloud-mcp',
          type: 'mcp' as any,
        });
        const context = createMockContext({
          toolManifestMap: {
            'cloud-mcp': {
              identifier: 'cloud-mcp',
              mcpParams: { type: 'cloud' },
            } as any,
          },
          userId: 'user-123',
        });

        const result = await service.executeTool(payload, context);

        expect(mockCallCloudMcp).toHaveBeenCalledWith({
          apiParams: { param: 'value' },
          identifier: 'cloud-mcp',
          toolName: 'cloudApi',
        });
        expect(result.success).toBe(true);
        expect(mockMcpService.callTool).not.toHaveBeenCalled();
      });

      it('should handle cloud MCP error response (isError=true)', async () => {
        const { DiscoverService } = await import('../discover');
        vi.mocked(DiscoverService).mockImplementation(
          () =>
            ({
              callCloudMcpEndpoint: vi.fn().mockResolvedValue({
                content: [{ type: 'text', text: 'error detail' }],
                isError: true,
              }),
            }) as any,
        );

        const payload = createMockPayload({
          identifier: 'cloud-mcp',
          type: 'mcp' as any,
        });
        const context = createMockContext({
          toolManifestMap: {
            'cloud-mcp': {
              identifier: 'cloud-mcp',
              mcpParams: { type: 'cloud' },
            } as any,
          },
        });

        const result = await service.executeTool(payload, context);

        expect(result.success).toBe(false);
      });

      it('should handle cloud MCP execution exception', async () => {
        const { DiscoverService } = await import('../discover');
        vi.mocked(DiscoverService).mockImplementation(
          () =>
            ({
              callCloudMcpEndpoint: vi.fn().mockRejectedValue(new Error('Network error')),
            }) as any,
        );

        const payload = createMockPayload({
          identifier: 'cloud-mcp',
          type: 'mcp' as any,
        });
        const context = createMockContext({
          toolManifestMap: {
            'cloud-mcp': {
              identifier: 'cloud-mcp',
              mcpParams: { type: 'cloud' },
            } as any,
          },
        });

        const result = await service.executeTool(payload, context);

        expect(result.success).toBe(false);
        expect(result.content).toBe('Network error');
        expect(result.error?.code).toBe('CLOUD_MCP_EXECUTION_ERROR');
      });
    });

    describe('plugin/default tool type', () => {
      it('should route to pluginGatewayService for default/standalone type', async () => {
        const payload = createMockPayload({ type: 'standalone' as any });
        const context = createMockContext();

        const result = await service.executeTool(payload, context);

        expect(mockPluginGatewayService.execute).toHaveBeenCalledWith(payload, context);
        expect(result.content).toBe('plugin result');
        expect(result.success).toBe(true);
      });

      it('should route to pluginGatewayService for markdown type', async () => {
        const payload = createMockPayload({ type: 'markdown' as any });
        const context = createMockContext();

        await service.executeTool(payload, context);

        expect(mockPluginGatewayService.execute).toHaveBeenCalledWith(payload, context);
      });
    });

    describe('result truncation', () => {
      it('should not truncate content within default limit', async () => {
        const shortContent = 'short result';
        mockBuiltinToolsExecutor.execute.mockResolvedValue({
          content: shortContent,
          success: true,
        });

        const payload = createMockPayload({ type: 'builtin' as any });
        const result = await service.executeTool(payload, createMockContext());

        expect(result.content).toBe(shortContent);
      });

      it('should truncate content exceeding default limit', async () => {
        const longContent = 'x'.repeat(DEFAULT_TOOL_RESULT_MAX_LENGTH + 1000);
        mockBuiltinToolsExecutor.execute.mockResolvedValue({
          content: longContent,
          success: true,
        });

        const payload = createMockPayload({ type: 'builtin' as any });
        const result = await service.executeTool(payload, createMockContext());

        expect(result.content.length).toBeLessThan(longContent.length);
        expect(result.content).toContain('[Content truncated:');
      });

      it('should use context.toolResultMaxLength when provided', async () => {
        const content = 'x'.repeat(200);
        mockBuiltinToolsExecutor.execute.mockResolvedValue({
          content,
          success: true,
        });

        const payload = createMockPayload({ type: 'builtin' as any });
        const context = createMockContext({ toolResultMaxLength: 100 });

        const result = await service.executeTool(payload, context);

        // Content should be truncated at 100 chars + notice appended
        expect(result.content).toContain('[Content truncated:');
        expect(result.content.slice(0, 100)).toBe('x'.repeat(100));
        // Should not contain the original remaining chars without the notice
        expect(result.content.slice(100, 200)).not.toBe('x'.repeat(100));
      });
    });

    describe('error handling', () => {
      it('should return error result when builtinToolsExecutor throws', async () => {
        mockBuiltinToolsExecutor.execute.mockRejectedValue(new Error('Builtin tool not found'));

        const payload = createMockPayload({ type: 'builtin' as any });
        const result = await service.executeTool(payload, createMockContext());

        expect(result.success).toBe(false);
        expect(result.content).toBe('Builtin tool not found');
        expect(result.error?.message).toBe('Builtin tool not found');
        expect(result.executionTime).toBeGreaterThanOrEqual(0);
      });

      it('should return error result when pluginGatewayService throws', async () => {
        mockPluginGatewayService.execute.mockRejectedValue(new Error('Plugin unavailable'));

        const payload = createMockPayload({ type: 'standalone' as any });
        const result = await service.executeTool(payload, createMockContext());

        expect(result.success).toBe(false);
        expect(result.content).toBe('Plugin unavailable');
        expect(result.error?.message).toBe('Plugin unavailable');
      });

      it('should truncate error message if it exceeds limit', async () => {
        const longErrorMessage = 'e'.repeat(DEFAULT_TOOL_RESULT_MAX_LENGTH + 500);
        mockPluginGatewayService.execute.mockRejectedValue(new Error(longErrorMessage));

        const payload = createMockPayload({ type: 'standalone' as any });
        const result = await service.executeTool(payload, createMockContext());

        expect(result.success).toBe(false);
        expect(result.content.length).toBeLessThan(longErrorMessage.length);
        expect(result.content).toContain('[Content truncated:');
      });
    });
  });
});
