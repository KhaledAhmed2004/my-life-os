import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { RollingNumber } from '@/components/ui/rolling-number';
import { ZAKAT_COLORS } from '@/components/zakat/zakat-constants';
import { Vital } from '@/constants/vital-theme';
import { useDebtStore } from '@/stores/debt-store';
import { useLoanStore } from '@/stores/loan-store';
import { useSavingsStore } from '@/stores/savings-store';
import { useZakatStore } from '@/stores/zakat-store';

const C = Vital.colors;
const F = Vital.fonts;

interface ZakatSummaryCardProps {
  onOpenCalculator: () => void;
}

export function ZakatSummaryCard({ onOpenCalculator }: ZakatSummaryCardProps) {
  const calculateZakat = useZakatStore((s) => s.calculateZakat);
  const savingsGoals = useSavingsStore((s) => s.goals);
  const getDebtStats = useDebtStore((s) => s.getStats);
  const getLoanStats = useLoanStore((s) => s.getStats);

  const savingsBalance = useMemo(() => {
    return savingsGoals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  }, [savingsGoals]);

  const debtStats = useMemo(() => {
    return getDebtStats();
  }, [getDebtStats]);

  const loanStats = useMemo(() => {
    return getLoanStats();
  }, [getLoanStats]);

  const result = useMemo(() => {
    return calculateZakat({
      savingsBalance,
      receivableDebts: debtStats.totalLentPending,
      activeLoans: loanStats.totalOutstanding,
      payableDebts: debtStats.totalBorrowedPending,
    });
  }, [calculateZakat, savingsBalance, debtStats, loanStats]);

  const { isNisabReached, zakatDue, netZakatableWealth, nisabThreshold } = result;

  return (
    <View style={styles.card}>
      {/* Top Header */}
      <View style={styles.topRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="auto-awesome" size={18} color={ZAKAT_COLORS.gold} />
          </View>
          <View>
            <Text style={styles.headerTitle}>ZAKAT & NISAB BENCHMARK</Text>
            <Text style={styles.headerSubtitle}>
              {isNisabReached
                ? `Net wealth ৳${netZakatableWealth.toLocaleString()} reaches Nisab`
                : `Nisab threshold: ৳${nisabThreshold.toLocaleString()}`}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            void Haptics.selectionAsync().catch(() => {});
            onOpenCalculator();
          }}
          style={styles.calcBtn}>
          <Text style={styles.calcBtnText}>Calculate</Text>
          <MaterialIcons name="chevron-right" size={14} color={ZAKAT_COLORS.gold} />
        </TouchableOpacity>
      </View>

      {/* Hero Zakat Summary Box */}
      <View
        style={[
          styles.heroBox,
          isNisabReached ? styles.heroBoxActive : styles.heroBoxBelow,
        ]}>
        <View style={styles.heroLeft}>
          <Text style={styles.heroLabel}>
            {isNisabReached ? 'ESTIMATED 2.5% ZAKAT DUE' : 'NET ZAKATABLE WEALTH'}
          </Text>

          <View style={styles.amountDisplayRow}>
            <Text style={styles.takaSign}>৳</Text>
            <RollingNumber
              value={isNisabReached ? zakatDue : netZakatableWealth}
              style={styles.rollingAmount}
            />
          </View>
        </View>

        <View
          style={[
            styles.statusPill,
            isNisabReached ? styles.statusPillActive : styles.statusPillBelow,
          ]}>
          <MaterialIcons
            name={isNisabReached ? 'verified' : 'info-outline'}
            size={12}
            color={isNisabReached ? ZAKAT_COLORS.emerald : ZAKAT_COLORS.goldLight}
          />
          <Text
            style={[
              styles.statusPillText,
              isNisabReached ? styles.statusPillTextActive : styles.statusPillTextBelow,
            ]}>
            {isNisabReached ? 'NISAB REACHED' : 'BELOW NISAB'}
          </Text>
        </View>
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
    backgroundColor: ZAKAT_COLORS.goldGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: F.bold,
    fontSize: 11,
    color: ZAKAT_COLORS.gold,
    letterSpacing: 0.8,
  },
  headerSubtitle: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  calcBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ZAKAT_COLORS.goldGlow,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 2,
  },
  calcBtnText: {
    fontFamily: F.bold,
    fontSize: 11,
    color: ZAKAT_COLORS.gold,
  },
  heroBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    padding: 12,
  },
  heroBoxActive: {
    backgroundColor: ZAKAT_COLORS.goldBackground,
  },
  heroBoxBelow: {
    backgroundColor: '#181F23',
  },
  heroLeft: {
    gap: 2,
  },
  heroLabel: {
    fontFamily: F.bold,
    fontSize: 9,
    color: ZAKAT_COLORS.gold,
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
    color: ZAKAT_COLORS.gold,
  },
  rollingAmount: {
    fontFamily: F.bold,
    fontSize: 20,
    color: '#FFFFFF',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  statusPillActive: {
    backgroundColor: ZAKAT_COLORS.emeraldLight,
  },
  statusPillBelow: {
    backgroundColor: ZAKAT_COLORS.goldGlow,
  },
  statusPillText: {
    fontFamily: F.bold,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  statusPillTextActive: {
    color: ZAKAT_COLORS.emerald,
  },
  statusPillTextBelow: {
    color: ZAKAT_COLORS.goldLight,
  },
});
