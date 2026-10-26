import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  useFonts as useJetBrains,
} from '@expo-google-fonts/jetbrains-mono';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts as useManrope,
} from '@expo-google-fonts/manrope';
import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import '../global.css';
import '@/lib/nativewind-interop';

import { QueryProvider } from '@/components/providers/query-provider';
import { VitalNavTheme } from '@/constants/vital-theme';

// Ensure splash screen is dismissed promptly
SplashScreen.hideAsync().catch(() => {});

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const [manropeLoaded] = useManrope({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  const [monoLoaded] = useJetBrains({
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, [manropeLoaded, monoLoaded]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0D131F' }}>
      <QueryProvider>
        <ThemeProvider value={VitalNavTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#0D131F' },
            }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
