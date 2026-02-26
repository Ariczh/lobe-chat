import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DiscoverService } from '@/server/services/discover';
import { contentBlocksToString } from '@/server/services/mcp/contentProcessor';

import { ToolExecutionService } from '../index';
import { type ToolExecutionContext } from '../types';

// Mock external dependencies
vi.mock('@/server/services/mcp/contentProcessor', () => ({
  contentBlocksToString: vi.fn(),
}));

vi.mock('@/server/services/discover', () => ({
  DiscoverService: vi.fn(),
}));

vi.mock('debug', () => ({
  default: vi.fn(() => vi.fn()),
}));

describe('ToolExecutionService', () => {
  let service: ToolExecutionService;
  let mockBuiltinExecutor: any;
  let mockMcpService: any;
  let mockPluginGatewayService: any;
  let baseContext: ToolExecutionContext;

  beforeEach(() => {
    vi.clearAllMocks();

    mockBuiltinExecutor = {
      execute: vi.fn(),
    };

    mockMcpService = {
      callTool: vi.fn(),
    };

    mockPluginGatewayService = {
      execute: vi.fn(),
    };

    service = new ToolExecutionService({
      builtinToolsExecutor: mockBuiltinExecutor,
      mcpService: mockMcpService,
      pluginGatewayService: mockPluginGatewayService,
    });

    baseContext = {
      toolManifestMap: {},
      userId: 'user-1',
    };
  });

  describe('executeTool', () => {
    describe('builtin type', () => {
      it('should route to builtinToolsExecutor for builtin type', async () => {
        const payload = {
          apiName: 'search',
          arguments: '{}',
          identifier: 'web-search',
          type: 'builtin' as any,
        };

        mockBuiltinExecutor.execute.mockResolvedValue({
          content: 'search result',
          success: true,
        });

        const result = await service.executeTool(payload, baseContext);

        expect(mockBuiltinExecutor.execute).toHaveBeenCalledWith(payload, baseContext);
        expect(result.content).toBe('search result');
        expect(result.success).toBe(true);
        expect(result.executionTime).toBeGreaterThanOrEqual(0);
      });

      it('should include executionTime in the response', async () => {
        const payload = {
          apiName: 'search',
          arguments: '{}',
          identifier: 'web-search',
          type: 'builtin' as any,
        };

        mockBuiltinExecutor.execute.mockResolvedValue({
          content: 'result',
          success: true,
        });

        const result = await service.executeTool(payload, baseContext);

        expect(typeof result.executionTime).toBe('number');
        expect(result.executionTime).toBeGreaterThanOrEqual(0);
      });
    });

    describe('mcp type', () => {
      it('should return error when manifest is not found', async () => {
        const payload = {
          apiName: 'some-tool',
          arguments: '{}',
          identifier: 'missing-mcp',
          type: 'mcp' as any,
        };

        const result = await service.executeTool(payload, baseContext);

        expect(result.success).toBe(false);
        expect(result.content).toContain('Manifest not found for tool: missing-mcp');
        expect(result.error?.code).toBe('MANIFEST_NOT_FOUND');
      });

      it('should return error when mcpParams is not found in manifest', async () => {
        const payload = {
          apiName: 'some-tool',
          arguments: '{}',
          identifier: 'my-mcp',
          type: 'mcp' as any,
        };

        const contextWithManifest: ToolExecutionContext = {
          ...baseContext,
          toolManifestMap: {
            'my-mcp': { identifier: 'my-mcp' } as any, // no mcpParams
          },
        };

        const result = await service.executeTool(payload, contextWithManifest);

        expect(result.success).toBe(false);
        expect(result.content).toContain('MCP configuration not found for tool: my-mcp');
        expect(result.error?.code).toBe('MCP_CONFIG_NOT_FOUND');
      });

      it('should call mcpService.callTool for stdio type', async () => {
        const payload = {
          apiName: 'list-files',
          arguments: '{"path": "/tmp"}',
          identifier: 'fs-mcp',
          type: 'mcp' as any,
        };

        const mcpParams = { type: 'stdio', command: 'my-mcp-server' };
        const contextWithManifest: ToolExecutionContext = {
          ...baseContext,
          toolManifestMap: {
            'fs-mcp': { identifier: 'fs-mcp', mcpParams } as any,
          },
        };

        mockMcpService.callTool.mockResolvedValue('["file1.txt", "file2.txt"]');

        const result = await service.executeTool(payload, contextWithManifest);

        expect(mockMcpService.callTool).toHaveBeenCalledWith({
          argsStr: '{"path": "/tmp"}',
          clientParams: mcpParams,
          toolName: 'list-files',
        });
        expect(result.success).toBe(true);
        expect(result.content).toBe('["file1.txt", "file2.txt"]');
      });

      it('should stringify object results from mcpService.callTool', async () => {
        const payload = {
          apiName: 'get-data',
          arguments: '{}',
          identifier: 'data-mcp',
          type: 'mcp' as any,
        };

        const mcpParams = { type: 'http', url: 'http://localhost:8080' };
        const contextWithManifest: ToolExecutionContext = {
          ...baseContext,
          toolManifestMap: {
            'data-mcp': { identifier: 'data-mcp', mcpParams } as any,
          },
        };

        const objectResult = { data: [1, 2, 3], total: 3 };
        mockMcpService.callTool.mockResolvedValue(objectResult);

        const result = await service.executeTool(payload, contextWithManifest);

        expect(result.success).toBe(true);
        expect(result.content).toBe(JSON.stringify(objectResult));
        expect(result.state).toEqual(objectResult);
      });

      it('should handle mcp tool execution error', async () => {
        const payload = {
          apiName: 'failing-tool',
          arguments: '{}',
          identifier: 'failing-mcp',
          type: 'mcp' as any,
        };

        const mcpParams = { type: 'stdio', command: 'mcp-server' };
        const contextWithManifest: ToolExecutionContext = {
          ...baseContext,
          toolManifestMap: {
            'failing-mcp': { identifier: 'failing-mcp', mcpParams } as any,
          },
        };

        mockMcpService.callTool.mockRejectedValue(new Error('Connection refused'));

        const result = await service.executeTool(payload, contextWithManifest);

        expect(result.success).toBe(false);
        expect(result.content).toBe('Connection refused');
        expect(result.error?.code).toBe('MCP_EXECUTION_ERROR');
        expect(result.error?.message).toBe('Connection refused');
      });

      it('should call DiscoverService for cloud mcp type', async () => {
        const payload = {
          apiName: 'run-query',
          arguments: '{"query": "hello"}',
          identifier: 'cloud-tool',
          type: 'mcp' as any,
        };

        const mcpParams = { type: 'cloud' };
        const contextWithManifest: ToolExecutionContext = {
          ...baseContext,
          toolManifestMap: {
            'cloud-tool': { identifier: 'cloud-tool', mcpParams } as any,
          },
        };

        const mockCallCloudMcpEndpoint = vi.fn().mockResolvedValue({
          content: [{ type: 'text', text: 'cloud result' }],
          isError: false,
        });

        vi.mocked(DiscoverService).mockImplementation(
          () => ({ callCloudMcpEndpoint: mockCallCloudMcpEndpoint }) as any,
        );
        vi.mocked(contentBlocksToString).mockReturnValue('cloud result');

        const result = await service.executeTool(payload, contextWithManifest);

        expect(mockCallCloudMcpEndpoint).toHaveBeenCalledWith({
          apiParams: { query: 'hello' },
          identifier: 'cloud-tool',
          toolName: 'run-query',
        });
        expect(result.success).toBe(true);
        expect(result.content).toBe('cloud result');
      });

      it('should handle cloud mcp error response', async () => {
        const payload = {
          apiName: 'run-query',
          arguments: '{}',
          identifier: 'cloud-tool',
          type: 'mcp' as any,
        };

        const mcpParams = { type: 'cloud' };
        const contextWithManifest: ToolExecutionContext = {
          ...baseContext,
          toolManifestMap: {
            'cloud-tool': { identifier: 'cloud-tool', mcpParams } as any,
          },
        };

        const mockCallCloudMcpEndpoint = vi.fn().mockResolvedValue({
          content: [{ type: 'text', text: 'error message' }],
          isError: true,
        });

        vi.mocked(DiscoverService).mockImplementation(
          () => ({ callCloudMcpEndpoint: mockCallCloudMcpEndpoint }) as any,
        );
        vi.mocked(contentBlocksToString).mockReturnValue('error message');

        const result = await service.executeTool(payload, contextWithManifest);

        expect(result.success).toBe(false); // isError is true
        expect(result.content).toBe('error message');
      });

      it('should handle cloud mcp network error', async () => {
        const payload = {
          apiName: 'run-query',
          arguments: '{}',
          identifier: 'cloud-tool',
          type: 'mcp' as any,
        };

        const mcpParams = { type: 'cloud' };
        const contextWithManifest: ToolExecutionContext = {
          ...baseContext,
          toolManifestMap: {
            'cloud-tool': { identifier: 'cloud-tool', mcpParams } as any,
          },
        };

        vi.mocked(DiscoverService).mockImplementation(
          () =>
            ({
              callCloudMcpEndpoint: vi.fn().mockRejectedValue(new Error('Network timeout')),
            }) as any,
        );

        const result = await service.executeTool(payload, contextWithManifest);

        expect(result.success).toBe(false);
        expect(result.content).toBe('Network timeout');
        expect(result.error?.code).toBe('CLOUD_MCP_EXECUTION_ERROR');
      });
    });

    describe('default type (plugin gateway)', () => {
      it('should route to pluginGatewayService for unknown types', async () => {
        const payload = {
          apiName: 'execute',
          arguments: '{"input": "test"}',
          identifier: 'my-plugin',
          type: 'standalone' as any,
        };

        mockPluginGatewayService.execute.mockResolvedValue({
          content: 'plugin result',
          success: true,
        });

        const result = await service.executeTool(payload, baseContext);

        expect(mockPluginGatewayService.execute).toHaveBeenCalledWith(payload, baseContext);
        expect(result.content).toBe('plugin result');
        expect(result.success).toBe(true);
      });

      it('should route markdown type to pluginGatewayService', async () => {
        const payload = {
          apiName: 'render',
          arguments: '{}',
          identifier: 'my-plugin',
          type: 'markdown' as any,
        };

        mockPluginGatewayService.execute.mockResolvedValue({
          content: '# Hello',
          success: true,
        });

        const result = await service.executeTool(payload, baseContext);

        expect(mockPluginGatewayService.execute).toHaveBeenCalledWith(payload, baseContext);
        expect(result.success).toBe(true);
      });
    });

    describe('error handling', () => {
      it('should return error result when execution throws', async () => {
        const payload = {
          apiName: 'crash',
          arguments: '{}',
          identifier: 'buggy-tool',
          type: 'builtin' as any,
        };

        mockBuiltinExecutor.execute.mockRejectedValue(new Error('Unexpected crash'));

        const result = await service.executeTool(payload, baseContext);

        expect(result.success).toBe(false);
        expect(result.content).toContain('Unexpected crash');
        expect(result.error?.message).toBe('Unexpected crash');
        expect(result.executionTime).toBeGreaterThanOrEqual(0);
      });

      it('should truncate error message if it exceeds limit', async () => {
        const payload = {
          apiName: 'verbose-fail',
          arguments: '{}',
          identifier: 'error-tool',
          type: 'builtin' as any,
        };

        const longErrorMessage = 'x'.repeat(30_000);
        mockBuiltinExecutor.execute.mockRejectedValue(new Error(longErrorMessage));

        const result = await service.executeTool(payload, baseContext);

        expect(result.success).toBe(false);
        // Content should be truncated (original is 30k, default limit is 25k)
        expect(result.content.length).toBeLessThan(30_000);
      });
    });

    describe('result truncation', () => {
      it('should truncate content when it exceeds the default max length', async () => {
        const payload = {
          apiName: 'big-search',
          arguments: '{}',
          identifier: 'search-tool',
          type: 'builtin' as any,
        };

        const largeContent = 'a'.repeat(30_000);
        mockBuiltinExecutor.execute.mockResolvedValue({
          content: largeContent,
          success: true,
        });

        const result = await service.executeTool(payload, baseContext);

        expect(result.content.length).toBeLessThan(30_000);
        expect(result.content).toContain('[Content truncated:');
      });

      it('should truncate content using context.toolResultMaxLength when provided', async () => {
        const payload = {
          apiName: 'search',
          arguments: '{}',
          identifier: 'search-tool',
          type: 'builtin' as any,
        };

        const largeContent = 'b'.repeat(2_000);
        mockBuiltinExecutor.execute.mockResolvedValue({
          content: largeContent,
          success: true,
        });

        const contextWithLimit: ToolExecutionContext = {
          ...baseContext,
          toolResultMaxLength: 500,
        };

        const result = await service.executeTool(payload, contextWithLimit);

        expect(result.content.length).toBeLessThan(2_000);
        expect(result.content).toContain('[Content truncated:');
      });

      it('should not truncate content within the default limit', async () => {
        const payload = {
          apiName: 'small-search',
          arguments: '{}',
          identifier: 'search-tool',
          type: 'builtin' as any,
        };

        const smallContent = 'result text';
        mockBuiltinExecutor.execute.mockResolvedValue({
          content: smallContent,
          success: true,
        });

        const result = await service.executeTool(payload, baseContext);

        expect(result.content).toBe(smallContent);
      });
    });
  });
});
