import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { RollingNumber } from '@/components/ui/rolling-number';
import { Vital } from '@/constants/vital-theme';
import { useExpenseStore } from '@/stores/expense-store';
import { useSavingsStore } from '@/stores/savings-store';

const C = Vital.colors;
const F = Vital.fonts;

export type VaultFilter = 'ALL' | 'ACTIVE' | 'DONE';

interface SavingsPortfolioHeroProps {
  filter: VaultFilter;
  onFilterChange: (f: VaultFilter) => void;
  onOpenCreateModal: () => void;
}

export function SavingsPortfolioHero({
  filter,
  onFilterChange,
  onOpenCreateModal,
}: SavingsPortfolioHeroProps) {
  const getPortfolioStats = useSavingsStore((s) => s.getPortfolioStats);
  const getTotals = useExpenseStore((s) => s.getTotals);

  const stats = getPortfolioStats();
  const { netBalance } = getTotals(); // Spendable cash in wallet

  const spendableCash = netBalance;
  const totalNetWorth = spendableCash + stats.totalSaved;

  return (
    <View style={styles.container}>
      {/* MAIN HERO CARD */}
      <View style={styles.heroCard}>
        {/* TOP ROW: TITLE + NEW VAULT BUTTON */}
        <View style={styles.topRow}>
          <View style={styles.titleBadge}>
            <Text style={styles.titleText}>WEALTH VAULTS & RESERVES</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              onOpenCreateModal();
            }}
            style={styles.newVaultBtn}>
            <MaterialIcons name="add" size={16} color="#101416" />
            <Text style={styles.newVaultBtnText}>New Vault</Text>
          </TouchableOpacity>
        </View>

        {/* WEALTH METRIC BENTO: SPENDABLE CASH VS VAULT SAVINGS */}
        <View style={styles.wealthBentoRow}>
          {/* VAULT SAVINGS */}
          <View style={styles.wealthCol}>
            <Text style={styles.wealthLabel}>SAVINGS IN VAULTS</Text>
            <RollingNumber
              value={stats.totalSaved}
              suffix=" ৳"
              style={styles.wealthAmountMain}
            />
          </View>

          {/* SPENDABLE WALLET CASH */}
          <View style={styles.wealthCol}>
            <Text style={styles.wealthLabel}>SPENDABLE CASH</Text>
            <RollingNumber
              value={spendableCash}
              suffix=" ৳"
              style={styles.wealthAmountSub}
            />
          </View>
        </View>

        {/* GLOBAL PROGRESS BAR */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <View style={styles.netWorthRow}>
              <Text style={styles.progressLabel}>NET WORTH: </Text>
              <RollingNumber
                value={totalNetWorth}
                suffix=" ৳"
                style={styles.progressLabel}
              />
            </View>
            <Text style={styles.progressValue}>
              {stats.overallPercentage.toFixed(0)}% of target met
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, Math.max(2, stats.overallPercentage))}%` },
              ]}
            />
          </View>
        </View>

        {/* GROWTH VELOCITY PILL */}
        {stats.monthlyGrowth > 0 && (
          <View style={styles.velocityPill}>
            <MaterialIcons name="bolt" size={14} color="#C8F135" />
            <Text style={styles.velocityText}>
              +{stats.monthlyGrowth.toLocaleString('en-US').replace(/,/g, ' ')} ৳ deposited this month
            </Text>
          </View>
        )}
      </View>

      {/* FILTER CHIPS (ALL, ACTIVE, COMPLETED) */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            onFilterChange('ALL');
          }}
          style={[styles.filterChip, filter === 'ALL' && styles.filterChipActive]}>
          <Text style={[styles.filterChipText, filter === 'ALL' && styles.filterChipTextActive]}>
            All ({stats.activeCount + stats.completedCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            onFilterChange('ACTIVE');
          }}
          style={[styles.filterChip, filter === 'ACTIVE' && styles.filterChipActive]}>
          <Text style={[styles.filterChipText, filter === 'ACTIVE' && styles.filterChipTextActive]}>
            🎯 Active ({stats.activeCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            onFilterChange('DONE');
          }}
          style={[styles.filterChip, filter === 'DONE' && styles.filterChipActive]}>
          <Text style={[styles.filterChipText, filter === 'DONE' && styles.filterChipTextActive]}>
            🏆 Completed ({stats.completedCount})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  heroCard: {
    backgroundColor: '#161A1D',
    borderRadius: 24,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontFamily: F.sansBold,
    fontSize: 10,
    color: C.onSurfaceVariant,
    letterSpacing: 0.8,
  },
  newVaultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#C8F135',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#C8F135',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  newVaultBtnText: {
    fontFamily: F.sansBold,
    fontSize: 12,
    color: '#101416',
  },
  wealthBentoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  wealthCol: {
    gap: 2,
  },
  wealthLabel: {
    fontFamily: F.sansBold,
    fontSize: 10,
    color: C.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  wealthAmountMain: {
    fontFamily: F.sansBold,
    fontSize: 22,
    color: C.onSurface,
  },
  wealthAmountSub: {
    fontFamily: F.sansBold,
    fontSize: 18,
    color: '#20C997',
  },
  progressSection: {
    gap: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  netWorthRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressLabel: {
    fontFamily: F.sansBold,
    fontSize: 10,
    color: C.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  progressValue: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: '#C8F135',
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#C8F135',
    borderRadius: 4,
  },
  velocityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(200, 241, 53, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  velocityText: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: '#C8F135',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  filterChipActive: {
    backgroundColor: C.onSurface,
    borderColor: C.onSurface,
  },
  filterChipText: {
    fontFamily: F.sansMedium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  filterChipTextActive: {
    color: '#101416',
    fontFamily: F.sansBold,
  },
});
