import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { SUPPORTED_CURRENCIES } from '@/components/currency/currency-constants';
import { Vital } from '@/constants/vital-theme';
import { useCurrencyStore } from '@/stores/currency-store';
import { CurrencyCode } from '@/types/currency';

const C = Vital.colors;
const F = Vital.fonts;

interface CurrencyWidgetCardProps {
  onOpenConverter: () => void;
}

const QUICK_CODES: CurrencyCode[] = ['EUR', 'GBP', 'SAR', 'AED'];

export function CurrencyWidgetCard({ onOpenConverter }: CurrencyWidgetCardProps) {
  const getRateInBDT = useCurrencyStore((s) => s.getRateInBDT);
  const usdRate = getRateInBDT('USD');

  return (
    <View style={styles.card}>
      {/* Top Header */}
      <View style={styles.topRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="currency-exchange" size={18} color="#FF922B" />
          </View>
          <View>
            <Text style={styles.headerTitle}>EXCHANGE RATES & REMITTANCE</Text>
            <Text style={styles.headerSubtitle}>Live BDT conversion benchmark</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            void Haptics.selectionAsync().catch(() => {});
            onOpenConverter();
          }}
          style={styles.convertBtn}>
          <Text style={styles.convertBtnText}>Convert</Text>
          <MaterialIcons name="chevron-right" size={14} color="#FF922B" />
        </TouchableOpacity>
      </View>

      {/* Hero USD Rate Display */}
      <View style={styles.heroBox}>
        <View style={styles.heroLeft}>
          <Text style={styles.heroFlag}>🇺🇸</Text>
          <View>
            <Text style={styles.heroLabel}>US DOLLAR (USD)</Text>
            <Text style={styles.heroRateText}>
              1 USD = <Text style={styles.heroHighlight}>৳{usdRate.toFixed(2)}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Other Major Currencies Grid */}
      <View style={styles.miniGrid}>
        {QUICK_CODES.map((code) => {
          const item = SUPPORTED_CURRENCIES[code];
          const rate = getRateInBDT(code);
          return (
            <View key={code} style={styles.miniTile}>
              <View style={styles.miniTileTop}>
                <Text style={styles.miniFlag}>{item.flag}</Text>
                <Text style={styles.miniCode}>{code}</Text>
              </View>
              <Text style={styles.miniRate}>৳{rate.toFixed(2)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#13191C',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 146, 43, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: F.bold,
    fontSize: 11,
    color: '#FF922B',
    letterSpacing: 0.8,
  },
  headerSubtitle: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  convertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 146, 43, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 2,
  },
  convertBtnText: {
    fontFamily: F.bold,
    fontSize: 11,
    color: '#FF922B',
  },
  heroBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#181F23',
    borderRadius: 14,
    padding: 12,
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroFlag: {
    fontSize: 22,
  },
  heroLabel: {
    fontFamily: F.bold,
    fontSize: 9,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  heroRateText: {
    fontFamily: F.medium,
    fontSize: 13,
    color: C.onSurfaceVariant,
    marginTop: 1,
  },
  heroHighlight: {
    fontFamily: F.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(32, 201, 151, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#20C997',
  },
  liveText: {
    fontFamily: F.bold,
    fontSize: 9,
    color: '#20C997',
    letterSpacing: 0.5,
  },
  miniGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  miniTile: {
    flex: 1,
    backgroundColor: '#181F23',
    borderRadius: 12,
    padding: 10,
    gap: 4,
  },
  miniTileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniFlag: {
    fontSize: 12,
  },
  miniCode: {
    fontFamily: F.bold,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  miniRate: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
});
