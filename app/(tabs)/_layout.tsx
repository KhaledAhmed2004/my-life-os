import { Tabs } from 'expo-router';
import React from 'react';

import { FloatingTabBar } from '@/components/navigation/floating-tab-bar';
import { Vital } from '@/constants/vital-theme';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: '#0D131F' },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Morning' }} />
      <Tabs.Screen name="history" options={{ title: 'History' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
