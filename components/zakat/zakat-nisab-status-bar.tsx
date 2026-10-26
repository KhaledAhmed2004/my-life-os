import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  GOLD_NISAB_GRAMS,
  SILVER_NISAB_GRAMS,
  ZAKAT_COLORS,
} from '@/components/zakat/zakat-constants';
import { Vital } from '@/constants/vital-theme';
import { ZakatResult } from '@/types/zakat';

const C = Vital.colors;
const F = Vital.fonts;

interface ZakatNisabStatusBarProps {
  result: ZakatResult;
}

export function ZakatNisabStatusBar({ result }: ZakatNisabStatusBarProps) {
  const {
    netZakatableWealth,
    nisabThreshold,
    isNisabReached,
    nisabPercentage,
    nisabStandard,
  } = result;

  const standardGrams =
    nisabStandard === 'GOLD' ? GOLD_NISAB_GRAMS : SILVER_NISAB_GRAMS;
  const standardName = nisabStandard === 'GOLD' ? 'Gold (87.48g)' : 'Silver (612.36g)';

  const clampedProgress = Math.min(100, Math.max(0, nisabPercentage));

  return (
    <View style={styles.container}>
      {/* Top Labels */}
      <View style={styles.topRow}>
        <View style={styles.labelGroup}>
          <Text style={styles.title}>NISAB THRESHOLD</Text>
          <Text style={styles.subtitle}>{standardName}</Text>
        </View>

        <View
          style={[
            styles.statusPill,
            isNisabReached ? styles.statusPillEligible : styles.statusPillBelow,
          ]}>
          <MaterialIcons
            name={isNisabReached ? 'verified' : 'info-outline'}
            size={13}
            color={isNisabReached ? ZAKAT_COLORS.emerald : ZAKAT_COLORS.goldLight}
          />
          <Text
            style={[
              styles.statusText,
              isNisabReached ? styles.statusTextEligible : styles.statusTextBelow,
            ]}>
            {isNisabReached ? 'ZAKAT APPLICABLE' : 'BELOW NISAB'}
          </Text>
        </View>
      </View>

      {/* Progress Track */}
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${clampedProgress}%` },
            isNisabReached ? styles.fillEligible : styles.fillBelow,
          ]}
        />
      </View>

      {/* Numerical Benchmark */}
      <View style={styles.numbersRow}>
        <Text style={styles.wealthText}>
          Net Wealth: <Text style={styles.highlight}>৳{netZakatableWealth.toLocaleString()}</Text>
        </Text>
        <Text style={styles.nisabText}>
          Nisab: ৳{nisabThreshold.toLocaleString()}
        </Text>
      </View>

      {/* Helper text */}
      <Text style={styles.helperText}>
        {isNisabReached
          ? `✓ Your net zakatable wealth is ${nisabPercentage}% of the Nisab threshold. Zakat is obligatory if held for 1 lunar year (Hawl).`
          : `ℹ Your net zakatable wealth is ৳${(nisabThreshold - netZakatableWealth).toLocaleString()} below the Nisab threshold. No Zakat is due.`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: ZAKAT_COLORS.tileBg,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelGroup: {
    gap: 1,
  },
  title: {
    fontFamily: F.bold,
    fontSize: 10,
    color: ZAKAT_COLORS.gold,
    letterSpacing: 0.7,
  },
  subtitle: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusPillEligible: {
    backgroundColor: ZAKAT_COLORS.emeraldLight,
  },
  statusPillBelow: {
    backgroundColor: ZAKAT_COLORS.goldGlow,
  },
  statusText: {
    fontFamily: F.bold,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  statusTextEligible: {
    color: ZAKAT_COLORS.emerald,
  },
  statusTextBelow: {
    color: ZAKAT_COLORS.goldLight,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: ZAKAT_COLORS.tileInner,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  fillEligible: {
    backgroundColor: ZAKAT_COLORS.emerald,
  },
  fillBelow: {
    backgroundColor: ZAKAT_COLORS.gold,
  },
  numbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wealthText: {
    fontFamily: F.medium,
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  highlight: {
    fontFamily: F.bold,
    color: '#FFFFFF',
  },
  nisabText: {
    fontFamily: F.bold,
    fontSize: 11,
    color: ZAKAT_COLORS.gold,
  },
  helperText: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
    lineHeight: 15,
  },
});
