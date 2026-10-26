import type { ComponentProps } from 'react';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Vital } from '@/constants/vital-theme';

type TabMeta = {
  key: string;
  label: string;
  icon: ComponentProps<typeof MaterialIcons>['name'];
};

const TAB_META: Record<string, TabMeta> = {
  index: { key: 'index', label: 'Morning', icon: 'wb-sunny' },
  history: { key: 'history', label: 'History', icon: 'history' },
  settings: { key: 'settings', label: 'Settings', icon: 'settings' },
};

export function FloatingTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 12);

  return (
    <View
      style={[
        styles.barWrapper,
        { bottom: bottomPad },
      ]}>
      <View style={styles.barContainer}>
        {state.routes.map((route: any, index: number) => {
          const meta = TAB_META[route.name] ?? {
            key: route.name,
            label: route.name,
            icon: 'circle' as const,
          };
          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            if (!focused && !event.defaultPrevented) {
              (navigation as any).navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              onPress={onPress}
              style={[styles.tabButton, focused && styles.tabButtonActive]}>
              <MaterialIcons
                name={meta.icon}
                size={22}
                color={focused ? '#F59E0B' : '#64748B'}
              />
              <Text
                style={[
                  styles.tabLabel,
                  focused ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}>
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barWrapper: {
    position: 'absolute',
    left: 24,
    right: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.35,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 12 },
      default: {},
    }),
  },
  barContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(22, 31, 46, 0.95)',
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 22,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  tabLabel: {
    fontSize: 12.5,
    fontFamily: Vital.fonts.medium,
    marginLeft: 6,
  },
  tabLabelActive: {
    color: '#F59E0B',
    fontFamily: Vital.fonts.bold,
  },
  tabLabelInactive: {
    color: '#64748B',
  },
});
