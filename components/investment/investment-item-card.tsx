import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { INVESTMENT_CATEGORY_META } from '@/components/investment/investment-constants';
import { Vital } from '@/constants/vital-theme';
import { InvestmentItem } from '@/types/investment';

const C = Vital.colors;
const F = Vital.fonts;

interface InvestmentItemCardProps {
  item: InvestmentItem;
  onPress: () => void;
}

export function InvestmentItemCard({ item, onPress }: InvestmentItemCardProps) {
  const meta = INVESTMENT_CATEGORY_META[item.category] || INVESTMENT_CATEGORY_META.OTHER;
  const pnl = item.currentValue - item.purchaseAmount;
  const pnlPercent = item.purchaseAmount > 0 ? (pnl / item.purchaseAmount) * 100 : 0;
  const isGain = pnl >= 0;

  // Maturity countdown
  let maturityLabel = '';
  if (item.maturityDate) {
    const diffMs = item.maturityDate - Date.now();
    if (diffMs <= 0) {
      maturityLabel = 'Matured';
    } else {
      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (days > 365) {
        const yrs = Math.floor(days / 365);
        const remMonths = Math.floor((days % 365) / 30);
        maturityLabel = `${yrs}y ${remMonths}m left`;
      } else if (days > 30) {
        const months = Math.floor(days / 30);
        maturityLabel = `${months}m left`;
      } else {
        maturityLabel = `${days}d left`;
      }
    }
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        void Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={styles.card}>
      {/* Left Icon */}
      <View style={[styles.iconBox, { backgroundColor: meta.bgColor }]}>
        <MaterialIcons name={meta.icon} size={20} color={meta.color} />
      </View>

      {/* Main Info */}
      <View style={styles.centerInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.nameText} numberOfLines={1}>
            {item.name}
          </Text>
          {item.status === 'MATURED' && (
            <View style={styles.maturedTag}>
              <Text style={styles.maturedTagText}>MATURED</Text>
            </View>
          )}
        </View>

        <View style={styles.subRow}>
          <Text style={styles.institutionText} numberOfLines={1}>
            {item.institution || meta.label}
          </Text>
          {item.interestRate && (
            <Text style={styles.yieldText}>• {item.interestRate}% Yield</Text>
          )}
          {maturityLabel ? (
            <Text style={styles.maturityChipText}>• {maturityLabel}</Text>
          ) : null}
        </View>
      </View>

      {/* Right Value & PnL */}
      <View style={styles.rightValues}>
        <Text style={styles.currentValText}>
          ৳{item.currentValue.toLocaleString()}
        </Text>

        <View
          style={[
            styles.pnlChip,
            {
              backgroundColor: isGain
                ? 'rgba(32, 201, 151, 0.12)'
                : 'rgba(255, 107, 107, 0.12)',
            },
          ]}>
          <MaterialIcons
            name={isGain ? 'arrow-drop-up' : 'arrow-drop-down'}
            size={14}
            color={isGain ? '#20C997' : '#FF6B6B'}
          />
          <Text
            style={[
              styles.pnlChipText,
              { color: isGain ? '#20C997' : '#FF6B6B' },
            ]}>
            {isGain ? '+' : ''}
            {Math.round(pnlPercent * 10) / 10}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181F23',
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nameText: {
    fontFamily: F.bold,
    fontSize: 13,
    color: C.onSurface,
    flexShrink: 1,
  },
  maturedTag: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  maturedTagText: {
    fontFamily: F.bold,
    fontSize: 8,
    color: '#38BDF8',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  institutionText: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
    maxWidth: 110,
  },
  yieldText: {
    fontFamily: F.medium,
    fontSize: 11,
    color: '#FF922B',
  },
  maturityChipText: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  rightValues: {
    alignItems: 'flex-end',
    gap: 3,
  },
  currentValText: {
    fontFamily: F.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  pnlChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pnlChipText: {
    fontFamily: F.bold,
    fontSize: 10,
  },
});
