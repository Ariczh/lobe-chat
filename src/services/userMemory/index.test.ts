import { beforeEach, describe, expect, it, vi } from 'vitest';

import { userMemoryService } from './index';

const mockLambdaClient = vi.hoisted(() => ({
  userMemories: {
    toolAddActivityMemory: { mutate: vi.fn() },
    toolAddContextMemory: { mutate: vi.fn() },
    toolAddExperienceMemory: { mutate: vi.fn() },
    toolAddIdentityMemory: { mutate: vi.fn() },
    toolAddPreferenceMemory: { mutate: vi.fn() },
    toolRemoveIdentityMemory: { mutate: vi.fn() },
    toolUpdateIdentityMemory: { mutate: vi.fn() },
    getMemoryDetail: { query: vi.fn() },
    queryExperiences: { query: vi.fn() },
    queryActivities: { query: vi.fn() },
    queryIdentities: { query: vi.fn() },
    toolSearchMemory: { query: vi.fn() },
    retrieveMemoryForTopic: { query: vi.fn() },
    queryTags: { query: vi.fn() },
    queryIdentityRoles: { query: vi.fn() },
    queryIdentitiesForInjection: { query: vi.fn() },
    queryMemories: { query: vi.fn() },
  },
  userMemory: {
    getPersona: { query: vi.fn() },
  },
}));

