import { type ChatToolPayload } from '@lobechat/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ToolExecutionService } from './index';
import { type ToolExecutionContext } from './types';

// Mock debug
vi.mock('debug', () => ({
  default: () => vi.fn(),
}));

// Mock utils
vi.mock('@lobechat/utils', () => ({
  safeParseJSON: vi.fn((str) => {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  }),
}));

// Mock truncateToolResult to pass through (avoid side effects)
vi.mock('@/server/utils/truncateToolResult', () => ({
  DEFAULT_TOOL_RESULT_MAX_LENGTH: 25_000,
  truncateToolResult: vi.fn((content: string, maxLength?: number) => {
    const limit = maxLength ?? 25_000;
    if (!content || content.length <= limit) return content;
    return content.slice(0, limit) + `\n[... ${content.length - limit} chars truncated]`;
  }),
}));

// Mock DiscoverService
vi.mock('../discover', () => ({
  DiscoverService: vi.fn().mockImplementation(() => ({
    callCloudMcpEndpoint: vi.fn(),
  })),
}));

// Mock contentProcessor
vi.mock('@/server/services/mcp/contentProcessor', () => ({
  contentBlocksToString: vi.fn((blocks: any[]) => {
    if (!blocks || blocks.length === 0) return '';
    return blocks.map((b) => b.text || '').join('');
  }),
}));

