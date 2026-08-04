import { useThemeStore } from '../stores/themeStore';

export function useTheme() {
  const { currentTheme, systemTheme, setTheme } = useThemeStore();

  const isDark = currentTheme === 'system' ? systemTheme === 'dark' : currentTheme === 'dark';

  return {
    theme: currentTheme,
    isDark,
    setTheme,
  };
}
