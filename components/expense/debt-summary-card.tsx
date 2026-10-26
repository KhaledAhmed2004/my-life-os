import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Vital } from '@/constants/vital-theme';
import { useDebtStore } from '@/stores/debt-store';

const C = Vital.colors;
const F = Vital.fonts;

interface DebtSummaryCardProps {
  onOpenAddDebt: () => void;
  onViewAllDebts: () => void;
}

export function DebtSummaryCard({
  onOpenAddDebt,
  onViewAllDebts,
}: DebtSummaryCardProps) {
  const getStats = useDebtStore((s) => s.getStats);
  const debts = useDebtStore((s) => s.debts);
  const stats = useMemo(() => getStats(), [getStats, debts]);

  return (
    <View style={styles.card}>
      {/* 1. TOP BAR */}
      <View style={styles.topRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconSquare}>
            <MaterialIcons name="swap-horiz" size={18} color="#51CF66" />
          </View>
          <View>
            <Text style={styles.headerTitle}>DEBT & UDHAAR TRACKER</Text>
            <Text style={styles.headerSubtitle}>Personal borrow & lend manager</Text>
          </View>
        </View>

        <View
          style={[
            styles.netBadge,
            {
              backgroundColor:
                stats.netBalance >= 0
                  ? 'rgba(32, 201, 151, 0.15)'
                  : 'rgba(255, 107, 107, 0.15)',
            },
          ]}>
          <Text
            style={[
              styles.netBadgeText,
              { color: stats.netBalance >= 0 ? '#20C997' : '#FF6B6B' },
            ]}>
            {stats.netBalance >= 0 ? 'NET RECEIVABLE' : 'NET PAYABLE'}
          </Text>
        </View>
      </View>

      {/* 2. DUAL TILES: LENT VS BORROWED */}
      <View style={styles.dualTiles}>
        <View style={styles.lentTile}>
          <View style={styles.tileHeader}>
            <MaterialIcons name="call-made" size={14} color="#20C997" />
            <Text style={styles.lentLabel}>YOU ARE OWED</Text>
          </View>
          <Text style={styles.lentValue}>৳{stats.totalLentPending.toLocaleString()}</Text>
          <Text style={styles.tileSubText}>
            {stats.activeLentCount} {stats.activeLentCount === 1 ? 'Person' : 'People'}
          </Text>
        </View>

        <View style={styles.borrowedTile}>
          <View style={styles.tileHeader}>
            <MaterialIcons name="call-received" size={14} color="#FF6B6B" />
            <Text style={styles.borrowedLabel}>YOU OWE</Text>
          </View>
          <Text style={styles.borrowedValue}>
            ৳{stats.totalBorrowedPending.toLocaleString()}
          </Text>
          <Text style={styles.tileSubText}>
            {stats.activeBorrowedCount} {stats.activeBorrowedCount === 1 ? 'Person' : 'People'}
          </Text>
        </View>
      </View>

      {/* 3. OVERDUE ALERT IF APPLICABLE */}
      {stats.overdueCount > 0 && (
        <View style={styles.overdueAlert}>
          <MaterialIcons name="warning" size={14} color="#FF6B6B" />
          <Text style={styles.overdueAlertText}>
            {stats.overdueCount} {stats.overdueCount === 1 ? 'record is' : 'records are'} overdue for repayment
          </Text>
        </View>
      )}

      {/* 4. ACTIONS */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            void Haptics.selectionAsync().catch(() => {});
            onViewAllDebts();
          }}
          style={styles.viewAllBtn}>
          <Text style={styles.viewAllBtnText}>Manage Udhaar ({debts.length})</Text>
          <MaterialIcons name="chevron-right" size={16} color={C.onSurfaceVariant} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            onOpenAddDebt();
          }}
          style={styles.addDebtBtn}>
          <MaterialIcons name="add" size={16} color="#0D1113" />
          <Text style={styles.addDebtBtnText}>Record</Text>
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
    backgroundColor: 'rgba(81, 207, 102, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: F.bold,
    fontSize: 11,
    color: '#51CF66',
    letterSpacing: 0.8,
  },
  headerSubtitle: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  netBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  netBadgeText: {
    fontFamily: F.bold,
    fontSize: 9,
    letterSpacing: 0.4,
  },
  dualTiles: {
    flexDirection: 'row',
    gap: 10,
  },
  lentTile: {
    flex: 1,
    backgroundColor: '#181F23',
    borderRadius: 14,
    padding: 12,
    gap: 2,
  },
  borrowedTile: {
    flex: 1,
    backgroundColor: '#181F23',
    borderRadius: 14,
    padding: 12,
    gap: 2,
  },
  tileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lentLabel: {
    fontFamily: F.bold,
    fontSize: 9,
    color: '#20C997',
    letterSpacing: 0.6,
  },
  borrowedLabel: {
    fontFamily: F.bold,
    fontSize: 9,
    color: '#FF6B6B',
    letterSpacing: 0.6,
  },
  lentValue: {
    fontFamily: F.bold,
    fontSize: 16,
    color: '#20C997',
    marginTop: 2,
  },
  borrowedValue: {
    fontFamily: F.bold,
    fontSize: 16,
    color: '#FF6B6B',
    marginTop: 2,
  },
  tileSubText: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  overdueAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  overdueAlertText: {
    fontFamily: F.medium,
    fontSize: 11,
    color: '#FF6B6B',
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
  addDebtBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#51CF66',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addDebtBtnText: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#0D1113',
  },
});
