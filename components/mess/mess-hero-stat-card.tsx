import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Vital } from '@/constants/vital-theme';
import { MessSummaryStats } from '@/types/mess';

const C = Vital.colors;
const F = Vital.fonts;

interface MessHeroStatCardProps {
  monthTitle: string;
  stats: MessSummaryStats;
}

export function MessHeroStatCard({ monthTitle, stats }: MessHeroStatCardProps) {
  const {
    totalBazaar,
    totalMeals,
    mealRate,
    totalUtilities,
    cashInHand,
    totalDueReceivables,
  } = stats;

  return (
    <View style={styles.card}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="restaurant-menu" size={18} color="#38BDF8" />
          </View>
          <View>
            <Text style={styles.title}>{monthTitle.toUpperCase()}</Text>
            <Text style={styles.subtitle}>মেস ও মিল রেট লাইভ হিসাব</Text>
          </View>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{totalMeals} Meals Logged</Text>
        </View>
      </View>

      {/* Main Meal Rate Display */}
      <View style={styles.mealRateHero}>
        <Text style={styles.rateLabel}>CURRENT MEAL RATE</Text>
        <View style={styles.rateRow}>
          <Text style={styles.takaSymbol}>৳</Text>
          <Text style={styles.rateValue}>{mealRate.toFixed(2)}</Text>
          <Text style={styles.rateUnit}>/ meal</Text>
        </View>
        <Text style={styles.rateSub}>
          মোট বাজার (৳{totalBazaar.toLocaleString()}) ÷ মোট মিল ({totalMeals})
        </Text>
      </View>

      {/* Bento Sub-Metrics 2x2 */}
      <View style={styles.grid}>
        <View style={styles.gridTile}>
          <Text style={styles.tileLabel}>TOTAL BAZAAR</Text>
          <Text style={styles.tileValue}>৳{totalBazaar.toLocaleString()}</Text>
          <Text style={styles.tileSub}>বাজার খরচ</Text>
        </View>

        <View style={styles.gridTile}>
          <Text style={styles.tileLabel}>FIXED UTILITIES</Text>
          <Text style={styles.tileValue}>৳{totalUtilities.toLocaleString()}</Text>
          <Text style={styles.tileSub}>বাসা ভাড়া ও বিল</Text>
        </View>

        <View style={styles.gridTile}>
          <Text style={styles.tileLabel}>CASH IN HAND</Text>
          <Text
            style={[
              styles.tileValue,
              { color: cashInHand >= 0 ? '#20C997' : '#FF6B6B' },
            ]}>
            ৳{cashInHand.toLocaleString()}
          </Text>
          <Text style={styles.tileSub}>মেস ফান্ড ব্যালেন্স</Text>
        </View>

        <View style={styles.gridTile}>
          <Text style={styles.tileLabel}>DUE RECEIVABLES</Text>
          <Text style={[styles.tileValue, { color: '#FF922B' }]}>
            ৳{totalDueReceivables.toLocaleString()}
          </Text>
          <Text style={styles.tileSub}>বকেয়া আদায় বাকি</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#181F23',
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
    fontSize: 13,
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
  mealRateHero: {
    backgroundColor: '#13191C',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.15)',
  },
  rateLabel: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#38BDF8',
    letterSpacing: 0.6,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  takaSymbol: {
    fontFamily: F.bold,
    fontSize: 22,
    color: '#38BDF8',
  },
  rateValue: {
    fontFamily: F.bold,
    fontSize: 34,
    color: '#FFFFFF',
  },
  rateUnit: {
    fontFamily: F.medium,
    fontSize: 14,
    color: C.onSurfaceVariant,
  },
  rateSub: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridTile: {
    width: '48%',
    backgroundColor: '#13191C',
    borderRadius: 12,
    padding: 10,
    gap: 2,
  },
  tileLabel: {
    fontFamily: F.bold,
    fontSize: 9,
    color: C.onSurfaceVariant,
    letterSpacing: 0.4,
  },
  tileValue: {
    fontFamily: F.bold,
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 2,
  },
  tileSub: {
    fontFamily: F.regular,
    fontSize: 9,
    color: C.onSurfaceVariant,
  },
});
