import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Vital } from '@/constants/vital-theme';
import { useLoanStore } from '@/stores/loan-store';

const C = Vital.colors;
const F = Vital.fonts;

interface LoansSummaryCardProps {
  onOpenCalculator: () => void;
  onOpenAddLoan: () => void;
  onViewAllLoans: () => void;
}

export function LoansSummaryCard({
  onOpenCalculator,
  onOpenAddLoan,
  onViewAllLoans,
}: LoansSummaryCardProps) {
  const getStats = useLoanStore((s) => s.getStats);
  const loans = useLoanStore((s) => s.loans);
  const stats = useMemo(() => getStats(), [getStats, loans]);

  const daysToNextDue = useMemo(() => {
    if (!stats.nextEmiDueDate) return null;
    const diff = stats.nextEmiDueDate - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [stats.nextEmiDueDate]);

  return (
    <View style={styles.card}>
      {/* 1. TOP BAR */}
      <View style={styles.topRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconSquare}>
            <MaterialIcons name="account-balance" size={18} color="#38BDF8" />
          </View>
          <View>
            <Text style={styles.headerTitle}>LOANS & EMI OBLIGATIONS</Text>
            <Text style={styles.headerSubtitle}>
              {stats.activeLoansCount} Active {stats.activeLoansCount === 1 ? 'Loan' : 'Loans'} Tracked
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            onOpenCalculator();
          }}
          style={styles.calcBtn}>
          <MaterialIcons name="calculate" size={14} color="#38BDF8" />
          <Text style={styles.calcBtnText}>Calculator</Text>
        </TouchableOpacity>
      </View>

      {/* 2. DUAL METRICS */}
      <View style={styles.metricsRow}>
        <View style={styles.metricTile}>
          <Text style={styles.metricLabel}>MONTHLY EMI BURDEN</Text>
          <Text style={styles.monthlyEmiVal}>
            ৳{stats.totalMonthlyEmi.toLocaleString()}
          </Text>
          <Text style={styles.metricSub}>Monthly Commitment</Text>
        </View>

        <View style={styles.metricTile}>
          <Text style={styles.metricLabel}>TOTAL OUTSTANDING</Text>
          <Text style={styles.outstandingVal}>
            ৳{stats.totalOutstanding.toLocaleString()}
          </Text>
          <Text style={styles.metricSub}>
            {stats.overallProgressPercent}% Principal Paid
          </Text>
        </View>
      </View>

      {/* 3. DUE ALERT BANNER */}
      {stats.nextEmiDueDate && (
        <View style={styles.dueBanner}>
          <MaterialIcons
            name={daysToNextDue !== null && daysToNextDue <= 3 ? 'warning' : 'schedule'}
            size={14}
            color={daysToNextDue !== null && daysToNextDue <= 3 ? '#FF6B6B' : '#38BDF8'}
          />
          <Text style={styles.dueBannerText}>
            Next EMI: <Text style={styles.dueHighlight}>৳{stats.nextEmiAmount.toLocaleString()}</Text>{' '}
            {daysToNextDue === 0
              ? '(Due Today)'
              : daysToNextDue !== null && daysToNextDue > 0
              ? `(in ${daysToNextDue} days)`
              : `(${Math.abs(daysToNextDue || 0)}d overdue)`}
          </Text>
        </View>
      )}

      {/* 4. ACTIONS */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            void Haptics.selectionAsync().catch(() => {});
            onViewAllLoans();
          }}
          style={styles.viewAllBtn}>
          <Text style={styles.viewAllBtnText}>Manage Loans ({loans.length})</Text>
          <MaterialIcons name="chevron-right" size={16} color={C.onSurfaceVariant} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            onOpenAddLoan();
          }}
          style={styles.addLoanBtn}>
          <MaterialIcons name="add" size={16} color="#0D1113" />
          <Text style={styles.addLoanBtnText}>Add Loan</Text>
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
  },
  iconSquare: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: F.bold,
    fontSize: 11,
    color: '#38BDF8',
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
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  calcBtnText: {
    fontFamily: F.bold,
    fontSize: 11,
    color: '#38BDF8',
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: '#181F23',
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  metricTile: {
    flex: 1,
    gap: 2,
  },
  metricLabel: {
    fontFamily: F.bold,
    fontSize: 9,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  monthlyEmiVal: {
    fontFamily: F.bold,
    fontSize: 16,
    color: '#38BDF8',
    marginTop: 2,
  },
  outstandingVal: {
    fontFamily: F.bold,
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 2,
  },
  metricSub: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  dueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#181F23',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  dueBannerText: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  dueHighlight: {
    fontFamily: F.bold,
    color: C.onSurface,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 2,
  },
  viewAllBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#181F23',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  viewAllBtnText: {
    fontFamily: F.medium,
    fontSize: 12,
    color: C.onSurface,
  },
  addLoanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#38BDF8',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addLoanBtnText: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#0D1113',
  },
});