describe('ToolExecutionService', () => {
  let service: ToolExecutionService;
  let mockBuiltinToolsExecutor: any;
  let mockMcpService: any;
  let mockPluginGatewayService: any;

  const baseContext: ToolExecutionContext = {
    toolManifestMap: {},
    userId: 'user-123',
  };

  const makePayload = (overrides: Partial<ChatToolPayload> = {}): ChatToolPayload => ({
    id: 'call-1',
    apiName: 'myMethod',
    arguments: '{}',
    identifier: 'my-tool',
    type: 'builtin',
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();

    mockBuiltinToolsExecutor = {
      execute: vi.fn(),
    };

    mockMcpService = {
      callTool: vi.fn(),
    };

    mockPluginGatewayService = {
      execute: vi.fn(),
    };

    service = new ToolExecutionService({
      builtinToolsExecutor: mockBuiltinToolsExecutor,
      mcpService: mockMcpService,
      pluginGatewayService: mockPluginGatewayService,
    });
  });

  describe('executeTool', () => {
    describe('builtin type routing', () => {
      it('should call builtinToolsExecutor for builtin type', async () => {
        mockBuiltinToolsExecutor.execute.mockResolvedValue({
          content: 'builtin result',
          success: true,
        });

        const payload = makePayload({ type: 'builtin' });
        const result = await service.executeTool(payload, baseContext);

        expect(mockBuiltinToolsExecutor.execute).toHaveBeenCalledWith(payload, baseContext);
        expect(result.content).toBe('builtin result');
        expect(result.success).toBe(true);
      });

      it('should include executionTime in result', async () => {
        mockBuiltinToolsExecutor.execute.mockResolvedValue({
          content: 'result',
          success: true,
        });

        const payload = makePayload({ type: 'builtin' });
        const result = await service.executeTool(payload, baseContext);

        expect(result.executionTime).toBeGreaterThanOrEqual(0);
        expect(typeof result.executionTime).toBe('number');
      });
    });

    describe('plugin gateway routing (default type)', () => {
      it('should call pluginGatewayService for default type', async () => {
        mockPluginGatewayService.execute.mockResolvedValue({
          content: 'plugin result',
          success: true,
        });

        const payload = makePayload({ type: 'default' });
        const result = await service.executeTool(payload, baseContext);

        expect(mockPluginGatewayService.execute).toHaveBeenCalledWith(payload, baseContext);
        expect(result.content).toBe('plugin result');
        expect(result.success).toBe(true);
      });

      it('should call pluginGatewayService for standalone type', async () => {
        mockPluginGatewayService.execute.mockResolvedValue({
          content: 'standalone result',
          success: true,
        });

        const payload = makePayload({ type: 'standalone' });
        const result = await service.executeTool(payload, baseContext);

        expect(mockPluginGatewayService.execute).toHaveBeenCalled();
        expect(result.content).toBe('standalone result');
      });
    });

    describe('result truncation', () => {
      it('should truncate result when content exceeds toolResultMaxLength', async () => {
        const longContent = 'a'.repeat(100);
        mockBuiltinToolsExecutor.execute.mockResolvedValue({
          content: longContent,
          success: true,
        });

        const context: ToolExecutionContext = {
          ...baseContext,
          toolResultMaxLength: 50,
        };

        const payload = makePayload({ type: 'builtin' });
        const result = await service.executeTool(payload, context);

        // The mock truncateToolResult should truncate to 50 chars + notice
        expect(result.content.length).toBeLessThan(longContent.length);
        expect(result.content).toContain('[... 50 chars truncated]');
      });

      it('should not truncate when content is within limit', async () => {
        const shortContent = 'short result';
        mockBuiltinToolsExecutor.execute.mockResolvedValue({
          content: shortContent,
          success: true,
        });

        const payload = makePayload({ type: 'builtin' });
        const result = await service.executeTool(payload, baseContext);

        expect(result.content).toBe(shortContent);
      });
    });

    describe('error handling', () => {
      it('should return error result when builtinToolsExecutor throws', async () => {
        mockBuiltinToolsExecutor.execute.mockRejectedValue(new Error('Execution failed'));

        const payload = makePayload({ type: 'builtin' });
        const result = await service.executeTool(payload, baseContext);

        expect(result.success).toBe(false);
        expect(result.content).toBe('Execution failed');
        expect(result.error).toEqual({ message: 'Execution failed' });
        expect(result.executionTime).toBeGreaterThanOrEqual(0);
      });

      it('should return error result when pluginGatewayService throws', async () => {
        mockPluginGatewayService.execute.mockRejectedValue(new Error('Plugin error'));

        const payload = makePayload({ type: 'default' });
        const result = await service.executeTool(payload, baseContext);

        expect(result.success).toBe(false);
        expect(result.content).toBe('Plugin error');
        expect(result.error).toEqual({ message: 'Plugin error' });
      });
    });

    describe('MCP tool routing', () => {
      it('should return error when manifest is not found for MCP tool', async () => {
        const context: ToolExecutionContext = {
          toolManifestMap: {}, // empty - no manifest for this tool
          userId: 'user-123',
        };

        const payload = makePayload({
          identifier: 'my-mcp-tool',
          type: 'mcp',
        });

        const result = await service.executeTool(payload, context);

        expect(result.success).toBe(false);
        expect(result.content).toContain('Manifest not found');
        expect(mockMcpService.callTool).not.toHaveBeenCalled();
      });

      it('should return error when MCP config not found in manifest', async () => {
        const context: ToolExecutionContext = {
          toolManifestMap: {
            'my-mcp-tool': {
              identifier: 'my-mcp-tool',
              // no mcpParams
            } as any,
          },
          userId: 'user-123',
        };

        const payload = makePayload({
          identifier: 'my-mcp-tool',
          type: 'mcp',
        });

        const result = await service.executeTool(payload, context);

        expect(result.success).toBe(false);
        expect(result.content).toContain('MCP configuration not found');
        expect(result.content).toContain('TRY TO REINSTALL THE MCP PLUGIN');
        expect(mockMcpService.callTool).not.toHaveBeenCalled();
      });

      it('should call mcpService.callTool for stdio MCP type', async () => {
        mockMcpService.callTool.mockResolvedValue('mcp result string');

        const context: ToolExecutionContext = {
          toolManifestMap: {
            'my-mcp-tool': {
              identifier: 'my-mcp-tool',
              mcpParams: { type: 'stdio', command: 'node', args: ['server.js'] },
            } as any,
          },
          userId: 'user-123',
        };

        const payload = makePayload({
          identifier: 'my-mcp-tool',
          apiName: 'get_data',
          arguments: '{"key":"val"}',
          type: 'mcp',
        });

        const result = await service.executeTool(payload, context);

        expect(mockMcpService.callTool).toHaveBeenCalledWith({
          argsStr: '{"key":"val"}',
          clientParams: { type: 'stdio', command: 'node', args: ['server.js'] },
          toolName: 'get_data',
        });
        expect(result.content).toBe('mcp result string');
        expect(result.success).toBe(true);
      });

      it('should JSON stringify non-string MCP result', async () => {
        const objectResult = { data: [1, 2, 3] };
        mockMcpService.callTool.mockResolvedValue(objectResult);

        const context: ToolExecutionContext = {
          toolManifestMap: {
            'my-mcp-tool': {
              identifier: 'my-mcp-tool',
              mcpParams: { type: 'http', url: 'http://localhost:3000' },
            } as any,
          },
          userId: 'user-123',
        };

        const payload = makePayload({
          identifier: 'my-mcp-tool',
          type: 'mcp',
        });

        const result = await service.executeTool(payload, context);

        expect(result.content).toBe(JSON.stringify(objectResult));
        expect(result.state).toEqual(objectResult);
      });

      it('should return error when mcpService.callTool throws', async () => {
        mockMcpService.callTool.mockRejectedValue(new Error('MCP connection failed'));

        const context: ToolExecutionContext = {
          toolManifestMap: {
            'my-mcp-tool': {
              identifier: 'my-mcp-tool',
              mcpParams: { type: 'stdio' },
            } as any,
          },
          userId: 'user-123',
        };

        const payload = makePayload({
          identifier: 'my-mcp-tool',
          type: 'mcp',
        });

        const result = await service.executeTool(payload, context);

        expect(result.success).toBe(false);
        expect(result.content).toBe('MCP connection failed');
        expect(result.error).toEqual({
          code: 'MCP_EXECUTION_ERROR',
          message: 'MCP connection failed',
        });
      });

      it('should route cloud MCP type to executeCloudMCPTool', async () => {
        const { DiscoverService } = await import('../discover');
        const mockCallCloudMcpEndpoint = vi.fn().mockResolvedValue({
          content: [{ text: 'cloud result', type: 'text' }],
          isError: false,
        });
        vi.mocked(DiscoverService).mockImplementation(
          () => ({ callCloudMcpEndpoint: mockCallCloudMcpEndpoint }) as any,
        );

        const context: ToolExecutionContext = {
          toolManifestMap: {
            'cloud-mcp': {
              identifier: 'cloud-mcp',
              mcpParams: { type: 'cloud', identifier: 'cloud-mcp' },
            } as any,
          },
          userId: 'user-123',
        };

        const payload = makePayload({
          identifier: 'cloud-mcp',
          apiName: 'search',
          arguments: '{"q":"test"}',
          type: 'mcp',
        });

        const result = await service.executeTool(payload, context);

        expect(mockCallCloudMcpEndpoint).toHaveBeenCalledWith({
          apiParams: { q: 'test' },
          identifier: 'cloud-mcp',
          toolName: 'search',
        });
        expect(result.success).toBe(true);
      });

      it('should return error when cloud MCP callCloudMcpEndpoint throws', async () => {
        const { DiscoverService } = await import('../discover');
        const mockCallCloudMcpEndpoint = vi
          .fn()
          .mockRejectedValue(new Error('Cloud service unavailable'));
        vi.mocked(DiscoverService).mockImplementation(
          () => ({ callCloudMcpEndpoint: mockCallCloudMcpEndpoint }) as any,
        );

        const context: ToolExecutionContext = {
          toolManifestMap: {
            'cloud-mcp': {
              identifier: 'cloud-mcp',
              mcpParams: { type: 'cloud', identifier: 'cloud-mcp' },
            } as any,
          },
          userId: 'user-123',
        };

        const payload = makePayload({
          identifier: 'cloud-mcp',
          type: 'mcp',
        });

        const result = await service.executeTool(payload, context);

        expect(result.success).toBe(false);
        expect(result.content).toBe('Cloud service unavailable');
        expect(result.error).toEqual({
          code: 'CLOUD_MCP_EXECUTION_ERROR',
          message: 'Cloud service unavailable',
        });
      });
    });
  });
});
