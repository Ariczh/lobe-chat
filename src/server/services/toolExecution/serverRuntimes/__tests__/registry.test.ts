import { describe, expect, it, vi } from 'vitest';

// Mock all runtime modules to isolate registry tests
vi.mock('../cloudSandbox', () => ({
  cloudSandboxRuntime: {
    factory: vi.fn(() => ({ type: 'cloudSandbox' })),
    identifier: 'lobe-cloud-sandbox',
  },
}));

vi.mock('../memory', () => ({
  memoryRuntime: {
    factory: vi.fn(() => ({ type: 'memory' })),
    identifier: 'lobe-memory',
  },
}));

vi.mock('../notebook', () => ({
  notebookRuntime: {
    factory: vi.fn(() => ({ type: 'notebook' })),
    identifier: 'lobe-notebook',
  },
}));

vi.mock('../skills', () => ({
  skillsRuntime: {
    factory: vi.fn(() => ({ type: 'skills' })),
    identifier: 'lobe-skills',
  },
}));

vi.mock('../tools', () => ({
  toolsActivatorRuntime: {
    factory: vi.fn(() => ({ type: 'tools' })),
    identifier: 'lobe-tools',
  },
}));

vi.mock('../webBrowsing', () => ({
  webBrowsingRuntime: {
    factory: vi.fn(() => ({ type: 'webBrowsing' })),
    identifier: 'lobe-web-browsing',
  },
}));

describe('Server Runtime Registry', () => {
  // Use dynamic import to get the registry after mocks are set up
  let getServerRuntime: (identifier: string, context: any) => any;
  let hasServerRuntime: (identifier: string) => boolean;
  let getServerRuntimeIdentifiers: () => string[];

  beforeEach(async () => {
    vi.resetModules();
    const registry = await import('../index');
    getServerRuntime = registry.getServerRuntime;
    hasServerRuntime = registry.hasServerRuntime;
    getServerRuntimeIdentifiers = registry.getServerRuntimeIdentifiers;
  });

  describe('hasServerRuntime', () => {
    it('should return false for unregistered identifiers', async () => {
      expect(hasServerRuntime('non-existent-tool')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(hasServerRuntime('')).toBe(false);
    });
  });

  describe('getServerRuntimeIdentifiers', () => {
    it('should return an array of strings', () => {
      const identifiers = getServerRuntimeIdentifiers();
      expect(Array.isArray(identifiers)).toBe(true);
    });

    it('should return at least one identifier', () => {
      const identifiers = getServerRuntimeIdentifiers();
      expect(identifiers.length).toBeGreaterThan(0);
    });

    it('should not contain duplicates', () => {
      const identifiers = getServerRuntimeIdentifiers();
      const uniqueIdentifiers = new Set(identifiers);
      expect(uniqueIdentifiers.size).toBe(identifiers.length);
    });
  });

  describe('getServerRuntime', () => {
    it('should return undefined for unregistered identifier', () => {
      const result = getServerRuntime('unregistered-tool', { toolManifestMap: {} });
      expect(result).toBeUndefined();
    });
  });
});
