import { useThemeStore } from '@/stores/theme-store';

export function useColorScheme() {
  return useThemeStore((s) => s.theme);
}
