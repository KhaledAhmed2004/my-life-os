import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { RollingNumber } from '@/components/ui/rolling-number';
import { Vital } from '@/constants/vital-theme';
import { useSplitBillStore } from '@/stores/split-bill-store';

const C = Vital.colors;
const F = Vital.fonts;

interface SplitBillSummaryCardProps {
  onOpenSplitManager: () => void;
}

export function SplitBillSummaryCard({
  onOpenSplitManager,
}: SplitBillSummaryCardProps) {
  const sessions = useSplitBillStore((s) => s.sessions);
  const getStats = useSplitBillStore((s) => s.getStats);
  const stats = useMemo(() => getStats(), [getStats, sessions]);

  return (
    <View style={styles.card}>
      {/* Top Header */}
      <View style={styles.topRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="call-split" size={18} color="#20C997" />
          </View>
          <View>
            <Text style={styles.headerTitle}>GROUP BILL & RESTAURANT SPLIT</Text>
            <Text style={styles.headerSubtitle}>
              {stats.unsettledFriendsCount > 0
                ? `${stats.unsettledFriendsCount} Friends pending payback`
                : 'Equal & dish split with WhatsApp & Udhaar sync'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            void Haptics.selectionAsync().catch(() => {});
            onOpenSplitManager();
          }}
          style={styles.splitBtn}>
          <Text style={styles.splitBtnText}>Split Bill</Text>
          <MaterialIcons name="chevron-right" size={14} color="#20C997" />
        </TouchableOpacity>
      </View>

      {/* Hero Summary Box */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          void Haptics.selectionAsync().catch(() => {});
          onOpenSplitManager();
        }}
        style={styles.heroBox}>
        <View style={styles.heroLeft}>
          <Text style={styles.heroLabel}>UNSETTLED GROUP RECEIVABLE</Text>
          <View style={styles.amountDisplayRow}>
            <Text style={styles.takaSign}>৳</Text>
            <RollingNumber
              value={stats.totalUnsettledReceivable}
              style={styles.rollingAmount}
            />
          </View>
        </View>

        <View style={styles.heroRight}>
          <View style={styles.statusPill}>
            <MaterialIcons name="people" size={12} color="#38BDF8" />
            <Text style={styles.statusPillText}>
              {stats.totalSessionsCount} Sessions
            </Text>
          </View>
          <Text style={styles.subtext}>
            Total: ৳{stats.totalBillsVolume.toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
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
  splitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(32, 201, 151, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 2,
  },
  splitBtnText: {
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
    gap: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusPillText: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#38BDF8',
  },
  subtext: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
});
