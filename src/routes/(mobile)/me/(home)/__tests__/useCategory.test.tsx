import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { CellProps } from '@/components/Cell';
import type * as ConstVersionModule from '@/const/version';
import { useCategory } from '@/features/MobileMe/useCategory';
import { ServerConfigStoreProvider } from '@/store/serverConfig/Provider';
import { useUserStore } from '@/store/user';

const wrapper: React.JSXElementConstructor<{ children: React.ReactNode }> = ({ children }) => (
  <ServerConfigStoreProvider>{children}</ServerConfigStoreProvider>
);

// Mock dependencies
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(() => ({
    t: vi.fn((key) => key),
  })),
}));

// Mock version constants
vi.mock('@/const/version', async (importOriginal) => {
  const actual = await importOriginal<typeof ConstVersionModule>();
  return {
    ...actual,
    isServerMode: false,
  };
});

afterEach(() => {
  mockNavigate.mockReset();
});

describe('useCategory', () => {
  it('should return correct items when the user is logged in with authentication', () => {
    act(() => {
      useUserStore.setState({ isSignedIn: true });
    });

    const mockOpenChangelogModal = vi.fn();
    const { result } = renderHook(() => useCategory(mockOpenChangelogModal), { wrapper });

    act(() => {
      const items = result.current;
      expect(items.some((item: CellProps) => item.key === 'profile')).toBe(true);
      expect(items.some((item: CellProps) => item.key === 'setting')).toBe(true);
      expect(items.some((item: CellProps) => item.key === 'docs')).toBe(true);
      expect(items.some((item: CellProps) => item.key === 'feedback')).toBe(true);
      expect(items.some((item: CellProps) => item.key === 'changelog')).toBe(true);
    });
  });

  it('should return correct items when the user is not logged in', () => {
    act(() => {
      useUserStore.setState({ isSignedIn: false });
    });

    const mockOpenChangelogModal = vi.fn();
    const { result } = renderHook(() => useCategory(mockOpenChangelogModal), { wrapper });

    act(() => {
      const items = result.current;
      expect(items.some((item: CellProps) => item.key === 'profile')).toBe(false);
      expect(items.some((item: CellProps) => item.key === 'setting')).toBe(false);
      expect(items.some((item: CellProps) => item.key === 'data')).toBe(false);
      expect(items.some((item: CellProps) => item.key === 'docs')).toBe(true);
      expect(items.some((item: CellProps) => item.key === 'feedback')).toBe(true);
      expect(items.some((item: CellProps) => item.key === 'changelog')).toBe(true);
    });
  });
});
