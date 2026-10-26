import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useThemeStore } from '@/stores/theme-store';

type Props = {
  size?: 'sm' | 'md';
};

export function ThemeToggleButton({ size = 'md' }: Props) {
  const { isDark, toggleTheme, loadTheme } = useThemeStore();

  useEffect(() => {
    void loadTheme();
  }, [loadTheme]);

  const dim = size === 'sm' ? 36 : 40;
  const iconSize = size === 'sm' ? 18 : 20;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      hitSlop={8}
      onPress={toggleTheme}
      style={({ pressed }) => [
        styles.container,
        {
          width: dim,
          height: dim,
          borderRadius: 14,
          opacity: pressed ? 0.75 : 1,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
      ]}>
      <MaterialIcons
        name={isDark ? 'light-mode' : 'dark-mode'}
        size={iconSize}
        color={isDark ? '#fbbf24' : '#38bdf8'}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});

