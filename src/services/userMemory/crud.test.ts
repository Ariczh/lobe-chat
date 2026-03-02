import { beforeEach, describe, expect, it, vi } from 'vitest';

import { memoryCRUDService } from './crud';

const mockLambdaClient = vi.hoisted(() => ({
  userMemory: {
    createIdentity: { mutate: vi.fn() },
    deleteIdentity: { mutate: vi.fn() },
    getIdentities: { query: vi.fn() },
    updateIdentity: { mutate: vi.fn() },
    deleteContext: { mutate: vi.fn() },
    getContexts: { query: vi.fn() },
    updateContext: { mutate: vi.fn() },
    deleteActivity: { mutate: vi.fn() },
    getActivities: { query: vi.fn() },
    updateActivity: { mutate: vi.fn() },
    deleteExperience: { mutate: vi.fn() },
    getExperiences: { query: vi.fn() },
    updateExperience: { mutate: vi.fn() },
    deletePreference: { mutate: vi.fn() },
    getPreferences: { query: vi.fn() },
    updatePreference: { mutate: vi.fn() },
  },
}));

vi.mock('@/libs/trpc/client', () => ({
  lambdaClient: mockLambdaClient,
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('MemoryCRUDService', () => {
  // ============ Identity CRUD ============

  describe('createIdentity', () => {
    it('should call createIdentity.mutate with data', async () => {
      const data = { name: 'John Doe', relationship: 'self' } as any;
      const mockResult = { id: 'id-1', name: 'John Doe' };
      mockLambdaClient.userMemory.createIdentity.mutate.mockResolvedValueOnce(mockResult);

      const result = await memoryCRUDService.createIdentity(data);

      expect(mockLambdaClient.userMemory.createIdentity.mutate).toHaveBeenCalledWith(data);
      expect(result).toEqual(mockResult);
    });
  });

  describe('deleteIdentity', () => {
    it('should call deleteIdentity.mutate with id', async () => {
      const id = 'id-1';
      mockLambdaClient.userMemory.deleteIdentity.mutate.mockResolvedValueOnce({ success: true });

      await memoryCRUDService.deleteIdentity(id);

      expect(mockLambdaClient.userMemory.deleteIdentity.mutate).toHaveBeenCalledWith({ id });
    });
  });

  describe('getIdentities', () => {
    it('should call getIdentities.query and return results', async () => {
      const mockIdentities = [
        { id: 'id-1', name: 'John' },
        { id: 'id-2', name: 'Jane' },
      ];
      mockLambdaClient.userMemory.getIdentities.query.mockResolvedValueOnce(mockIdentities);

      const result = await memoryCRUDService.getIdentities();

      expect(mockLambdaClient.userMemory.getIdentities.query).toHaveBeenCalled();
      expect(result).toEqual(mockIdentities);
    });

    it('should return empty array when no identities', async () => {
      mockLambdaClient.userMemory.getIdentities.query.mockResolvedValueOnce([]);

      const result = await memoryCRUDService.getIdentities();

      expect(result).toEqual([]);
    });
  });

  describe('updateIdentity', () => {
    it('should call updateIdentity.mutate with id and data', async () => {
      const id = 'id-1';
      const data = { name: 'Jane Doe' } as any;
      const mockResult = { id, name: 'Jane Doe' };
      mockLambdaClient.userMemory.updateIdentity.mutate.mockResolvedValueOnce(mockResult);

      const result = await memoryCRUDService.updateIdentity(id, data);

      expect(mockLambdaClient.userMemory.updateIdentity.mutate).toHaveBeenCalledWith({ data, id });
      expect(result).toEqual(mockResult);
    });
  });

  // ============ Context CRUD ============

  describe('deleteContext', () => {
    it('should call deleteContext.mutate with id', async () => {
      const id = 'ctx-1';
      mockLambdaClient.userMemory.deleteContext.mutate.mockResolvedValueOnce({ success: true });

      await memoryCRUDService.deleteContext(id);

      expect(mockLambdaClient.userMemory.deleteContext.mutate).toHaveBeenCalledWith({ id });
    });
  });

  describe('getContexts', () => {
    it('should call getContexts.query and return results', async () => {
      const mockContexts = [{ id: 'ctx-1', title: 'Work Project' }];
      mockLambdaClient.userMemory.getContexts.query.mockResolvedValueOnce(mockContexts);

      const result = await memoryCRUDService.getContexts();

      expect(mockLambdaClient.userMemory.getContexts.query).toHaveBeenCalled();
      expect(result).toEqual(mockContexts);
    });
  });

  describe('updateContext', () => {
    it('should call updateContext.mutate with id and data', async () => {
      const id = 'ctx-1';
      const data = { title: 'Updated Project', description: 'New description' };
      const mockResult = { id, ...data };
      mockLambdaClient.userMemory.updateContext.mutate.mockResolvedValueOnce(mockResult);

      const result = await memoryCRUDService.updateContext(id, data);

      expect(mockLambdaClient.userMemory.updateContext.mutate).toHaveBeenCalledWith({ data, id });
      expect(result).toEqual(mockResult);
    });

    it('should call updateContext.mutate with partial data', async () => {
      const id = 'ctx-1';
      const data = { currentStatus: 'active' };
      mockLambdaClient.userMemory.updateContext.mutate.mockResolvedValueOnce({});

      await memoryCRUDService.updateContext(id, data);

      expect(mockLambdaClient.userMemory.updateContext.mutate).toHaveBeenCalledWith({ data, id });
    });
  });

  // ============ Activity CRUD ============

  describe('deleteActivity', () => {
    it('should call deleteActivity.mutate with id', async () => {
      const id = 'act-1';
      mockLambdaClient.userMemory.deleteActivity.mutate.mockResolvedValueOnce({ success: true });

      await memoryCRUDService.deleteActivity(id);

      expect(mockLambdaClient.userMemory.deleteActivity.mutate).toHaveBeenCalledWith({ id });
    });
  });

  describe('getActivities', () => {
    it('should call getActivities.query and return results', async () => {
      const mockActivities = [
        { id: 'act-1', narrative: 'Completed sprint review' },
        { id: 'act-2', narrative: 'Attended standup' },
      ];
      mockLambdaClient.userMemory.getActivities.query.mockResolvedValueOnce(mockActivities);

      const result = await memoryCRUDService.getActivities();

      expect(mockLambdaClient.userMemory.getActivities.query).toHaveBeenCalled();
      expect(result).toEqual(mockActivities);
    });
  });

  describe('updateActivity', () => {
    it('should call updateActivity.mutate with id and data', async () => {
      const id = 'act-1';
      const data = { narrative: 'Updated activity', status: 'completed' };
      const mockResult = { id, ...data };
      mockLambdaClient.userMemory.updateActivity.mutate.mockResolvedValueOnce(mockResult);

      const result = await memoryCRUDService.updateActivity(id, data);

      expect(mockLambdaClient.userMemory.updateActivity.mutate).toHaveBeenCalledWith({ data, id });
      expect(result).toEqual(mockResult);
    });

    it('should call updateActivity.mutate with only notes', async () => {
      const id = 'act-1';
      const data = { notes: 'Some notes' };
      mockLambdaClient.userMemory.updateActivity.mutate.mockResolvedValueOnce({});

      await memoryCRUDService.updateActivity(id, data);

      expect(mockLambdaClient.userMemory.updateActivity.mutate).toHaveBeenCalledWith({ data, id });
    });
  });

  // ============ Experience CRUD ============

  describe('deleteExperience', () => {
    it('should call deleteExperience.mutate with id', async () => {
      const id = 'exp-1';
      mockLambdaClient.userMemory.deleteExperience.mutate.mockResolvedValueOnce({ success: true });

      await memoryCRUDService.deleteExperience(id);

      expect(mockLambdaClient.userMemory.deleteExperience.mutate).toHaveBeenCalledWith({ id });
    });
  });

  describe('getExperiences', () => {
    it('should call getExperiences.query and return results', async () => {
      const mockExperiences = [{ id: 'exp-1', situation: 'Production incident', action: 'Fixed' }];
      mockLambdaClient.userMemory.getExperiences.query.mockResolvedValueOnce(mockExperiences);

      const result = await memoryCRUDService.getExperiences();

      expect(mockLambdaClient.userMemory.getExperiences.query).toHaveBeenCalled();
      expect(result).toEqual(mockExperiences);
    });
  });

  describe('updateExperience', () => {
    it('should call updateExperience.mutate with id and data', async () => {
      const id = 'exp-1';
      const data = { keyLearning: 'Always test before deploy', action: 'Rollback' };
      const mockResult = { id, ...data };
      mockLambdaClient.userMemory.updateExperience.mutate.mockResolvedValueOnce(mockResult);

      const result = await memoryCRUDService.updateExperience(id, data);

      expect(mockLambdaClient.userMemory.updateExperience.mutate).toHaveBeenCalledWith({
        data,
        id,
      });
      expect(result).toEqual(mockResult);
    });

    it('should call updateExperience.mutate with situation only', async () => {
      const id = 'exp-1';
      const data = { situation: 'New situation description' };
      mockLambdaClient.userMemory.updateExperience.mutate.mockResolvedValueOnce({});

      await memoryCRUDService.updateExperience(id, data);

      expect(mockLambdaClient.userMemory.updateExperience.mutate).toHaveBeenCalledWith({
        data,
        id,
      });
    });
  });

  // ============ Preference CRUD ============

  describe('deletePreference', () => {
    it('should call deletePreference.mutate with id', async () => {
      const id = 'pref-1';
      mockLambdaClient.userMemory.deletePreference.mutate.mockResolvedValueOnce({ success: true });

      await memoryCRUDService.deletePreference(id);

      expect(mockLambdaClient.userMemory.deletePreference.mutate).toHaveBeenCalledWith({ id });
    });
  });

  describe('getPreferences', () => {
    it('should call getPreferences.query and return results', async () => {
      const mockPreferences = [
        { id: 'pref-1', conclusionDirectives: 'Use TypeScript', suggestions: 'Avoid any' },
      ];
      mockLambdaClient.userMemory.getPreferences.query.mockResolvedValueOnce(mockPreferences);

      const result = await memoryCRUDService.getPreferences();

      expect(mockLambdaClient.userMemory.getPreferences.query).toHaveBeenCalled();
      expect(result).toEqual(mockPreferences);
    });
  });

  describe('updatePreference', () => {
    it('should call updatePreference.mutate with id and data', async () => {
      const id = 'pref-1';
      const data = {
        conclusionDirectives: 'Use strict TypeScript',
        suggestions: 'Avoid any type',
      };
      const mockResult = { id, ...data };
      mockLambdaClient.userMemory.updatePreference.mutate.mockResolvedValueOnce(mockResult);

      const result = await memoryCRUDService.updatePreference(id, data);

      expect(mockLambdaClient.userMemory.updatePreference.mutate).toHaveBeenCalledWith({
        data,
        id,
      });
      expect(result).toEqual(mockResult);
    });

    it('should call updatePreference.mutate with only suggestions', async () => {
      const id = 'pref-1';
      const data = { suggestions: 'Use functional components' };
      mockLambdaClient.userMemory.updatePreference.mutate.mockResolvedValueOnce({});

      await memoryCRUDService.updatePreference(id, data);

      expect(mockLambdaClient.userMemory.updatePreference.mutate).toHaveBeenCalledWith({
        data,
        id,
      });
    });
  });
});