vi.mock('@/libs/trpc/client', () => ({
  lambdaClient: mockLambdaClient,
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('UserMemoryService', () => {
  describe('addActivityMemory', () => {
    it('should call toolAddActivityMemory.mutate with params', async () => {
      const params = { narrative: 'test activity', status: 'completed' } as any;
      const mockResult = { id: '123', success: true };
      mockLambdaClient.userMemories.toolAddActivityMemory.mutate.mockResolvedValueOnce(mockResult);

      const result = await userMemoryService.addActivityMemory(params);

      expect(mockLambdaClient.userMemories.toolAddActivityMemory.mutate).toHaveBeenCalledWith(
        params,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('addContextMemory', () => {
    it('should call toolAddContextMemory.mutate with params', async () => {
      const params = { title: 'project context', description: 'working on a new feature' } as any;
      const mockResult = { id: 'ctx-1', success: true };
      mockLambdaClient.userMemories.toolAddContextMemory.mutate.mockResolvedValueOnce(mockResult);

      const result = await userMemoryService.addContextMemory(params);

      expect(mockLambdaClient.userMemories.toolAddContextMemory.mutate).toHaveBeenCalledWith(
        params,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('addExperienceMemory', () => {
    it('should call toolAddExperienceMemory.mutate with params', async () => {
      const params = { situation: 'deployed to prod', action: 'rolled back' } as any;
      const mockResult = { id: 'exp-1', success: true };
      mockLambdaClient.userMemories.toolAddExperienceMemory.mutate.mockResolvedValueOnce(
        mockResult,
      );

      const result = await userMemoryService.addExperienceMemory(params);

      expect(mockLambdaClient.userMemories.toolAddExperienceMemory.mutate).toHaveBeenCalledWith(
        params,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('addIdentityMemory', () => {
    it('should call toolAddIdentityMemory.mutate with params', async () => {
      const params = { name: 'John', attribute: 'software engineer' } as any;
      const mockResult = { id: 'id-1', success: true };
      mockLambdaClient.userMemories.toolAddIdentityMemory.mutate.mockResolvedValueOnce(mockResult);

      const result = await userMemoryService.addIdentityMemory(params);

      expect(mockLambdaClient.userMemories.toolAddIdentityMemory.mutate).toHaveBeenCalledWith(
        params,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('addPreferenceMemory', () => {
    it('should call toolAddPreferenceMemory.mutate with params', async () => {
      const params = { category: 'coding', preference: 'TypeScript over JavaScript' } as any;
      const mockResult = { id: 'pref-1', success: true };
      mockLambdaClient.userMemories.toolAddPreferenceMemory.mutate.mockResolvedValueOnce(
        mockResult,
      );

      const result = await userMemoryService.addPreferenceMemory(params);

      expect(mockLambdaClient.userMemories.toolAddPreferenceMemory.mutate).toHaveBeenCalledWith(
        params,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('removeIdentityMemory', () => {
    it('should call toolRemoveIdentityMemory.mutate with params', async () => {
      const params = { id: 'id-1' } as any;
      const mockResult = { success: true };
      mockLambdaClient.userMemories.toolRemoveIdentityMemory.mutate.mockResolvedValueOnce(
        mockResult,
      );

      const result = await userMemoryService.removeIdentityMemory(params);

      expect(mockLambdaClient.userMemories.toolRemoveIdentityMemory.mutate).toHaveBeenCalledWith(
        params,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateIdentityMemory', () => {
    it('should call toolUpdateIdentityMemory.mutate with params', async () => {
      const params = { id: 'id-1', name: 'Jane' } as any;
      const mockResult = { success: true };
      mockLambdaClient.userMemories.toolUpdateIdentityMemory.mutate.mockResolvedValueOnce(
        mockResult,
      );

      const result = await userMemoryService.updateIdentityMemory(params);

      expect(mockLambdaClient.userMemories.toolUpdateIdentityMemory.mutate).toHaveBeenCalledWith(
        params,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getMemoryDetail', () => {
    it('should call getMemoryDetail.query with id and layer params', async () => {
      const params = { id: 'mem-1', layer: 'identity' as any };
      const mockResult = { id: 'mem-1', content: 'detail content' };
      mockLambdaClient.userMemories.getMemoryDetail.query.mockResolvedValueOnce(mockResult);

      const result = await userMemoryService.getMemoryDetail(params);

      expect(mockLambdaClient.userMemories.getMemoryDetail.query).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getPersona', () => {
    it('should call userMemory.getPersona.query', async () => {
      const mockPersona = { name: 'John', traits: ['curious', 'analytical'] };
      mockLambdaClient.userMemory.getPersona.query.mockResolvedValueOnce(mockPersona);

      const result = await userMemoryService.getPersona();

      expect(mockLambdaClient.userMemory.getPersona.query).toHaveBeenCalled();
      expect(result).toEqual(mockPersona);
    });
  });

  describe('queryExperiences', () => {
    it('should call queryExperiences.query with params', async () => {
      const params = { page: 1, pageSize: 10 };
      const mockResult = { items: [], total: 0 };
      mockLambdaClient.userMemories.queryExperiences.query.mockResolvedValueOnce(mockResult);

      const result = await userMemoryService.queryExperiences(params);

      expect(mockLambdaClient.userMemories.queryExperiences.query).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResult);
    });

    it('should call queryExperiences.query without params', async () => {
      const mockResult = { items: [], total: 0 };
      mockLambdaClient.userMemories.queryExperiences.query.mockResolvedValueOnce(mockResult);

      const result = await userMemoryService.queryExperiences();

      expect(mockLambdaClient.userMemories.queryExperiences.query).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockResult);
    });
  });

  describe('queryActivities', () => {
    it('should call queryActivities.query with params', async () => {
      const params = { page: 2, pageSize: 20 };
      const mockResult = { items: [{ id: 'act-1' }], total: 1 };
      mockLambdaClient.userMemories.queryActivities.query.mockResolvedValueOnce(mockResult);

      const result = await userMemoryService.queryActivities(params);

      expect(mockLambdaClient.userMemories.queryActivities.query).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResult);
    });

    it('should call queryActivities.query without params', async () => {
      const mockResult = { items: [], total: 0 };
      mockLambdaClient.userMemories.queryActivities.query.mockResolvedValueOnce(mockResult);

      await userMemoryService.queryActivities();

      expect(mockLambdaClient.userMemories.queryActivities.query).toHaveBeenCalledWith(undefined);
    });
  });

  describe('queryIdentities', () => {
    it('should call queryIdentities.query with params', async () => {
      const params = { page: 1, pageSize: 5 };
      const mockResult = { items: [], total: 0 };
      mockLambdaClient.userMemories.queryIdentities.query.mockResolvedValueOnce(mockResult);

      const result = await userMemoryService.queryIdentities(params);

      expect(mockLambdaClient.userMemories.queryIdentities.query).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResult);
    });
  });

  describe('retrieveMemory', () => {
    it('should call toolSearchMemory.query with params', async () => {
      const params = { query: 'programming preferences' } as any;
      const mockResult = { items: [{ id: 'mem-1', score: 0.9 }] };
      mockLambdaClient.userMemories.toolSearchMemory.query.mockResolvedValueOnce(mockResult);

      const result = await userMemoryService.retrieveMemory(params);

      expect(mockLambdaClient.userMemories.toolSearchMemory.query).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResult);
    });
  });

  describe('retrieveMemoryForTopic', () => {
    it('should call retrieveMemoryForTopic.query with topicId', async () => {
      const topicId = 'topic-123';
      const mockResult = { items: [{ id: 'mem-2', score: 0.8 }] };
      mockLambdaClient.userMemories.retrieveMemoryForTopic.query.mockResolvedValueOnce(mockResult);

      const result = await userMemoryService.retrieveMemoryForTopic(topicId);

      expect(mockLambdaClient.userMemories.retrieveMemoryForTopic.query).toHaveBeenCalledWith({
        topicId,
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('searchMemory', () => {
    it('should call toolSearchMemory.query with params', async () => {
      const params = { query: 'favorite tools' } as any;
      const mockResult = { items: [] };
      mockLambdaClient.userMemories.toolSearchMemory.query.mockResolvedValueOnce(mockResult);

      const result = await userMemoryService.searchMemory(params);

      expect(mockLambdaClient.userMemories.toolSearchMemory.query).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResult);
    });

    it('retrieveMemory and searchMemory both use toolSearchMemory.query', async () => {
      const params = { query: 'test' } as any;
      mockLambdaClient.userMemories.toolSearchMemory.query
        .mockResolvedValueOnce({ items: [{ id: 'a' }] })
        .mockResolvedValueOnce({ items: [{ id: 'b' }] });

      const r1 = await userMemoryService.retrieveMemory(params);
      const r2 = await userMemoryService.searchMemory(params);

      expect(r1).toEqual({ items: [{ id: 'a' }] });
      expect(r2).toEqual({ items: [{ id: 'b' }] });
      expect(mockLambdaClient.userMemories.toolSearchMemory.query).toHaveBeenCalledTimes(2);
    });
  });

  describe('queryTags', () => {
    it('should call queryTags.query with params', async () => {
      const params = { layers: ['identity' as any], page: 1, size: 10 };
      const mockResult = ['tag1', 'tag2'];
      mockLambdaClient.userMemories.queryTags.query.mockResolvedValueOnce(mockResult);

      const result = await userMemoryService.queryTags(params);

      expect(mockLambdaClient.userMemories.queryTags.query).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResult);
    });

    it('should call queryTags.query without params', async () => {
      const mockResult = [];
      mockLambdaClient.userMemories.queryTags.query.mockResolvedValueOnce(mockResult);

      await userMemoryService.queryTags();

      expect(mockLambdaClient.userMemories.queryTags.query).toHaveBeenCalledWith(undefined);
    });
  });

  describe('queryIdentityRoles', () => {
    it('should call queryIdentityRoles.query with params', async () => {
      const params = { page: 1, size: 5 };
      const mockResult = ['developer', 'team-lead'];
      mockLambdaClient.userMemories.queryIdentityRoles.query.mockResolvedValueOnce(mockResult);

      const result = await userMemoryService.queryIdentityRoles(params);

      expect(mockLambdaClient.userMemories.queryIdentityRoles.query).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResult);
    });
  });

  describe('queryIdentitiesForInjection', () => {
    it('should call queryIdentitiesForInjection.query with limit param', async () => {
      const params = { limit: 5 };
      const mockResult = [{ id: 'id-1', name: 'John' }];
      mockLambdaClient.userMemories.queryIdentitiesForInjection.query.mockResolvedValueOnce(
        mockResult,
      );

      const result = await userMemoryService.queryIdentitiesForInjection(params);

      expect(mockLambdaClient.userMemories.queryIdentitiesForInjection.query).toHaveBeenCalledWith(
        params,
      );
      expect(result).toEqual(mockResult);
    });

    it('should call queryIdentitiesForInjection.query without params', async () => {
      const mockResult = [];
      mockLambdaClient.userMemories.queryIdentitiesForInjection.query.mockResolvedValueOnce(
        mockResult,
      );

      await userMemoryService.queryIdentitiesForInjection();

      expect(mockLambdaClient.userMemories.queryIdentitiesForInjection.query).toHaveBeenCalledWith(
        undefined,
      );
    });
  });

  describe('queryMemories', () => {
    it('should call queryMemories.query with all params', async () => {
      const params = {
        categories: ['preference'],
        layer: 'identity' as any,
        order: 'desc' as const,
        page: 1,
        pageSize: 20,
        q: 'search term',
        sort: 'capturedAt' as const,
        status: ['active'],
        tags: ['coding'],
        types: ['fact' as any],
      };
      const mockResult = { items: [], total: 0 };
      mockLambdaClient.userMemories.queryMemories.query.mockResolvedValueOnce(mockResult);

      const result = await userMemoryService.queryMemories(params);

      expect(mockLambdaClient.userMemories.queryMemories.query).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResult);
    });

    it('should call queryMemories.query without params', async () => {
      const mockResult = { items: [], total: 0 };
      mockLambdaClient.userMemories.queryMemories.query.mockResolvedValueOnce(mockResult);

      await userMemoryService.queryMemories();

      expect(mockLambdaClient.userMemories.queryMemories.query).toHaveBeenCalledWith(undefined);
    });

    it('should return memories matching search query', async () => {
      const params = { q: 'typescript' };
      const mockResult = {
        items: [{ id: 'mem-1', content: 'Prefers TypeScript', layer: 'preference' }],
        total: 1,
      };
      mockLambdaClient.userMemories.queryMemories.query.mockResolvedValueOnce(mockResult);

      const result = await userMemoryService.queryMemories(params);

      expect(result).toEqual(mockResult);
    });
  });
});
