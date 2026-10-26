import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { LOAN_CATEGORIES, LOAN_STATUS_THEMES } from '@/components/loan/loan-constants';
import { Vital } from '@/constants/vital-theme';
import { LoanItem } from '@/types/loan';

const C = Vital.colors;
const F = Vital.fonts;

interface LoanItemCardProps {
  loan: LoanItem;
  onPress: (loan: LoanItem) => void;
  onQuickPayEmi?: (loan: LoanItem) => void;
}

export function LoanItemCard({ loan, onPress, onQuickPayEmi }: LoanItemCardProps) {
  const categoryMeta = LOAN_CATEGORIES[loan.category] || LOAN_CATEGORIES.OTHER;
  const statusTheme = LOAN_STATUS_THEMES[loan.status] || LOAN_STATUS_THEMES.ACTIVE;

  const progressPercent = useMemo(() => {
    if (loan.status === 'PAID_OFF' || loan.remainingBalance <= 0) return 100;
    if (loan.principalAmount <= 0) return 0;
    const paid = loan.principalAmount - loan.remainingBalance;
    return Math.min(100, Math.max(0, Math.round((paid / loan.principalAmount) * 100)));
  }, [loan.status, loan.remainingBalance, loan.principalAmount]);

  const daysUntilDue = useMemo(() => {
    const diffMs = loan.nextDueDate - Date.now();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }, [loan.nextDueDate]);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => {
        void Haptics.selectionAsync().catch(() => {});
        onPress(loan);
      }}
      style={styles.card}>
      {/* 1. TOP ROW: Category Icon, Title, Status */}
      <View style={styles.topRow}>
        <View style={styles.leftGroup}>
          <View style={[styles.iconSquare, { backgroundColor: categoryMeta.bg }]}>
            <MaterialIcons name={categoryMeta.icon} size={20} color={categoryMeta.color} />
          </View>
          <View style={styles.titleColumn}>
            <Text style={styles.loanName} numberOfLines={1}>
              {loan.name}
            </Text>
            <Text style={styles.lenderText} numberOfLines={1}>
              {loan.lender} • {loan.interestRate}% p.a.
            </Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusTheme.bg }]}>
          <MaterialIcons name={statusTheme.icon} size={12} color={statusTheme.color} />
          <Text style={[styles.statusBadgeText, { color: statusTheme.color }]}>
            {statusTheme.label}
          </Text>
        </View>
      </View>

      {/* 2. FINANCIAL METRICS ROW */}
      <View style={styles.metricsRow}>
        <View style={styles.metricTile}>
          <Text style={styles.metricLabel}>MONTHLY EMI</Text>
          <Text style={styles.emiHighlight}>
            ৳{loan.monthlyEmi.toLocaleString()}
          </Text>
        </View>

        <View style={styles.metricTile}>
          <Text style={styles.metricLabel}>REMAINING</Text>
          <Text style={styles.remainingValue}>
            ৳{loan.remainingBalance.toLocaleString()}
          </Text>
        </View>

        <View style={styles.metricTile}>
          <Text style={styles.metricLabel}>TENURE</Text>
          <Text style={styles.tenureValue}>
            {loan.paymentsMade}/{loan.tenureMonths} Mo
          </Text>
        </View>
      </View>

      {/* 3. PROGRESS BAR */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercent}%`,
                backgroundColor: loan.status === 'PAID_OFF' ? '#20C997' : categoryMeta.color,
              },
            ]}
          />
        </View>
        <View style={styles.progressFooter}>
          <Text style={styles.progressSubtext}>
            {progressPercent}% Principal Repaid
          </Text>
          <Text style={styles.progressSubtext}>
            Original: ৳{loan.principalAmount.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* 4. FOOTER DUE ALERT & QUICK PAY BUTTON */}
      {loan.status === 'ACTIVE' && (
        <View style={styles.footerRow}>
          <View style={styles.dueAlertPill}>
            <MaterialIcons
              name={daysUntilDue <= 3 ? 'warning' : 'schedule'}
              size={13}
              color={daysUntilDue <= 3 ? '#FF6B6B' : '#38BDF8'}
            />
            <Text
              style={[
                styles.dueAlertText,
                { color: daysUntilDue <= 3 ? '#FF6B6B' : '#38BDF8' },
              ]}>
              {daysUntilDue === 0
                ? 'Due Today'
                : daysUntilDue > 0
                ? `Due in ${daysUntilDue} days`
                : `${Math.abs(daysUntilDue)} days overdue`}
            </Text>
          </View>

          {onQuickPayEmi && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                onQuickPayEmi(loan);
              }}
              style={styles.quickPayBtn}>
              <MaterialIcons name="check" size={14} color="#0D1113" />
              <Text style={styles.quickPayBtnText}>Pay EMI</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#13191C',
    borderRadius: 20,
    padding: 14,
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
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  iconSquare: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleColumn: {
    flex: 1,
    gap: 2,
  },
  loanName: {
    fontFamily: F.bold,
    fontSize: 14,
    color: C.onSurface,
  },
  lenderText: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontFamily: F.bold,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: '#181F23',
    borderRadius: 12,
    padding: 10,
    justifyContent: 'space-between',
  },
  metricTile: {
    gap: 2,
  },
  metricLabel: {
    fontFamily: F.bold,
    fontSize: 9,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  emiHighlight: {
    fontFamily: F.bold,
    fontSize: 14,
    color: '#38BDF8',
  },
  remainingValue: {
    fontFamily: F.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  tenureValue: {
    fontFamily: F.bold,
    fontSize: 14,
    color: '#A78BFA',
  },
  progressContainer: {
    gap: 4,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#20282D',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressSubtext: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  dueAlertPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#181F23',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dueAlertText: {
    fontFamily: F.medium,
    fontSize: 11,
  },
  quickPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#38BDF8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quickPayBtnText: {
    fontFamily: F.bold,
    fontSize: 11,
    color: '#0D1113',
  },
});
