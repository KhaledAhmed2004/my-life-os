import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { DEBT_STATUS_METAS, DEBT_TYPE_METAS } from '@/components/debt/debt-constants';
import { Vital } from '@/constants/vital-theme';
import { DebtItem } from '@/types/debt';

const C = Vital.colors;
const F = Vital.fonts;

interface DebtItemCardProps {
  debt: DebtItem;
  onPress: (debt: DebtItem) => void;
  onQuickRecordPayment?: (debt: DebtItem) => void;
}

export function DebtItemCard({
  debt,
  onPress,
  onQuickRecordPayment,
}: DebtItemCardProps) {
  const typeMeta = DEBT_TYPE_METAS[debt.type] || DEBT_TYPE_METAS.I_LENT;
  const statusMeta = DEBT_STATUS_METAS[debt.status] || DEBT_STATUS_METAS.PENDING;

  const initials = useMemo(() => {
    return debt.personName
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('');
  }, [debt.personName]);

  const progressPercent = useMemo(() => {
    if (debt.status === 'SETTLED' || debt.remainingAmount <= 0) return 100;
    if (debt.amount <= 0) return 0;
    return Math.min(100, Math.max(0, Math.round((debt.paidAmount / debt.amount) * 100)));
  }, [debt.status, debt.remainingAmount, debt.amount, debt.paidAmount]);

  const dueInfo = useMemo(() => {
    if (!debt.dueDate || debt.status === 'SETTLED') return null;
    const diffMs = debt.dueDate - Date.now();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (days < 0) {
      return { text: `${Math.abs(days)}d Overdue`, isOverdue: true };
    }
    if (days === 0) {
      return { text: 'Due Today', isOverdue: true };
    }
    return { text: `Due in ${days}d`, isOverdue: false };
  }, [debt.dueDate, debt.status]);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => {
        void Haptics.selectionAsync().catch(() => {});
        onPress(debt);
      }}
      style={styles.card}>
      {/* 1. TOP HEADER: Avatar + Name + Type Badge */}
      <View style={styles.topRow}>
        <View style={styles.personGroup}>
          <View style={[styles.avatarCircle, { backgroundColor: typeMeta.bg }]}>
            <Text style={[styles.avatarText, { color: typeMeta.color }]}>
              {initials || '?'}
            </Text>
          </View>
          <View style={styles.nameColumn}>
            <Text style={styles.personName} numberOfLines={1}>
              {debt.personName}
            </Text>
            {Boolean(debt.phone) && (
              <Text style={styles.phoneText} numberOfLines={1}>
                {debt.phone}
              </Text>
            )}
          </View>
        </View>

        <View style={[styles.typeBadge, { backgroundColor: typeMeta.bg }]}>
          <MaterialIcons name={typeMeta.icon} size={11} color={typeMeta.color} />
          <Text style={[styles.typeBadgeText, { color: typeMeta.color }]}>
            {typeMeta.badgeText}
          </Text>
        </View>
      </View>

      {/* 2. AMOUNT METRICS */}
      <View style={styles.amountBox}>
        <View>
          <Text style={styles.amountLabel}>
            {debt.status === 'SETTLED' ? 'TOTAL AMOUNT SETTLED' : 'REMAINING BALANCE'}
          </Text>
          <View style={styles.mainAmountRow}>
            <Text style={[styles.currencySymbol, { color: typeMeta.color }]}>৳</Text>
            <Text style={[styles.mainAmountVal, { color: typeMeta.color }]}>
              {(debt.status === 'SETTLED' ? debt.amount : debt.remainingAmount).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={[styles.statusPill, { backgroundColor: statusMeta.bg }]}>
          <MaterialIcons name={statusMeta.icon} size={12} color={statusMeta.color} />
          <Text style={[styles.statusPillText, { color: statusMeta.color }]}>
            {statusMeta.label}
          </Text>
        </View>
      </View>

      {/* 3. REPAYMENT PROGRESS */}
      {debt.status !== 'SETTLED' && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercent}%`, backgroundColor: typeMeta.color },
              ]}
            />
          </View>
          <View style={styles.progressSubRow}>
            <Text style={styles.progressSubText}>
              Paid: ৳{debt.paidAmount.toLocaleString()} ({progressPercent}%)
            </Text>
            <Text style={styles.progressSubText}>
              Total: ৳{debt.amount.toLocaleString()}
            </Text>
          </View>
        </View>
      )}

      {/* 4. FOOTER DUE & QUICK ACTION */}
      {debt.status !== 'SETTLED' && (
        <View style={styles.footerRow}>
          {dueInfo ? (
            <View style={styles.dueBadge}>
              <MaterialIcons
                name={dueInfo.isOverdue ? 'warning' : 'schedule'}
                size={12}
                color={dueInfo.isOverdue ? '#FF6B6B' : C.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.dueBadgeText,
                  { color: dueInfo.isOverdue ? '#FF6B6B' : C.onSurfaceVariant },
                ]}>
                {dueInfo.text}
              </Text>
            </View>
          ) : (
            <Text style={styles.startDateText}>
              Added {new Date(debt.startDate).toLocaleDateString()}
            </Text>
          )}

          {onQuickRecordPayment && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                onQuickRecordPayment(debt);
              }}
              style={[styles.quickPayBtn, { backgroundColor: typeMeta.color }]}>
              <MaterialIcons name="done" size={13} color="#0D1113" />
              <Text style={styles.quickPayBtnText}>Repay / Settle</Text>
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
    borderRadius: 18,
    padding: 14,
    gap: 10,
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
  personGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: F.bold,
    fontSize: 13,
  },
  nameColumn: {
    flex: 1,
    gap: 1,
  },
  personName: {
    fontFamily: F.bold,
    fontSize: 14,
    color: C.onSurface,
  },
  phoneText: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontFamily: F.bold,
    fontSize: 9,
    letterSpacing: 0.4,
  },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: '#181F23',
    borderRadius: 12,
    padding: 10,
  },
  amountLabel: {
    fontFamily: F.bold,
    fontSize: 9,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  mainAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    marginTop: 2,
  },
  currencySymbol: {
    fontFamily: F.bold,
    fontSize: 15,
  },
  mainAmountVal: {
    fontFamily: F.bold,
    fontSize: 18,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPillText: {
    fontFamily: F.medium,
    fontSize: 10,
  },
  progressContainer: {
    gap: 4,
  },
  progressBarTrack: {
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#20282D',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  progressSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressSubText: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  dueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueBadgeText: {
    fontFamily: F.medium,
    fontSize: 11,
  },
  startDateText: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  quickPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  quickPayBtnText: {
    fontFamily: F.bold,
    fontSize: 11,
    color: '#0D1113',
  },
});
