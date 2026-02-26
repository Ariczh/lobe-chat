import { ToolsActivatorExecutionRuntime } from '@lobechat/builtin-tool-tools/executionRuntime';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { toolsActivatorRuntime } from '../tools';

vi.mock('@lobechat/builtin-tool-tools', () => ({
  LobeToolIdentifier: 'lobe-tools',
}));

vi.mock('@lobechat/builtin-tool-tools/executionRuntime', () => ({
  ToolsActivatorExecutionRuntime: vi.fn((opts) => ({
    _type: 'ToolsActivatorExecutionRuntime',
    service: opts.service,
  })),
}));

describe('toolsActivatorRuntime', () => {
  const context = {
    toolManifestMap: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have the correct identifier', () => {
    expect(toolsActivatorRuntime.identifier).toBe('lobe-tools');
  });

  it('should have a factory function', () => {
    expect(typeof toolsActivatorRuntime.factory).toBe('function');
  });

  describe('factory', () => {
    it('should create a runtime without requiring context fields', () => {
      const runtime = toolsActivatorRuntime.factory(context);
      expect(runtime).toBeDefined();
    });

    it('should create a ToolsActivatorExecutionRuntime instance', () => {
      toolsActivatorRuntime.factory(context);
      expect(ToolsActivatorExecutionRuntime).toHaveBeenCalled();
    });

    it('should pass a service object to ToolsActivatorExecutionRuntime', () => {
      toolsActivatorRuntime.factory(context);
      expect(ToolsActivatorExecutionRuntime).toHaveBeenCalledWith(
        expect.objectContaining({ service: expect.any(Object) }),
      );
    });
  });

  describe('service behavior', () => {
    let service: any;

    beforeEach(() => {
      vi.mocked(ToolsActivatorExecutionRuntime).mockImplementation((opts: any) => {
        service = opts.service;
        return { _type: 'runtime', service: opts.service } as any;
      });

      toolsActivatorRuntime.factory(context);
    });

    it('should provide a service with getActivatedToolIds', () => {
      expect(typeof service.getActivatedToolIds).toBe('function');
    });

    it('should provide a service with markActivated', () => {
      expect(typeof service.markActivated).toBe('function');
    });

    it('should provide a service with getToolManifests', () => {
      expect(typeof service.getToolManifests).toBe('function');
    });

    it('should start with no activated tools', () => {
      const ids = service.getActivatedToolIds();
      expect(ids).toEqual([]);
    });

    it('should track activated tool ids after markActivated', () => {
      service.markActivated(['tool-a', 'tool-b']);
      const ids = service.getActivatedToolIds();
      expect(ids).toContain('tool-a');
      expect(ids).toContain('tool-b');
    });

    it('should not duplicate ids when markActivated is called multiple times with same id', () => {
      service.markActivated(['tool-a']);
      service.markActivated(['tool-a', 'tool-b']);
      const ids = service.getActivatedToolIds();
      expect(ids.filter((id: string) => id === 'tool-a')).toHaveLength(1);
      expect(ids).toContain('tool-b');
    });

    it('getActivatedToolIds should return a copy not a reference', () => {
      service.markActivated(['tool-x']);
      const ids1 = service.getActivatedToolIds();
      const ids2 = service.getActivatedToolIds();
      expect(ids1).toEqual(ids2);
      expect(ids1).not.toBe(ids2);
    });

    it('getToolManifests should return an empty array for any identifiers', async () => {
      const manifests = await service.getToolManifests(['tool-a', 'tool-b']);
      expect(manifests).toEqual([]);
    });

    it('getToolManifests should return empty array for empty input', async () => {
      const manifests = await service.getToolManifests([]);
      expect(manifests).toEqual([]);
    });
  });
});
