import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Appearance, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export type ThemeMode = 'dark' | 'light';

const THEME_STORAGE_KEY = 'vital_theme_mode_v1';

async function getStoredTheme(): Promise<ThemeMode> {
  try {
    if (Platform.OS === 'web') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } else {
      const saved = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    }
  } catch {}
  return 'dark'; // Dark-mode first by default
}

async function saveTheme(theme: ThemeMode) {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } else {
      await SecureStore.setItemAsync(THEME_STORAGE_KEY, theme);
    }
  } catch {}
}

interface ThemeState {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'dark',
  isDark: true,
  setTheme: (theme: ThemeMode) => {
    set({ theme, isDark: theme === 'dark' });
    void saveTheme(theme);
    Appearance.setColorScheme?.(theme);
  },
  toggleTheme: () => {
    const nextTheme: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    set({ theme: nextTheme, isDark: nextTheme === 'dark' });
    void saveTheme(nextTheme);
    Appearance.setColorScheme?.(nextTheme);
  },
  loadTheme: async () => {
    const saved = await getStoredTheme();
    set({ theme: saved, isDark: saved === 'dark' });
    Appearance.setColorScheme?.(saved);
  },
}));
