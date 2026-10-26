import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useMessStore } from '@/stores/mess-store';
import { Vital } from '@/constants/vital-theme';

const C = Vital.colors;
const F = Vital.fonts;

interface MessSummaryCardProps {
  onOpenMessStudio: () => void;
}

export function MessSummaryCard({ onOpenMessStudio }: MessSummaryCardProps) {
  const currentSession = useMessStore((s) => s.currentSession);
  const getStats = useMessStore((s) => s.getStats);

  const stats = useMemo(() => getStats(), [getStats, currentSession]);

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onOpenMessStudio();
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
            <MaterialIcons name="apartment" size={18} color="#38BDF8" />
          </View>
          <View>
            <Text style={styles.title}>BACHELOR MESS & FLAT</Text>
            <Text style={styles.subtitle}>
              {currentSession.monthTitle} • {currentSession.members.length} Roommates
            </Text>
          </View>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {stats.totalMeals} Meals
          </Text>
        </View>
      </View>

      {/* Main Metric Hero */}
      <View style={styles.mainMetricRow}>
        <View>
          <Text style={styles.metricLabel}>LIVE MEAL RATE</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.takaSymbol}>৳</Text>
            <Text style={styles.amountText}>
              {stats.mealRate.toFixed(2)}
            </Text>
            <Text style={styles.unitText}>/ meal</Text>
          </View>
        </View>

        <View style={styles.dueBox}>
          <Text style={styles.dueLabel}>DUE FROM ROOMMATES</Text>
          <Text
            style={[
              styles.dueVal,
              { color: stats.totalDueReceivables > 0 ? '#FF922B' : '#20C997' },
            ]}>
            {stats.totalDueReceivables > 0
              ? `৳${stats.totalDueReceivables.toLocaleString()}`
              : 'All Settled'}
          </Text>
        </View>
      </View>

      {/* Bento Sub-Metrics */}
      <View style={styles.bentoRow}>
        <View style={styles.bentoItem}>
          <Text style={styles.bentoLabel}>TOTAL BAZAAR</Text>
          <Text style={styles.bentoVal}>
            ৳{stats.totalBazaar.toLocaleString()}
          </Text>
          <Text style={styles.bentoSub}>বাজার খরচ</Text>
        </View>

        <View style={styles.bentoItem}>
          <Text style={styles.bentoLabel}>FIXED UTILITIES</Text>
          <Text style={styles.bentoVal}>
            ৳{stats.totalUtilities.toLocaleString()}
          </Text>
          <Text style={styles.bentoSub}>বাসা ও বিল</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footerRow}>
        <View style={styles.footerTip}>
          <MaterialIcons name="fastfood" size={14} color="#38BDF8" />
          <Text style={styles.footerTipText} numberOfLines={1}>
            {currentSession.bazaarEntries.length} বাজার এন্ট্রি • {currentSession.members.length} মেম্বার অ্যাক্টিভ
          </Text>
        </View>

        <View style={styles.chevronRow}>
          <Text style={styles.manageText}>Mess Studio</Text>
          <MaterialIcons name="chevron-right" size={16} color="#38BDF8" />
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
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
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
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#38BDF8',
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
    color: '#38BDF8',
  },
  amountText: {
    fontFamily: F.bold,
    fontSize: 26,
    color: '#FFFFFF',
  },
  unitText: {
    fontFamily: F.medium,
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  dueBox: {
    backgroundColor: '#181F23',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'flex-end',
    gap: 2,
  },
  dueLabel: {
    fontFamily: F.bold,
    fontSize: 8,
    color: C.onSurfaceVariant,
    letterSpacing: 0.4,
  },
  dueVal: {
    fontFamily: F.bold,
    fontSize: 12,
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
    color: '#38BDF8',
  },
});
