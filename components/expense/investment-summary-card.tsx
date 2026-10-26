import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { RollingNumber } from '@/components/ui/rolling-number';
import { Vital } from '@/constants/vital-theme';
import { useInvestmentStore } from '@/stores/investment-store';

const C = Vital.colors;
const F = Vital.fonts;

interface InvestmentSummaryCardProps {
  onOpenPortfolio: () => void;
  onOpenAddInvestment: () => void;
}

export function InvestmentSummaryCard({
  onOpenPortfolio,
  onOpenAddInvestment,
}: InvestmentSummaryCardProps) {
  const investments = useInvestmentStore((s) => s.investments);
  const getStats = useInvestmentStore((s) => s.getStats);
  const stats = useMemo(() => getStats(), [getStats, investments]);

  const isGain = stats.totalPnL >= 0;

  return (
    <View style={styles.card}>
      {/* Top Header */}
      <View style={styles.topRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="insights" size={18} color="#20C997" />
          </View>
          <View>
            <Text style={styles.headerTitle}>INVESTMENT PORTFOLIO & DPS</Text>
            <Text style={styles.headerSubtitle}>
              {stats.activeCount > 0
                ? `${stats.activeCount} Active schemes & holdings`
                : 'DPS, FDR, Sanchay Patra & Stocks'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            void Haptics.selectionAsync().catch(() => {});
            onOpenPortfolio();
          }}
          style={styles.manageBtn}>
          <Text style={styles.manageBtnText}>Portfolio</Text>
          <MaterialIcons name="chevron-right" size={14} color="#20C997" />
        </TouchableOpacity>
      </View>

      {/* Hero Portfolio Value Box */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          void Haptics.selectionAsync().catch(() => {});
          onOpenPortfolio();
        }}
        style={styles.heroBox}>
        <View style={styles.heroLeft}>
          <Text style={styles.heroLabel}>TOTAL PORTFOLIO VALUATION</Text>
          <View style={styles.amountDisplayRow}>
            <Text style={styles.takaSign}>৳</Text>
            <RollingNumber
              value={stats.currentMarketValue}
              style={styles.rollingAmount}
            />
          </View>
        </View>

        <View style={styles.heroRight}>
          <View
            style={[
              styles.pnlPill,
              {
                backgroundColor: isGain
                  ? 'rgba(32, 201, 151, 0.15)'
                  : 'rgba(255, 107, 107, 0.15)',
              },
            ]}>
            <MaterialIcons
              name={isGain ? 'trending-up' : 'trending-down'}
              size={12}
              color={isGain ? '#20C997' : '#FF6B6B'}
            />
            <Text
              style={[
                styles.pnlPillText,
                { color: isGain ? '#20C997' : '#FF6B6B' },
              ]}>
              {isGain ? '+' : ''}
              {stats.totalPnLPercent}%
            </Text>
          </View>

          <Text style={styles.gainText}>
            {isGain ? '+' : ''}৳{stats.totalPnL.toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Mini Info Row */}
      <View style={styles.footerRow}>
        <View style={styles.footerTile}>
          <Text style={styles.footerKey}>Invested Capital</Text>
          <Text style={styles.footerVal}>৳{stats.totalInvested.toLocaleString()}</Text>
        </View>

        <View style={styles.footerTile}>
          <Text style={styles.footerKey}>Next Horizon</Text>
          <Text style={[styles.footerVal, { color: '#FF922B' }]}>
            {stats.nextMaturingItem
              ? `${stats.nextMaturingItem.daysLeft}d (${stats.nextMaturingItem.name.split(' ')[0]})`
              : 'Active Growth'}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            onOpenAddInvestment();
          }}
          style={styles.quickAddBtn}>
          <MaterialIcons name="add" size={14} color="#20C997" />
          <Text style={styles.quickAddText}>Add Holding</Text>
        </TouchableOpacity>
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
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(32, 201, 151, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: F.bold,
    fontSize: 11,
    color: '#20C997',
    letterSpacing: 0.8,
  },
  headerSubtitle: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(32, 201, 151, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 2,
  },
  manageBtnText: {
    fontFamily: F.bold,
    fontSize: 11,
    color: '#20C997',
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
    gap: 2,
  },
  heroLabel: {
    fontFamily: F.bold,
    fontSize: 9,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  amountDisplayRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  takaSign: {
    fontFamily: F.bold,
    fontSize: 16,
    color: '#20C997',
  },
  rollingAmount: {
    fontFamily: F.bold,
    fontSize: 22,
    color: '#FFFFFF',
  },
  heroRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  pnlPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 2,
  },
  pnlPillText: {
    fontFamily: F.bold,
    fontSize: 10,
  },
  gainText: {
    fontFamily: F.medium,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  footerTile: {
    flex: 1,
    backgroundColor: '#181F23',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 2,
  },
  footerKey: {
    fontFamily: F.regular,
    fontSize: 9,
    color: C.onSurfaceVariant,
  },
  footerVal: {
    fontFamily: F.bold,
    fontSize: 11,
    color: C.onSurface,
  },
  quickAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(32, 201, 151, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  quickAddText: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#20C997',
  },
});
