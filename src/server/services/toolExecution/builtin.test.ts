import { type ChatToolPayload } from '@lobechat/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BuiltinToolsExecutor } from './builtin';
import * as serverRuntimes from './serverRuntimes';
import { type ToolExecutionContext } from './types';

// Mock debug module
vi.mock('debug', () => ({
  default: () => vi.fn(),
}));

// Mock dependencies
vi.mock('@/server/services/klavis', () => ({
  KlavisService: vi.fn().mockImplementation(() => ({
    executeKlavisTool: vi.fn(),
  })),
}));

vi.mock('@/server/services/market', () => ({
  MarketService: vi.fn().mockImplementation(() => ({
    executeLobehubSkill: vi.fn(),
  })),
}));

vi.mock('@lobechat/utils', () => ({
  safeParseJSON: vi.fn((str) => {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  }),
}));

// Mock serverRuntimes module
vi.mock('./serverRuntimes', () => ({
  getServerRuntime: vi.fn(),
  hasServerRuntime: vi.fn(),
}));

describe('BuiltinToolsExecutor', () => {
  let executor: BuiltinToolsExecutor;
  const mockDb = {} as any;
  const mockUserId = 'user-123';

  const baseContext: ToolExecutionContext = {
    toolManifestMap: {},
    userId: mockUserId,
  };

  const basePayload: ChatToolPayload = {
    id: 'call-1',
    apiName: 'myTool',
    arguments: '{}',
    identifier: 'my-plugin',
    type: 'builtin',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    executor = new BuiltinToolsExecutor(mockDb, mockUserId);
  });

  describe('constructor', () => {
    it('should instantiate without errors', () => {
      expect(executor).toBeDefined();
    });
  });

  describe('execute', () => {
    describe('lobehubSkill source routing', () => {
      it('should route to marketService.executeLobehubSkill when source is lobehubSkill', async () => {
        const { MarketService } = await import('@/server/services/market');
        const mockExecuteLobehubSkill = vi.fn().mockResolvedValue({
          content: 'skill result',
          success: true,
        });
        vi.mocked(MarketService).mockImplementation(
          () => ({ executeLobehubSkill: mockExecuteLobehubSkill }) as any,
        );

        const localExecutor = new BuiltinToolsExecutor(mockDb, mockUserId);
        const payload: ChatToolPayload = {
          ...basePayload,
          identifier: 'my-skill',
          apiName: 'runSkill',
          arguments: '{"key":"value"}',
          source: 'lobehubSkill',
        };

        const result = await localExecutor.execute(payload, baseContext);

        expect(mockExecuteLobehubSkill).toHaveBeenCalledWith({
          args: { key: 'value' },
          provider: 'my-skill',
          toolName: 'runSkill',
        });
        expect(result).toEqual({ content: 'skill result', success: true });
      });

      it('should parse arguments from JSON string for lobehubSkill', async () => {
        const { MarketService } = await import('@/server/services/market');
        const mockExecuteLobehubSkill = vi.fn().mockResolvedValue({
          content: 'result',
          success: true,
        });
        vi.mocked(MarketService).mockImplementation(
          () => ({ executeLobehubSkill: mockExecuteLobehubSkill }) as any,
        );

        const localExecutor = new BuiltinToolsExecutor(mockDb, mockUserId);
        const payload: ChatToolPayload = {
          ...basePayload,
          arguments: '{"param1":"hello","param2":42}',
          source: 'lobehubSkill',
        };

        await localExecutor.execute(payload, baseContext);

        expect(mockExecuteLobehubSkill).toHaveBeenCalledWith(
          expect.objectContaining({ args: { param1: 'hello', param2: 42 } }),
        );
      });

      it('should use empty object args when arguments is invalid JSON for lobehubSkill', async () => {
        const { MarketService } = await import('@/server/services/market');
        const mockExecuteLobehubSkill = vi.fn().mockResolvedValue({
          content: 'result',
          success: true,
        });
        vi.mocked(MarketService).mockImplementation(
          () => ({ executeLobehubSkill: mockExecuteLobehubSkill }) as any,
        );

        const localExecutor = new BuiltinToolsExecutor(mockDb, mockUserId);
        const payload: ChatToolPayload = {
          ...basePayload,
          // 'invalid-json' cannot be parsed, so safeParseJSON returns null → args defaults to {}
          arguments: 'invalid-json',
          source: 'lobehubSkill',
        };

        await localExecutor.execute(payload, baseContext);

        expect(mockExecuteLobehubSkill).toHaveBeenCalledWith(expect.objectContaining({ args: {} }));
      });
    });

    describe('klavis source routing', () => {
      it('should route to klavisService.executeKlavisTool when source is klavis', async () => {
        const { KlavisService } = await import('@/server/services/klavis');
        const mockExecuteKlavisTool = vi.fn().mockResolvedValue({
          content: 'klavis result',
          success: true,
        });
        vi.mocked(KlavisService).mockImplementation(
          () => ({ executeKlavisTool: mockExecuteKlavisTool }) as any,
        );

        const localExecutor = new BuiltinToolsExecutor(mockDb, mockUserId);
        const payload: ChatToolPayload = {
          ...basePayload,
          identifier: 'klavis-tool',
          apiName: 'sendSlack',
          arguments: '{"message":"hello"}',
          source: 'klavis',
        };

        const result = await localExecutor.execute(payload, baseContext);

        expect(mockExecuteKlavisTool).toHaveBeenCalledWith({
          args: { message: 'hello' },
          identifier: 'klavis-tool',
          toolName: 'sendSlack',
        });
        expect(result).toEqual({ content: 'klavis result', success: true });
      });
    });

    describe('server runtime routing', () => {
      it('should throw error when identifier is not in server runtime registry', async () => {
        vi.mocked(serverRuntimes.hasServerRuntime).mockReturnValue(false);

        const payload: ChatToolPayload = {
          ...basePayload,
          identifier: 'unknown-tool',
        };

        await expect(executor.execute(payload, baseContext)).rejects.toThrow(
          'Builtin tool "unknown-tool" is not implemented',
        );
      });

      it('should throw error when apiName method does not exist on runtime', async () => {
        vi.mocked(serverRuntimes.hasServerRuntime).mockReturnValue(true);
        vi.mocked(serverRuntimes.getServerRuntime).mockResolvedValue({
          // runtime with no methods
        });

        const payload: ChatToolPayload = {
          ...basePayload,
          identifier: 'web-browsing',
          apiName: 'nonExistentMethod',
        };

        await expect(executor.execute(payload, baseContext)).rejects.toThrow(
          "Builtin tool web-browsing's nonExistentMethod is not implemented",
        );
      });

      it('should call the correct method on the server runtime', async () => {
        const mockSearch = vi.fn().mockResolvedValue({ content: 'search results', success: true });
        vi.mocked(serverRuntimes.hasServerRuntime).mockReturnValue(true);
        vi.mocked(serverRuntimes.getServerRuntime).mockResolvedValue({
          search: mockSearch,
        });

        const payload: ChatToolPayload = {
          ...basePayload,
          identifier: 'web-browsing',
          apiName: 'search',
          arguments: '{"query":"test"}',
        };

        const result = await executor.execute(payload, baseContext);

        expect(mockSearch).toHaveBeenCalledWith({ query: 'test' }, baseContext);
        expect(result).toEqual({ content: 'search results', success: true });
      });

      it('should return error result when runtime method throws', async () => {
        const mockMethod = vi.fn().mockRejectedValue(new Error('Runtime failed'));
        vi.mocked(serverRuntimes.hasServerRuntime).mockReturnValue(true);
        vi.mocked(serverRuntimes.getServerRuntime).mockResolvedValue({
          doThing: mockMethod,
        });

        const payload: ChatToolPayload = {
          ...basePayload,
          identifier: 'cloud-sandbox',
          apiName: 'doThing',
          arguments: '{}',
        };

        const result = await executor.execute(payload, baseContext);

        expect(result.success).toBe(false);
        expect(result.content).toBe('Runtime failed');
        expect(result.error).toBeInstanceOf(Error);
      });

      it('should pass context to getServerRuntime', async () => {
        const context: ToolExecutionContext = {
          serverDB: {} as any,
          toolManifestMap: {},
          topicId: 'topic-1',
          userId: 'user-1',
        };

        vi.mocked(serverRuntimes.hasServerRuntime).mockReturnValue(true);
        vi.mocked(serverRuntimes.getServerRuntime).mockResolvedValue({
          create: vi.fn().mockResolvedValue({ content: 'created', success: true }),
        });

        const payload: ChatToolPayload = {
          ...basePayload,
          identifier: 'lobe-notebook',
          apiName: 'create',
          arguments: '{}',
        };

        await executor.execute(payload, context);

        expect(serverRuntimes.getServerRuntime).toHaveBeenCalledWith('lobe-notebook', context);
      });
    });
  });
});
