import { beforeEach, describe, expect, it, vi } from 'vitest';

import { memoryExtractionService } from './extraction';

const mockLambdaClient = vi.hoisted(() => ({
  userMemory: {
    requestMemoryFromChatTopic: { mutate: vi.fn() },
    getMemoryExtractionTask: { query: vi.fn() },
  },
}));

vi.mock('@/libs/trpc/client', () => ({
  lambdaClient: mockLambdaClient,
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('MemoryExtractionService', () => {
  describe('requestFromChatTopics', () => {
    it('should call requestMemoryFromChatTopic.mutate with date range params', async () => {
      const fromDate = new Date('2024-01-01');
      const toDate = new Date('2024-01-31');
      const params = { fromDate, toDate };
      const mockResult = {
        id: 'task-1',
        status: 'pending',
        metadata: {},
        deduped: false,
      };
      mockLambdaClient.userMemory.requestMemoryFromChatTopic.mutate.mockResolvedValueOnce(
        mockResult,
      );

      const result = await memoryExtractionService.requestFromChatTopics(params);

      expect(mockLambdaClient.userMemory.requestMemoryFromChatTopic.mutate).toHaveBeenCalledWith(
        params,
      );
      expect(result).toEqual(mockResult);
    });

    it('should call requestMemoryFromChatTopic.mutate without date params', async () => {
      const params = {};
      const mockResult = {
        id: 'task-2',
        status: 'pending',
        metadata: {},
        deduped: false,
      };
      mockLambdaClient.userMemory.requestMemoryFromChatTopic.mutate.mockResolvedValueOnce(
        mockResult,
      );

      const result = await memoryExtractionService.requestFromChatTopics(params);

      expect(mockLambdaClient.userMemory.requestMemoryFromChatTopic.mutate).toHaveBeenCalledWith(
        params,
      );
      expect(result).toEqual(mockResult);
    });

    it('should return deduped=true when extraction already in progress', async () => {
      const params = { fromDate: new Date('2024-01-01') };
      const mockResult = {
        id: 'task-existing',
        status: 'processing',
        metadata: {},
        deduped: true,
      };
      mockLambdaClient.userMemory.requestMemoryFromChatTopic.mutate.mockResolvedValueOnce(
        mockResult,
      );

      const result = await memoryExtractionService.requestFromChatTopics(params);

      expect(result.deduped).toBe(true);
      expect(result.id).toBe('task-existing');
    });
  });

  describe('getTask', () => {
    it('should call getMemoryExtractionTask.query with taskId when provided', async () => {
      const taskId = 'task-123';
      const mockTask = {
        id: taskId,
        status: 'completed',
        metadata: { processedTopics: 10 },
        error: null,
      };
      mockLambdaClient.userMemory.getMemoryExtractionTask.query.mockResolvedValueOnce(mockTask);

      const result = await memoryExtractionService.getTask(taskId);

      expect(mockLambdaClient.userMemory.getMemoryExtractionTask.query).toHaveBeenCalledWith({
        taskId,
      });
      expect(result).toEqual(mockTask);
    });

    it('should call getMemoryExtractionTask.query without params when taskId not provided', async () => {
      const mockTask = {
        id: 'latest-task',
        status: 'pending',
        metadata: {},
        error: null,
      };
      mockLambdaClient.userMemory.getMemoryExtractionTask.query.mockResolvedValueOnce(mockTask);

      const result = await memoryExtractionService.getTask();

      expect(mockLambdaClient.userMemory.getMemoryExtractionTask.query).toHaveBeenCalledWith(
        undefined,
      );
      expect(result).toEqual(mockTask);
    });

    it('should return null when no task found', async () => {
      mockLambdaClient.userMemory.getMemoryExtractionTask.query.mockResolvedValueOnce(null);

      const result = await memoryExtractionService.getTask('non-existent');

      expect(result).toBeNull();
    });

    it('should return task with error when task failed', async () => {
      const taskId = 'failed-task';
      const mockTask = {
        id: taskId,
        status: 'failed',
        metadata: {},
        error: { code: 'EXTRACTION_ERROR', message: 'Failed to extract memories' },
      };
      mockLambdaClient.userMemory.getMemoryExtractionTask.query.mockResolvedValueOnce(mockTask);

      const result = await memoryExtractionService.getTask(taskId);

      expect(result).toEqual(mockTask);
      expect(result?.error).toBeDefined();
      expect(result?.status).toBe('failed');
    });
  });
});
