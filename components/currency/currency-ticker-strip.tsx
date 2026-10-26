import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { SUPPORTED_CURRENCIES } from '@/components/currency/currency-constants';
import { Vital } from '@/constants/vital-theme';
import { useCurrencyStore } from '@/stores/currency-store';
import { CurrencyCode } from '@/types/currency';

const C = Vital.colors;
const F = Vital.fonts;

const TICKER_CURRENCIES: CurrencyCode[] = [
  'USD',
  'EUR',
  'GBP',
  'SAR',
  'AED',
  'MYR',
  'CAD',
  'SGD',
];

interface CurrencyTickerStripProps {
  onSelectCurrency?: (code: CurrencyCode) => void;
}

export function CurrencyTickerStrip({ onSelectCurrency }: CurrencyTickerStripProps) {
  const getRateInBDT = useCurrencyStore((s) => s.getRateInBDT);
  const selectedFrom = useCurrencyStore((s) => s.selectedFrom);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {TICKER_CURRENCIES.map((code) => {
        const info = SUPPORTED_CURRENCIES[code];
        const rateInBDT = getRateInBDT(code);
        const isSelected = selectedFrom === code;

        return (
          <TouchableOpacity
            key={code}
            activeOpacity={0.75}
            onPress={() => {
              void Haptics.selectionAsync().catch(() => {});
              if (onSelectCurrency) onSelectCurrency(code);
            }}
            style={[
              styles.tickerPill,
              isSelected && styles.tickerPillActive,
            ]}>
            <Text style={styles.flagText}>{info.flag}</Text>
            <View style={styles.textGroup}>
              <Text style={[styles.codeText, isSelected && styles.codeTextActive]}>
                1 {code}
              </Text>
              <Text style={styles.rateText}>৳{rateInBDT.toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 2,
  },
  tickerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181F23',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  tickerPillActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
  },
  flagText: {
    fontSize: 14,
  },
  textGroup: {
    gap: 1,
  },
  codeText: {
    fontFamily: F.bold,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  codeTextActive: {
    color: '#38BDF8',
  },
  rateText: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
});
