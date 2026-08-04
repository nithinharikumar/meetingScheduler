import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  currentTheme: Theme;
  systemTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  setSystemTheme: (theme: 'light' | 'dark') => void;
}

export const applyTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return;
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');

  if (theme === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.add(isDark ? 'dark' : 'light');
  } else {
    root.classList.add(theme);
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      currentTheme: 'system',
      systemTheme: typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      setTheme: (theme) => {
        set({ currentTheme: theme });
        applyTheme(theme);
      },
      setSystemTheme: (systemTheme) => set({ systemTheme }),
    }),
    {
      name: 'syncspace-theme-store',
      partialize: (state) => ({ currentTheme: state.currentTheme }),
    }
  )
);
