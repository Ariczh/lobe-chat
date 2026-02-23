import { describe, expect, it, vi } from 'vitest';

// Mock all the runtime modules to avoid complex dependency setup
vi.mock('./cloudSandbox', () => ({
  cloudSandboxRuntime: {
    factory: vi.fn().mockReturnValue({ runSandbox: vi.fn() }),
    identifier: 'lobe-cloud-sandbox',
  },
}));

vi.mock('./notebook', () => ({
  notebookRuntime: {
    factory: vi.fn().mockReturnValue({ createDocument: vi.fn() }),
    identifier: 'lobe-notebook',
  },
}));

vi.mock('./skills', () => ({
  skillsRuntime: {
    factory: vi.fn().mockResolvedValue({ findAll: vi.fn() }),
    identifier: 'lobe-skills',
  },
}));

vi.mock('./webBrowsing', () => ({
  webBrowsingRuntime: {
    factory: vi.fn().mockReturnValue({ search: vi.fn(), visit: vi.fn() }),
    identifier: 'lobe-web-browsing',
  },
}));

describe('serverRuntimes registry', () => {
  describe('hasServerRuntime', () => {
    it('should return true for registered runtimes', async () => {
      const { hasServerRuntime } = await import('./index');

      // These are the default registered runtimes
      expect(hasServerRuntime('lobe-cloud-sandbox')).toBe(true);
      expect(hasServerRuntime('lobe-notebook')).toBe(true);
      expect(hasServerRuntime('lobe-skills')).toBe(true);
      expect(hasServerRuntime('lobe-web-browsing')).toBe(true);
    });

    it('should return false for unregistered identifiers', async () => {
      const { hasServerRuntime } = await import('./index');

      expect(hasServerRuntime('unknown-tool')).toBe(false);
      expect(hasServerRuntime('')).toBe(false);
      expect(hasServerRuntime('my-custom-plugin')).toBe(false);
    });
  });

  describe('getServerRuntime', () => {
    it('should return undefined for unregistered identifier', async () => {
      const { getServerRuntime } = await import('./index');
      const context = { toolManifestMap: {} };

      const runtime = await getServerRuntime('not-registered', context as any);
      expect(runtime).toBeUndefined();
    });

    it('should call the factory with context for registered runtimes', async () => {
      const { cloudSandboxRuntime } = await import('./cloudSandbox');
      const { getServerRuntime } = await import('./index');

      const context = {
        serverDB: {} as any,
        toolManifestMap: {},
        topicId: 'topic-1',
        userId: 'user-1',
      };

      await getServerRuntime('lobe-cloud-sandbox', context as any);

      expect(vi.mocked(cloudSandboxRuntime.factory)).toHaveBeenCalledWith(context);
    });

    it('should return the runtime created by the factory', async () => {
      const { notebookRuntime } = await import('./notebook');
      const mockRuntime = { createDocument: vi.fn() };
      vi.mocked(notebookRuntime.factory).mockReturnValue(mockRuntime as any);

      const { getServerRuntime } = await import('./index');
      const context = { toolManifestMap: {}, userId: 'user-1' };

      const runtime = await getServerRuntime('lobe-notebook', context as any);

      expect(runtime).toBe(mockRuntime);
    });
  });

  describe('getServerRuntimeIdentifiers', () => {
    it('should return all registered runtime identifiers', async () => {
      const { getServerRuntimeIdentifiers } = await import('./index');

      const identifiers = getServerRuntimeIdentifiers();

      expect(Array.isArray(identifiers)).toBe(true);
      expect(identifiers).toContain('lobe-cloud-sandbox');
      expect(identifiers).toContain('lobe-notebook');
      expect(identifiers).toContain('lobe-skills');
      expect(identifiers).toContain('lobe-web-browsing');
    });

    it('should return identifiers as strings', async () => {
      const { getServerRuntimeIdentifiers } = await import('./index');

      const identifiers = getServerRuntimeIdentifiers();

      for (const id of identifiers) {
        expect(typeof id).toBe('string');
      }
    });
  });
});
