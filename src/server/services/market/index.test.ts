// @vitest-environment node
import { type NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { generateTrustedClientToken } from '@/libs/trusted-client';

import { extractAccessToken, MarketService } from './index';

// Mock external dependencies
vi.mock('@lobehub/market-sdk', () => {
  const MockMarketSDK = vi.fn().mockImplementation(() => ({
    feedback: {
      submitFeedback: vi.fn(),
    },
    auth: {
      exchangeOAuthToken: vi.fn(),
      getOAuthHandoff: vi.fn(),
      getUserInfo: vi.fn(),
    },
    connect: {
      listConnections: vi.fn(),
    },
    skills: {
      listTools: vi.fn(),
      callTool: vi.fn(),
    },
    marketSkills: {
      getSkillList: vi.fn(),
      getSkillDetail: vi.fn(),
      getDownloadUrl: vi.fn(),
      downloadSkill: vi.fn(),
      getCategories: vi.fn(),
    },
    plugins: {
      callCloudGateway: vi.fn(),
      runBuildInTool: vi.fn(),
      getPluginManifest: vi.fn(),
      reportInstallation: vi.fn(),
      reportCall: vi.fn(),
      createEvent: vi.fn(),
    },
    agents: {
      getAgentDetail: vi.fn(),
      getAgentList: vi.fn(),
      increaseInstallCount: vi.fn(),
      createEvent: vi.fn(),
    },
    agentGroups: {
      getAgentGroupDetail: vi.fn(),
      getAgentGroupList: vi.fn(),
    },
    user: {
      getUserInfo: vi.fn(),
      register: vi.fn(),
    },
    fetchM2MToken: vi.fn(),
    headers: { 'x-trusted-client': 'mock-token' },
  }));

  return {
    MarketSDK: MockMarketSDK,
    buildTrustedClientPayload: vi.fn().mockReturnValue({ payload: 'mock' }),
    createTrustedClientToken: vi.fn().mockReturnValue('mock-token'),
  };
});

vi.mock('@/libs/trusted-client', () => ({
  generateTrustedClientToken: vi.fn().mockReturnValue('mock-trusted-token'),
  getTrustedClientTokenForSession: vi.fn().mockResolvedValue('mock-session-trusted-token'),
}));

vi.mock('debug', () => ({
  default: vi.fn().mockReturnValue(vi.fn()),
}));

describe('extractAccessToken', () => {
  it('should extract token from a valid Bearer authorization header', () => {
    const req = {
      headers: {
        get: vi.fn().mockImplementation((name: string) => {
          if (name === 'authorization') return 'Bearer my-access-token';
          return null;
        }),
      },
    } as unknown as NextRequest;

    const result = extractAccessToken(req);
    expect(result).toBe('my-access-token');
  });

  it('should return undefined when authorization header is missing', () => {
    const req = {
      headers: {
        get: vi.fn().mockReturnValue(null),
      },
    } as unknown as NextRequest;

    const result = extractAccessToken(req);
    expect(result).toBeUndefined();
  });

  it('should return undefined when authorization header does not start with Bearer', () => {
    const req = {
      headers: {
        get: vi.fn().mockImplementation((name: string) => {
          if (name === 'authorization') return 'Basic dXNlcjpwYXNz';
          return null;
        }),
      },
    } as unknown as NextRequest;

    const result = extractAccessToken(req);
    expect(result).toBeUndefined();
  });

  it('should return empty string when Bearer prefix is present but token is empty', () => {
    const req = {
      headers: {
        get: vi.fn().mockImplementation((name: string) => {
          if (name === 'authorization') return 'Bearer ';
          return null;
        }),
      },
    } as unknown as NextRequest;

    const result = extractAccessToken(req);
    expect(result).toBe('');
  });

  it('should handle token with special characters', () => {
    const token = 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ1c2VyMTIzIn0.signature';
    const req = {
      headers: {
        get: vi.fn().mockImplementation((name: string) => {
          if (name === 'authorization') return `Bearer ${token}`;
          return null;
        }),
      },
    } as unknown as NextRequest;

    const result = extractAccessToken(req);
    expect(result).toBe(token);
  });
});

describe('MarketService', () => {
  let service: MarketService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new MarketService();
  });

  describe('constructor', () => {
    it('should create service with no options', () => {
      const s = new MarketService();
      expect(s.market).toBeDefined();
    });

    it('should create service with accessToken', () => {
      const s = new MarketService({ accessToken: 'test-token' });
      expect(s.market).toBeDefined();
    });

    it('should create service with userInfo (generates trusted token)', () => {
      const s = new MarketService({
        userInfo: { userId: 'user-123', email: 'test@example.com', name: 'Test User' },
      });
      expect(generateTrustedClientToken).toHaveBeenCalledWith({
        userId: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      });
      expect(s.market).toBeDefined();
    });

    it('should prefer trustedClientToken over userInfo when both provided', () => {
      vi.mocked(generateTrustedClientToken).mockClear();
      const s = new MarketService({
        trustedClientToken: 'pre-generated-token',
        userInfo: { userId: 'user-123' },
      });
      // generateTrustedClientToken should NOT be called since trustedClientToken is provided
      expect(generateTrustedClientToken).not.toHaveBeenCalled();
      expect(s.market).toBeDefined();
    });

    it('should create service with clientCredentials', () => {
      const s = new MarketService({
        clientCredentials: { clientId: 'client-id', clientSecret: 'client-secret' },
      });
      expect(s.market).toBeDefined();
    });
  });

  describe('createFromRequest', () => {
    it('should create MarketService from a Next.js request', async () => {
      const req = {
        headers: {
          get: vi.fn().mockImplementation((name: string) => {
            if (name === 'authorization') return 'Bearer request-token';
            return null;
          }),
        },
      } as unknown as NextRequest;

      const s = await MarketService.createFromRequest(req);
      expect(s).toBeInstanceOf(MarketService);
      expect(s.market).toBeDefined();
    });

    it('should create service without access token if header is missing', async () => {
      const req = {
        headers: {
          get: vi.fn().mockReturnValue(null),
        },
      } as unknown as NextRequest;

      const s = await MarketService.createFromRequest(req);
      expect(s).toBeInstanceOf(MarketService);
    });
  });

  describe('submitFeedback', () => {
    it('should submit feedback without screenshot', async () => {
      const mockSubmit = vi.fn().mockResolvedValue({ success: true });
      service.market.feedback.submitFeedback = mockSubmit;

      await service.submitFeedback({
        title: 'Test Issue',
        message: 'This is a test message',
        email: 'user@example.com',
      });

      expect(mockSubmit).toHaveBeenCalledWith({
        clientInfo: undefined,
        email: 'user@example.com',
        message: 'This is a test message',
        title: 'Test Issue',
      });
    });

    it('should append screenshot URL to message when provided', async () => {
      const mockSubmit = vi.fn().mockResolvedValue({ success: true });
      service.market.feedback.submitFeedback = mockSubmit;

      await service.submitFeedback({
        title: 'Bug Report',
        message: 'Something is broken',
        screenshotUrl: 'https://example.com/screenshot.png',
      });

      expect(mockSubmit).toHaveBeenCalledWith({
        clientInfo: undefined,
        email: '',
        message: 'Something is broken\n\n**Screenshot**: https://example.com/screenshot.png',
        title: 'Bug Report',
      });
    });

    it('should use empty string when email is not provided', async () => {
      const mockSubmit = vi.fn().mockResolvedValue({ success: true });
      service.market.feedback.submitFeedback = mockSubmit;

      await service.submitFeedback({
        title: 'Test',
        message: 'Test message',
      });

      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          email: '',
        }),
      );
    });

    it('should pass clientInfo when provided', async () => {
      const mockSubmit = vi.fn().mockResolvedValue({ success: true });
      service.market.feedback.submitFeedback = mockSubmit;

      const clientInfo = {
        userAgent: 'TestBrowser/1.0',
        language: 'en-US',
        url: 'https://app.example.com',
        timezone: 'UTC',
      };

      await service.submitFeedback({
        title: 'Test',
        message: 'Test message',
        clientInfo,
      });

      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          clientInfo,
        }),
      );
    });
  });

  describe('searchSkill', () => {
    it('should transform marketSkills response to expected format', async () => {
      const mockResult = {
        items: [{ id: 'skill-1', name: 'Test Skill' }],
        currentPage: 2,
        pageSize: 10,
        totalCount: 50,
      };
      service.market.marketSkills.getSkillList = vi.fn().mockResolvedValue(mockResult);

      const result = await service.searchSkill({ page: 2, pageSize: 10 });

      expect(result).toEqual({
        items: mockResult.items,
        page: 2,
        pageSize: 10,
        total: 50,
      });
    });

    it('should pass search params to market SDK', async () => {
      const mockGetSkillList = vi.fn().mockResolvedValue({
        items: [],
        currentPage: 1,
        pageSize: 20,
        totalCount: 0,
      });
      service.market.marketSkills.getSkillList = mockGetSkillList;

      await service.searchSkill({
        search: 'test',
        category: 'utilities',
        page: 1,
        pageSize: 20,
        sort: 'stars',
        order: 'desc',
        locale: 'en-US',
      });

      expect(mockGetSkillList).toHaveBeenCalledWith({
        search: 'test',
        category: 'utilities',
        page: 1,
        pageSize: 20,
        sort: 'stars',
        order: 'desc',
        locale: 'en-US',
      });
    });
  });

  describe('getSkillDownloadUrl', () => {
    it('should return the download URL from market SDK', () => {
      const mockUrl = 'https://cdn.example.com/skills/test-skill-1.0.0.zip';
      service.market.marketSkills.getDownloadUrl = vi.fn().mockReturnValue(mockUrl);

      const result = service.getSkillDownloadUrl('test-skill', '1.0.0');

      expect(result).toBe(mockUrl);
      expect(service.market.marketSkills.getDownloadUrl).toHaveBeenCalledWith(
        'test-skill',
        '1.0.0',
      );
    });

    it('should work without version parameter', () => {
      service.market.marketSkills.getDownloadUrl = vi
        .fn()
        .mockReturnValue('https://cdn.example.com/skills/test-skill-latest.zip');

      service.getSkillDownloadUrl('test-skill');

      expect(service.market.marketSkills.getDownloadUrl).toHaveBeenCalledWith(
        'test-skill',
        undefined,
      );
    });
  });

  describe('executeLobehubSkill', () => {
    it('should return success result when skill executes correctly', async () => {
      const mockResponse = {
        success: true,
        data: 'skill output data',
      };
      service.market.skills.callTool = vi.fn().mockResolvedValue(mockResponse);

      const result = await service.executeLobehubSkill({
        provider: 'twitter',
        toolName: 'post_tweet',
        args: { text: 'Hello World' },
      });

      expect(result).toEqual({
        content: 'skill output data',
        success: true,
      });
      expect(service.market.skills.callTool).toHaveBeenCalledWith('twitter', {
        args: { text: 'Hello World' },
        tool: 'post_tweet',
      });
    });

    it('should stringify non-string data in response', async () => {
      const mockResponse = {
        success: true,
        data: { result: 'json object', count: 42 },
      };
      service.market.skills.callTool = vi.fn().mockResolvedValue(mockResponse);

      const result = await service.executeLobehubSkill({
        provider: 'github',
        toolName: 'list_repos',
        args: {},
      });

      expect(result.content).toBe(JSON.stringify({ result: 'json object', count: 42 }));
      expect(result.success).toBe(true);
    });

    it('should return error result when skill throws an exception', async () => {
      const mockError = new Error('Network connection failed');
      service.market.skills.callTool = vi.fn().mockRejectedValue(mockError);

      const result = await service.executeLobehubSkill({
        provider: 'linear',
        toolName: 'create_issue',
        args: { title: 'Test Issue' },
      });

      expect(result).toEqual({
        content: 'Network connection failed',
        error: { code: 'LOBEHUB_SKILL_ERROR', message: 'Network connection failed' },
        success: false,
      });
    });

    it('should handle error and include error code in result', async () => {
      const mockError = new Error('Unexpected API error');
      service.market.skills.callTool = vi.fn().mockRejectedValue(mockError);

      const result = await service.executeLobehubSkill({
        provider: 'test',
        toolName: 'test_tool',
        args: {},
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('LOBEHUB_SKILL_ERROR');
    });
  });

  describe('getLobehubSkillManifests', () => {
    it('should return empty array when no connections found', async () => {
      service.market.connect.listConnections = vi.fn().mockResolvedValue({ connections: [] });

      const result = await service.getLobehubSkillManifests();

      expect(result).toEqual([]);
    });

    it('should return empty array when connections is null/undefined', async () => {
      service.market.connect.listConnections = vi.fn().mockResolvedValue({ connections: null });

      const result = await service.getLobehubSkillManifests();

      expect(result).toEqual([]);
    });

    it('should build manifests for connected skills', async () => {
      service.market.connect.listConnections = vi.fn().mockResolvedValue({
        connections: [
          {
            providerId: 'twitter',
            providerName: 'Twitter',
            icon: '🐦',
          },
        ],
      });

      service.market.skills.listTools = vi.fn().mockResolvedValue({
        tools: [
          {
            name: 'post_tweet',
            description: 'Post a tweet',
            inputSchema: {
              type: 'object',
              properties: { text: { type: 'string' } },
            },
          },
          {
            name: 'get_timeline',
            description: 'Get user timeline',
            inputSchema: {
              type: 'object',
              properties: { count: { type: 'number' } },
            },
          },
        ],
      });

      const result = await service.getLobehubSkillManifests();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        api: [
          {
            description: 'Post a tweet',
            name: 'post_tweet',
            parameters: {
              type: 'object',
              properties: { text: { type: 'string' } },
            },
          },
          {
            description: 'Get user timeline',
            name: 'get_timeline',
            parameters: {
              type: 'object',
              properties: { count: { type: 'number' } },
            },
          },
        ],
        identifier: 'twitter',
        meta: {
          avatar: '🐦',
          description: 'LobeHub Skill: Twitter',
          tags: ['lobehub-skill', 'twitter'],
          title: 'Twitter',
        },
        type: 'builtin',
      });
    });

    it('should skip connections with no providerId', async () => {
      service.market.connect.listConnections = vi.fn().mockResolvedValue({
        connections: [
          { id: 1 }, // missing providerId
          { providerId: 'github', providerName: 'GitHub', icon: '🐙' },
        ],
      });

      service.market.skills.listTools = vi.fn().mockResolvedValue({
        tools: [{ name: 'list_repos', description: 'List repos', inputSchema: {} }],
      });

      const result = await service.getLobehubSkillManifests();

      // Only github connection should be included
      expect(result).toHaveLength(1);
      expect(result[0].identifier).toBe('github');
    });

    it('should skip connections where listTools returns empty tools', async () => {
      service.market.connect.listConnections = vi.fn().mockResolvedValue({
        connections: [{ providerId: 'empty-provider', providerName: 'Empty', icon: '❓' }],
      });

      service.market.skills.listTools = vi.fn().mockResolvedValue({ tools: [] });

      const result = await service.getLobehubSkillManifests();

      expect(result).toEqual([]);
    });

    it('should skip connections where listTools fails and continue with others', async () => {
      service.market.connect.listConnections = vi.fn().mockResolvedValue({
        connections: [
          { providerId: 'failing-provider', providerName: 'Failing', icon: '❌' },
          { providerId: 'working-provider', providerName: 'Working', icon: '✅' },
        ],
      });

      service.market.skills.listTools = vi
        .fn()
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce({
          tools: [{ name: 'tool_1', description: 'A tool', inputSchema: {} }],
        });

      const result = await service.getLobehubSkillManifests();

      expect(result).toHaveLength(1);
      expect(result[0].identifier).toBe('working-provider');
    });

    it('should return empty array when listConnections throws', async () => {
      service.market.connect.listConnections = vi
        .fn()
        .mockRejectedValue(new Error('Connection error'));

      const result = await service.getLobehubSkillManifests();

      expect(result).toEqual([]);
    });

    it('should use providerId as fallback icon when icon is not available', async () => {
      service.market.connect.listConnections = vi.fn().mockResolvedValue({
        connections: [{ providerId: 'linear', providerName: 'Linear' }], // no icon
      });

      service.market.skills.listTools = vi.fn().mockResolvedValue({
        tools: [{ name: 'create_issue', description: 'Create issue', inputSchema: {} }],
      });

      const result = await service.getLobehubSkillManifests();

      expect(result[0].meta.avatar).toBe('🔗'); // default icon
    });
  });

  describe('getSDK', () => {
    it('should return the underlying MarketSDK instance', () => {
      const sdk = service.getSDK();
      expect(sdk).toBe(service.market);
    });
  });

  describe('auth methods', () => {
    it('exchangeAuthorizationCode should call market auth correctly', async () => {
      const mockResult = { accessToken: 'new-token', refreshToken: 'refresh' };
      service.market.auth.exchangeOAuthToken = vi.fn().mockResolvedValue(mockResult);

      const result = await service.exchangeAuthorizationCode({
        clientId: 'client-id',
        code: 'auth-code',
        codeVerifier: 'code-verifier',
        redirectUri: 'https://app.example.com/callback',
      });

      expect(service.market.auth.exchangeOAuthToken).toHaveBeenCalledWith({
        clientId: 'client-id',
        code: 'auth-code',
        codeVerifier: 'code-verifier',
        grantType: 'authorization_code',
        redirectUri: 'https://app.example.com/callback',
      });
      expect(result).toEqual(mockResult);
    });

    it('refreshToken should call market auth with refresh_token grant type', async () => {
      const mockResult = { accessToken: 'refreshed-token' };
      service.market.auth.exchangeOAuthToken = vi.fn().mockResolvedValue(mockResult);

      const result = await service.refreshToken({
        clientId: 'client-id',
        refreshToken: 'old-refresh-token',
      });

      expect(service.market.auth.exchangeOAuthToken).toHaveBeenCalledWith({
        clientId: 'client-id',
        grantType: 'refresh_token',
        refreshToken: 'old-refresh-token',
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('getUserInfoWithTrustedClient', () => {
    it('should fetch user info with trusted client headers', async () => {
      const mockUserInfo = { sub: 'user-123', email: 'test@example.com' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockUserInfo),
      });

      const result = await service.getUserInfoWithTrustedClient();

      expect(global.fetch).toHaveBeenCalled();
      expect(result).toEqual(mockUserInfo);
    });

    it('should throw error when response is not ok', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      });

      await expect(service.getUserInfoWithTrustedClient()).rejects.toThrow(
        'Failed to get user info',
      );
    });
  });

  describe('registerUser', () => {
    it('should call market.user.register with params', async () => {
      service.market.user.register = vi.fn().mockResolvedValue(undefined);

      await service.registerUser({
        registerUserId: 'new-user-123',
        followUserId: 'existing-user-456',
      });

      expect(service.market.user.register).toHaveBeenCalledWith({
        registerUserId: 'new-user-123',
        followUserId: 'existing-user-456',
      });
    });
  });
});
