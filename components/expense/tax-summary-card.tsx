import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTaxStore } from '@/stores/tax-store';
import { Vital } from '@/constants/vital-theme';

const C = Vital.colors;
const F = Vital.fonts;

interface TaxSummaryCardProps {
  onOpenTaxCalculator: () => void;
}

export function TaxSummaryCard({ onOpenTaxCalculator }: TaxSummaryCardProps) {
  const profile = useTaxStore((s) => s.profile);
  const calculateTax = useTaxStore((s) => s.calculateTax);

  const taxResult = useMemo(() => calculateTax(), [calculateTax, profile]);

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onOpenTaxCalculator();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handlePress}
      style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="account-balance" size={18} color="#D4A017" />
          </View>
          <View>
            <Text style={styles.title}>INCOME TAX & REBATE</Text>
            <Text style={styles.subtitle}>
              Finance Act 2024-25 • 15% Rebate Engine
            </Text>
          </View>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {taxResult.effectiveTaxRate}% Tax Rate
          </Text>
        </View>
      </View>

      {/* Main Metric Hero */}
      <View style={styles.mainMetricRow}>
        <View>
          <Text style={styles.metricLabel}>ESTIMATED ANNUAL TAX</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.takaSymbol}>৳</Text>
            <Text style={styles.amountText}>
              {taxResult.netTaxPayable.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.monthlyBox}>
          <Text style={styles.monthlyLabel}>MONTHLY SALARY TDS</Text>
          <Text style={styles.monthlyVal}>
            ৳{taxResult.monthlyTdsRecommended.toLocaleString()}/mo
          </Text>
        </View>
      </View>

      {/* Bento Sub-Metrics */}
      <View style={styles.bentoRow}>
        <View style={styles.bentoItem}>
          <Text style={styles.bentoLabel}>TAXABLE SALARY</Text>
          <Text style={styles.bentoVal}>
            ৳{taxResult.totalTaxableIncome.toLocaleString()}
          </Text>
          <Text style={styles.bentoSub}>
            Tax-Free: ৳{taxResult.taxFreeLimit.toLocaleString()}
          </Text>
        </View>

        <View style={[styles.bentoItem, styles.bentoItemRebate]}>
          <Text style={[styles.bentoLabel, { color: '#20C997' }]}>
            15% REBATE SAVINGS
          </Text>
          <Text style={[styles.bentoVal, { color: '#20C997' }]}>
            -৳{taxResult.taxRebateAmount.toLocaleString()}
          </Text>
          <Text style={styles.bentoSub}>
            On ৳{taxResult.actualInvestmentTotal.toLocaleString()} Inv.
          </Text>
        </View>
      </View>

      {/* Action Footer */}
      <View style={styles.footerRow}>
        <View style={styles.footerTip}>
          <MaterialIcons name="insights" size={14} color="#D4A017" />
          <Text style={styles.footerTipText} numberOfLines={1}>
            {taxResult.optimalInvestmentGap > 0
              ? `Invest ৳${taxResult.optimalInvestmentGap.toLocaleString()} more in DPS for max rebate`
              : 'Max tax rebate limit fully claimed!'}
          </Text>
        </View>

        <View style={styles.chevronRow}>
          <Text style={styles.manageText}>Tax Studio</Text>
          <MaterialIcons name="chevron-right" size={16} color="#D4A017" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#13191C',
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 160, 23, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  subtitle: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  badge: {
    backgroundColor: 'rgba(212, 160, 23, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#D4A017',
  },
  mainMetricRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  metricLabel: {
    fontFamily: F.bold,
    fontSize: 9,
    color: C.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    marginTop: 2,
  },
  takaSymbol: {
    fontFamily: F.bold,
    fontSize: 18,
    color: '#D4A017',
  },
  amountText: {
    fontFamily: F.bold,
    fontSize: 26,
    color: '#FFFFFF',
  },
  monthlyBox: {
    backgroundColor: '#181F23',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'flex-end',
    gap: 2,
  },
  monthlyLabel: {
    fontFamily: F.bold,
    fontSize: 8,
    color: C.onSurfaceVariant,
    letterSpacing: 0.4,
  },
  monthlyVal: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#20C997',
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  bentoItem: {
    flex: 1,
    backgroundColor: '#181F23',
    borderRadius: 12,
    padding: 10,
    gap: 2,
  },
  bentoItemRebate: {
    borderWidth: 1,
    borderColor: 'rgba(32, 201, 151, 0.2)',
  },
  bentoLabel: {
    fontFamily: F.bold,
    fontSize: 9,
    color: C.onSurfaceVariant,
    letterSpacing: 0.4,
  },
  bentoVal: {
    fontFamily: F.bold,
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 2,
  },
  bentoSub: {
    fontFamily: F.regular,
    fontSize: 9,
    color: C.onSurfaceVariant,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  footerTip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  footerTipText: {
    fontFamily: F.medium,
    fontSize: 10,
    color: C.onSurfaceVariant,
    flex: 1,
  },
  chevronRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  manageText: {
    fontFamily: F.bold,
    fontSize: 11,
    color: '#D4A017',
  },
});
