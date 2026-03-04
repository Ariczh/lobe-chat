import { beforeEach, describe, expect, it, vi } from 'vitest';

import { lambdaClient } from '@/libs/trpc/client';

import { socialService } from './social';

vi.mock('@/libs/trpc/client', () => ({
  lambdaClient: {
    market: {
      social: {
        // Follow
        follow: { mutate: vi.fn() },
        unfollow: { mutate: vi.fn() },
        checkFollowStatus: { query: vi.fn() },
        getFollowCounts: { query: vi.fn() },
        getFollowing: { query: vi.fn() },
        getFollowers: { query: vi.fn() },
        // Favorite
        addFavorite: { mutate: vi.fn() },
        removeFavorite: { mutate: vi.fn() },
        checkFavorite: { query: vi.fn() },
        getMyFavorites: { query: vi.fn() },
        getUserFavoriteAgents: { query: vi.fn() },
        getUserFavoritePlugins: { query: vi.fn() },
        // Like
        like: { mutate: vi.fn() },
        unlike: { mutate: vi.fn() },
        checkLike: { query: vi.fn() },
        toggleLike: { mutate: vi.fn() },
        getUserLikedAgents: { query: vi.fn() },
        getUserLikedPlugins: { query: vi.fn() },
      },
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SocialService', () => {
  describe('setAccessToken', () => {
    it('should be a no-op and not throw', () => {
      expect(() => socialService.setAccessToken('some-token')).not.toThrow();
      expect(() => socialService.setAccessToken(undefined)).not.toThrow();
    });
  });

  // ==================== Follow ====================

  describe('follow', () => {
    it('should call lambdaClient.market.social.follow.mutate with followingId', async () => {
      vi.spyOn(lambdaClient.market.social.follow, 'mutate').mockResolvedValue(undefined as any);

      await socialService.follow(42);

      expect(lambdaClient.market.social.follow.mutate).toHaveBeenCalledWith({ followingId: 42 });
    });

    it('should propagate errors from the API', async () => {
      vi.spyOn(lambdaClient.market.social.follow, 'mutate').mockRejectedValue(
        new Error('Network error'),
      );

      await expect(socialService.follow(42)).rejects.toThrow('Network error');
    });
  });

  describe('unfollow', () => {
    it('should call lambdaClient.market.social.unfollow.mutate with followingId', async () => {
      vi.spyOn(lambdaClient.market.social.unfollow, 'mutate').mockResolvedValue(undefined as any);

      await socialService.unfollow(99);

      expect(lambdaClient.market.social.unfollow.mutate).toHaveBeenCalledWith({ followingId: 99 });
    });
  });

  describe('checkFollowStatus', () => {
    it('should return follow status for a given userId', async () => {
      const mockStatus = { isFollowing: true, isMutual: false };
      vi.spyOn(lambdaClient.market.social.checkFollowStatus, 'query').mockResolvedValue(
        mockStatus as any,
      );

      const result = await socialService.checkFollowStatus(10);

      expect(lambdaClient.market.social.checkFollowStatus.query).toHaveBeenCalledWith({
        targetUserId: 10,
      });
      expect(result).toEqual(mockStatus);
    });

    it('should return mutual follow status', async () => {
      const mockStatus = { isFollowing: true, isMutual: true };
      vi.spyOn(lambdaClient.market.social.checkFollowStatus, 'query').mockResolvedValue(
        mockStatus as any,
      );

      const result = await socialService.checkFollowStatus(5);

      expect(result.isMutual).toBe(true);
    });
  });

  describe('getFollowCounts', () => {
    it('should return follow counts for a given userId', async () => {
      const mockCounts = { followersCount: 100, followingCount: 50 };
      vi.spyOn(lambdaClient.market.social.getFollowCounts, 'query').mockResolvedValue(
        mockCounts as any,
      );

      const result = await socialService.getFollowCounts(7);

      expect(lambdaClient.market.social.getFollowCounts.query).toHaveBeenCalledWith({ userId: 7 });
      expect(result).toEqual(mockCounts);
    });
  });

  describe('getFollowing', () => {
    it('should call query without pagination params when none provided', async () => {
      const mockResponse = {
        currentPage: 1,
        items: [],
        pageSize: 10,
        totalCount: 0,
        totalPages: 0,
      };
      vi.spyOn(lambdaClient.market.social.getFollowing, 'query').mockResolvedValue(
        mockResponse as any,
      );

      await socialService.getFollowing(3);

      expect(lambdaClient.market.social.getFollowing.query).toHaveBeenCalledWith({
        limit: undefined,
        offset: undefined,
        userId: 3,
      });
    });

    it('should convert page/pageSize to limit/offset correctly', async () => {
      vi.spyOn(lambdaClient.market.social.getFollowing, 'query').mockResolvedValue({} as any);

      await socialService.getFollowing(3, { page: 2, pageSize: 20 });

      expect(lambdaClient.market.social.getFollowing.query).toHaveBeenCalledWith({
        limit: 20,
        offset: 20, // (page - 1) * pageSize = (2 - 1) * 20 = 20
        userId: 3,
      });
    });

    it('should use offset=0 for page 1', async () => {
      vi.spyOn(lambdaClient.market.social.getFollowing, 'query').mockResolvedValue({} as any);

      await socialService.getFollowing(3, { page: 1, pageSize: 10 });

      expect(lambdaClient.market.social.getFollowing.query).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        userId: 3,
      });
    });

    it('should pass undefined offset when page is not provided', async () => {
      vi.spyOn(lambdaClient.market.social.getFollowing, 'query').mockResolvedValue({} as any);

      await socialService.getFollowing(3, { pageSize: 15 });

      expect(lambdaClient.market.social.getFollowing.query).toHaveBeenCalledWith({
        limit: 15,
        offset: undefined,
        userId: 3,
      });
    });
  });

  describe('getFollowers', () => {
    it('should call query with correct pagination params', async () => {
      vi.spyOn(lambdaClient.market.social.getFollowers, 'query').mockResolvedValue({} as any);

      await socialService.getFollowers(5, { page: 3, pageSize: 10 });

      expect(lambdaClient.market.social.getFollowers.query).toHaveBeenCalledWith({
        limit: 10,
        offset: 20, // (3 - 1) * 10 = 20
        userId: 5,
      });
    });

    it('should call query with no pagination when not provided', async () => {
      vi.spyOn(lambdaClient.market.social.getFollowers, 'query').mockResolvedValue({} as any);

      await socialService.getFollowers(5);

      expect(lambdaClient.market.social.getFollowers.query).toHaveBeenCalledWith({
        limit: undefined,
        offset: undefined,
        userId: 5,
      });
    });
  });

  // ==================== Favorite ====================

  describe('addFavorite', () => {
    it('should call mutate with targetId when given a numeric identifier', async () => {
      vi.spyOn(lambdaClient.market.social.addFavorite, 'mutate').mockResolvedValue(
        undefined as any,
      );

      await socialService.addFavorite('agent', 123);

      expect(lambdaClient.market.social.addFavorite.mutate).toHaveBeenCalledWith({
        targetId: 123,
        targetType: 'agent',
      });
    });

    it('should call mutate with identifier when given a string identifier', async () => {
      vi.spyOn(lambdaClient.market.social.addFavorite, 'mutate').mockResolvedValue(
        undefined as any,
      );

      await socialService.addFavorite('agent', 'my-agent-identifier');

      expect(lambdaClient.market.social.addFavorite.mutate).toHaveBeenCalledWith({
        identifier: 'my-agent-identifier',
        targetType: 'agent',
      });
    });

    it('should support plugin target type', async () => {
      vi.spyOn(lambdaClient.market.social.addFavorite, 'mutate').mockResolvedValue(
        undefined as any,
      );

      await socialService.addFavorite('plugin', 'plugin-id');

      expect(lambdaClient.market.social.addFavorite.mutate).toHaveBeenCalledWith({
        identifier: 'plugin-id',
        targetType: 'plugin',
      });
    });

    it('should support agent-group target type with numeric id', async () => {
      vi.spyOn(lambdaClient.market.social.addFavorite, 'mutate').mockResolvedValue(
        undefined as any,
      );

      await socialService.addFavorite('agent-group', 456);

      expect(lambdaClient.market.social.addFavorite.mutate).toHaveBeenCalledWith({
        targetId: 456,
        targetType: 'agent-group',
      });
    });
  });

  describe('removeFavorite', () => {
    it('should call mutate with targetId when given a number', async () => {
      vi.spyOn(lambdaClient.market.social.removeFavorite, 'mutate').mockResolvedValue(
        undefined as any,
      );

      await socialService.removeFavorite('agent', 99);

      expect(lambdaClient.market.social.removeFavorite.mutate).toHaveBeenCalledWith({
        targetId: 99,
        targetType: 'agent',
      });
    });

    it('should call mutate with identifier when given a string', async () => {
      vi.spyOn(lambdaClient.market.social.removeFavorite, 'mutate').mockResolvedValue(
        undefined as any,
      );

      await socialService.removeFavorite('plugin', 'plugin-slug');

      expect(lambdaClient.market.social.removeFavorite.mutate).toHaveBeenCalledWith({
        identifier: 'plugin-slug',
        targetType: 'plugin',
      });
    });
  });

  describe('checkFavoriteStatus', () => {
    it('should return favorite status for a numeric target', async () => {
      const mockStatus = { isFavorited: true };
      vi.spyOn(lambdaClient.market.social.checkFavorite, 'query').mockResolvedValue(
        mockStatus as any,
      );

      const result = await socialService.checkFavoriteStatus('agent', 10);

      expect(lambdaClient.market.social.checkFavorite.query).toHaveBeenCalledWith({
        targetIdOrIdentifier: 10,
        targetType: 'agent',
      });
      expect(result).toEqual(mockStatus);
    });

    it('should return favorite status for a string identifier', async () => {
      const mockStatus = { isFavorited: false };
      vi.spyOn(lambdaClient.market.social.checkFavorite, 'query').mockResolvedValue(
        mockStatus as any,
      );

      const result = await socialService.checkFavoriteStatus('plugin', 'my-plugin');

      expect(lambdaClient.market.social.checkFavorite.query).toHaveBeenCalledWith({
        targetIdOrIdentifier: 'my-plugin',
        targetType: 'plugin',
      });
      expect(result).toEqual(mockStatus);
    });
  });

  describe('getMyFavorites', () => {
    it('should call query without pagination when not provided', async () => {
      const mockResponse = {
        currentPage: 1,
        items: [],
        pageSize: 10,
        totalCount: 0,
        totalPages: 0,
      };
      vi.spyOn(lambdaClient.market.social.getMyFavorites, 'query').mockResolvedValue(
        mockResponse as any,
      );

      await socialService.getMyFavorites();

      expect(lambdaClient.market.social.getMyFavorites.query).toHaveBeenCalledWith({
        limit: undefined,
        offset: undefined,
      });
    });

    it('should convert page/pageSize to limit/offset', async () => {
      vi.spyOn(lambdaClient.market.social.getMyFavorites, 'query').mockResolvedValue({} as any);

      await socialService.getMyFavorites({ page: 2, pageSize: 5 });

      expect(lambdaClient.market.social.getMyFavorites.query).toHaveBeenCalledWith({
        limit: 5,
        offset: 5, // (2 - 1) * 5 = 5
      });
    });
  });

  describe('getUserFavoriteAgents', () => {
    it('should call query with userId and converted pagination', async () => {
      vi.spyOn(lambdaClient.market.social.getUserFavoriteAgents, 'query').mockResolvedValue(
        {} as any,
      );

      await socialService.getUserFavoriteAgents(12, { page: 3, pageSize: 10 });

      expect(lambdaClient.market.social.getUserFavoriteAgents.query).toHaveBeenCalledWith({
        limit: 10,
        offset: 20,
        userId: 12,
      });
    });
  });

  describe('getUserFavoritePlugins', () => {
    it('should call query with userId and pagination', async () => {
      vi.spyOn(lambdaClient.market.social.getUserFavoritePlugins, 'query').mockResolvedValue(
        {} as any,
      );

      await socialService.getUserFavoritePlugins(8, { page: 1, pageSize: 20 });

      expect(lambdaClient.market.social.getUserFavoritePlugins.query).toHaveBeenCalledWith({
        limit: 20,
        offset: 0,
        userId: 8,
      });
    });
  });

  // ==================== Like ====================

  describe('like', () => {
    it('should call mutate with targetId when given a number', async () => {
      vi.spyOn(lambdaClient.market.social.like, 'mutate').mockResolvedValue(undefined as any);

      await socialService.like('agent', 77);

      expect(lambdaClient.market.social.like.mutate).toHaveBeenCalledWith({
        targetId: 77,
        targetType: 'agent',
      });
    });

    it('should call mutate with identifier when given a string', async () => {
      vi.spyOn(lambdaClient.market.social.like, 'mutate').mockResolvedValue(undefined as any);

      await socialService.like('plugin', 'cool-plugin');

      expect(lambdaClient.market.social.like.mutate).toHaveBeenCalledWith({
        identifier: 'cool-plugin',
        targetType: 'plugin',
      });
    });
  });

  describe('unlike', () => {
    it('should call mutate with targetId when given a number', async () => {
      vi.spyOn(lambdaClient.market.social.unlike, 'mutate').mockResolvedValue(undefined as any);

      await socialService.unlike('agent', 88);

      expect(lambdaClient.market.social.unlike.mutate).toHaveBeenCalledWith({
        targetId: 88,
        targetType: 'agent',
      });
    });

    it('should call mutate with identifier when given a string', async () => {
      vi.spyOn(lambdaClient.market.social.unlike, 'mutate').mockResolvedValue(undefined as any);

      await socialService.unlike('agent-group', 'group-abc');

      expect(lambdaClient.market.social.unlike.mutate).toHaveBeenCalledWith({
        identifier: 'group-abc',
        targetType: 'agent-group',
      });
    });
  });

  describe('checkLikeStatus', () => {
    it('should return like status for a numeric target', async () => {
      const mockStatus = { isLiked: true };
      vi.spyOn(lambdaClient.market.social.checkLike, 'query').mockResolvedValue(mockStatus as any);

      const result = await socialService.checkLikeStatus('agent', 20);

      expect(lambdaClient.market.social.checkLike.query).toHaveBeenCalledWith({
        targetIdOrIdentifier: 20,
        targetType: 'agent',
      });
      expect(result).toEqual(mockStatus);
    });

    it('should return like status for a string identifier', async () => {
      const mockStatus = { isLiked: false };
      vi.spyOn(lambdaClient.market.social.checkLike, 'query').mockResolvedValue(mockStatus as any);

      const result = await socialService.checkLikeStatus('plugin', 'awesome-plugin');

      expect(lambdaClient.market.social.checkLike.query).toHaveBeenCalledWith({
        targetIdOrIdentifier: 'awesome-plugin',
        targetType: 'plugin',
      });
      expect(result).toEqual(mockStatus);
    });
  });

  describe('toggleLike', () => {
    it('should call mutate with targetId and return toggled result (liked)', async () => {
      const mockResult = { liked: true };
      vi.spyOn(lambdaClient.market.social.toggleLike, 'mutate').mockResolvedValue(
        mockResult as any,
      );

      const result = await socialService.toggleLike('agent', 30);

      expect(lambdaClient.market.social.toggleLike.mutate).toHaveBeenCalledWith({
        targetId: 30,
        targetType: 'agent',
      });
      expect(result).toEqual(mockResult);
    });

    it('should call mutate with identifier and return toggled result (unliked)', async () => {
      const mockResult = { liked: false };
      vi.spyOn(lambdaClient.market.social.toggleLike, 'mutate').mockResolvedValue(
        mockResult as any,
      );

      const result = await socialService.toggleLike('plugin', 'some-plugin');

      expect(lambdaClient.market.social.toggleLike.mutate).toHaveBeenCalledWith({
        identifier: 'some-plugin',
        targetType: 'plugin',
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('getUserLikedAgents', () => {
    it('should call query with userId and converted pagination', async () => {
      vi.spyOn(lambdaClient.market.social.getUserLikedAgents, 'query').mockResolvedValue({} as any);

      await socialService.getUserLikedAgents(15, { page: 2, pageSize: 5 });

      expect(lambdaClient.market.social.getUserLikedAgents.query).toHaveBeenCalledWith({
        limit: 5,
        offset: 5, // (2 - 1) * 5
        userId: 15,
      });
    });

    it('should call query without pagination when not provided', async () => {
      vi.spyOn(lambdaClient.market.social.getUserLikedAgents, 'query').mockResolvedValue({} as any);

      await socialService.getUserLikedAgents(15);

      expect(lambdaClient.market.social.getUserLikedAgents.query).toHaveBeenCalledWith({
        limit: undefined,
        offset: undefined,
        userId: 15,
      });
    });
  });

  describe('getUserLikedPlugins', () => {
    it('should call query with userId and correct pagination offset calculation', async () => {
      vi.spyOn(lambdaClient.market.social.getUserLikedPlugins, 'query').mockResolvedValue(
        {} as any,
      );

      await socialService.getUserLikedPlugins(22, { page: 4, pageSize: 10 });

      expect(lambdaClient.market.social.getUserLikedPlugins.query).toHaveBeenCalledWith({
        limit: 10,
        offset: 30, // (4 - 1) * 10 = 30
        userId: 22,
      });
    });
  });
});
