import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { Vital } from '@/constants/vital-theme';

type Props = {
  children: ReactNode;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
};

/**
 * MENTOR: Never put page background only on SafeAreaView + NativeWind className.
 * Use a plain View shell with an explicit StyleSheet color so Metro/Android
 * cannot drop the dark theme background.
 */
export function AppScreen({ children, edges = ['top'], style }: Props) {
  return (
    <View style={[styles.root, style]}>
      <SafeAreaView style={styles.safe} edges={edges}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Vital.colors.background,
  },
  safe: {
    flex: 1,
    backgroundColor: Vital.colors.background,
  },
});
