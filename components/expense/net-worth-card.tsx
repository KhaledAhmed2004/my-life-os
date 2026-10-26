import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { RollingNumber } from '@/components/ui/rolling-number';
import { Vital } from '@/constants/vital-theme';
import { useDebtStore } from '@/stores/debt-store';
import { useExpenseStore } from '@/stores/expense-store';
import { useInvestmentStore } from '@/stores/investment-store';
import { useLoanStore } from '@/stores/loan-store';
import { useSavingsStore } from '@/stores/savings-store';
import { useWarrantyStore } from '@/stores/warranty-store';

const C = Vital.colors;
const F = Vital.fonts;

interface NetWorthCardProps {
  onOpenLoans?: () => void;
  onOpenDebts?: () => void;
}

export function NetWorthCard({ onOpenLoans, onOpenDebts }: NetWorthCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Stores
  const { transactions, monthlyBudget } = useExpenseStore();
  const savingsGoals = useSavingsStore((s) => s.goals);
  const warrantyItems = useWarrantyStore((s) => s.items);
  const loans = useLoanStore((s) => s.loans);
  const debts = useDebtStore((s) => s.debts);
  const investments = useInvestmentStore((s) => s.investments);

  const stats = useMemo(() => {
    // 1. Assets
    const totalSavings = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);

    let netCashFlow = 0;
    for (const t of transactions) {
      if (t.type === 'INCOME') netCashFlow += t.amount;
      else netCashFlow -= t.amount;
    }
    const cashAndLiquid = Math.max(0, netCashFlow);

    const computeWarrantyStatus = useWarrantyStore.getState().computeStatus;
    const warrantyAssets = warrantyItems
      .filter((w) => computeWarrantyStatus(w).status === 'ACTIVE')
      .reduce((sum, w) => sum + (w.purchasePrice || 0), 0);

    const moneyLentPending = debts
      .filter((d) => d.type === 'I_LENT' && d.status !== 'SETTLED')
      .reduce((sum, d) => sum + d.remainingAmount, 0);

    const totalInvestments = investments
      .filter((inv) => inv.status === 'ACTIVE')
      .reduce((sum, inv) => sum + (inv.currentValue || 0), 0);

    const totalAssets = cashAndLiquid + totalSavings + warrantyAssets + moneyLentPending + totalInvestments;

    // 2. Liabilities
    const activeLoansBalance = loans
      .filter((l) => l.status === 'ACTIVE')
      .reduce((sum, l) => sum + l.remainingBalance, 0);

    const moneyBorrowedPending = debts
      .filter((d) => d.type === 'I_BORROWED' && d.status !== 'SETTLED')
      .reduce((sum, d) => sum + d.remainingAmount, 0);

    const totalLiabilities = activeLoansBalance + moneyBorrowedPending;

    // 3. Net Worth
    const netWorth = totalAssets - totalLiabilities;

    // 4. Financial Health Metrics
    const debtRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
    const monthlyBurn = monthlyBudget > 0 ? monthlyBudget : 50000;
    const liquidAssets = cashAndLiquid + totalSavings;
    const runwayMonths = Math.round((liquidAssets / monthlyBurn) * 10) / 10;

    let healthBadge = { label: 'EXCELLENT', color: '#20C997', bg: 'rgba(32, 201, 151, 0.15)' };
    if (debtRatio > 60) {
      healthBadge = { label: 'HIGH LEVERAGE', color: '#FF6B6B', bg: 'rgba(255, 107, 107, 0.15)' };
    } else if (debtRatio > 35) {
      healthBadge = { label: 'MODERATE', color: '#FCC419', bg: 'rgba(252, 196, 25, 0.15)' };
    } else if (netWorth > 0) {
      healthBadge = { label: 'HEALTHY', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)' };
    }

    return {
      totalInvestments,
      totalAssets,
      totalLiabilities,
      netWorth,
      debtRatio: Math.round(debtRatio),
      runwayMonths,
      cashAndLiquid,
      totalSavings,
      warrantyAssets,
      moneyLentPending,
      activeLoansBalance,
      moneyBorrowedPending,
      healthBadge,
    };
  }, [transactions, monthlyBudget, savingsGoals, warrantyItems, loans, debts, investments]);

  return (
    <View style={styles.card}>
      {/* 1. TOP HEADER */}
      <View style={styles.topRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="account-balance" size={18} color="#20C997" />
          </View>
          <View>
            <Text style={styles.headerTitle}>TOTAL NET WORTH</Text>
            <Text style={styles.headerSubtitle}>Real-time assets minus liabilities</Text>
          </View>
        </View>

        <View style={[styles.healthBadge, { backgroundColor: stats.healthBadge.bg }]}>
          <View style={[styles.glowingDot, { backgroundColor: stats.healthBadge.color }]} />
          <Text style={[styles.healthBadgeText, { color: stats.healthBadge.color }]}>
            {stats.healthBadge.label}
          </Text>
        </View>
      </View>

      {/* 2. HERO NET WORTH VALUE */}
      <View style={styles.heroAmountBox}>
        <View style={styles.amountRow}>
          <Text style={[styles.currencyPrefix, { color: stats.netWorth >= 0 ? '#20C997' : '#FF6B6B' }]}>
            ৳
          </Text>
          <RollingNumber
            value={Math.abs(stats.netWorth)}
            style={styles.netWorthNumber}
          />
        </View>

        {stats.netWorth < 0 && (
          <View style={styles.negativeTag}>
            <Text style={styles.negativeTagText}>Net Debt Position</Text>
          </View>
        )}
      </View>

      {/* 3. DUAL ASSETS VS LIABILITIES TILES */}
      <View style={styles.dualTilesRow}>
        <View style={styles.assetTile}>
          <View style={styles.tileHeader}>
            <MaterialIcons name="trending-up" size={16} color="#20C997" />
            <Text style={styles.assetTileLabel}>TOTAL ASSETS</Text>
          </View>
          <Text style={styles.assetTileVal}>
            ৳{stats.totalAssets.toLocaleString()}
          </Text>
          <Text style={styles.tileSub}>Savings + Investments + Cash</Text>
        </View>

        <View style={styles.liabilityTile}>
          <View style={styles.tileHeader}>
            <MaterialIcons name="trending-down" size={16} color="#FF6B6B" />
            <Text style={styles.liabilityTileLabel}>TOTAL LIABILITIES</Text>
          </View>
          <Text style={styles.liabilityTileVal}>
            ৳{stats.totalLiabilities.toLocaleString()}
          </Text>
          <Text style={styles.tileSub}>Loans + Debts Owed</Text>
        </View>
      </View>

      {/* 4. HEALTH INDICATORS (RUNWAY & DEBT RATIO) */}
      <View style={styles.healthIndicatorsRow}>
        <View style={styles.indicatorPill}>
          <MaterialIcons name="shield" size={14} color="#38BDF8" />
          <Text style={styles.indicatorText}>
            Runway: <Text style={styles.indicatorHighlight}>{stats.runwayMonths} Months</Text>
          </Text>
        </View>

        <View style={styles.indicatorPill}>
          <MaterialIcons name="pie-chart" size={14} color="#A78BFA" />
          <Text style={styles.indicatorText}>
            Debt Ratio: <Text style={styles.indicatorHighlight}>{stats.debtRatio}%</Text>
          </Text>
        </View>
      </View>

      {/* 5. EXPANDABLE BREAKDOWN BUTTON */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          void Haptics.selectionAsync().catch(() => {});
          setIsExpanded(!isExpanded);
        }}
        style={styles.expandBtn}>
        <Text style={styles.expandBtnText}>
          {isExpanded ? 'Hide Asset & Debt Details' : 'View Full Portfolio Breakdown'}
        </Text>
        <MaterialIcons
          name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={18}
          color={C.onSurfaceVariant}
        />
      </TouchableOpacity>

      {/* 6. EXPANDED LINE ITEMS BREAKDOWN */}
      {isExpanded && (
        <View style={styles.breakdownSection}>
          <Text style={styles.breakdownGroupTitle}>Assets Breakdown</Text>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>📈 Investment Vault (DPS, FDR, Sanchay Patra)</Text>
            <Text style={styles.breakdownAssetVal}>৳{stats.totalInvestments.toLocaleString()}</Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>💰 Savings Vaults</Text>
            <Text style={styles.breakdownAssetVal}>৳{stats.totalSavings.toLocaleString()}</Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>💵 Cash Inflow Balance</Text>
            <Text style={styles.breakdownAssetVal}>৳{stats.cashAndLiquid.toLocaleString()}</Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>🛡️ Warranty Protected Assets</Text>
            <Text style={styles.breakdownAssetVal}>৳{stats.warrantyAssets.toLocaleString()}</Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>🤝 Money Lent to Friends (Receivable)</Text>
            <Text style={styles.breakdownAssetVal}>৳{stats.moneyLentPending.toLocaleString()}</Text>
          </View>

          <Text style={[styles.breakdownGroupTitle, { marginTop: 10 }]}>
            Liabilities Breakdown
          </Text>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>🏦 Active Loans & EMIs</Text>
            <Text style={styles.breakdownLiabilityVal}>
              ৳{stats.activeLoansBalance.toLocaleString()}
            </Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>🤝 Money Borrowed (Udhaar Payable)</Text>
            <Text style={styles.breakdownLiabilityVal}>
              ৳{stats.moneyBorrowedPending.toLocaleString()}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#13191C',
    borderRadius: 20,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 5,
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
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  glowingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  healthBadgeText: {
    fontFamily: F.bold,
    fontSize: 10,
    letterSpacing: 0.4,
  },
  heroAmountBox: {
    backgroundColor: '#182024',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  currencyPrefix: {
    fontFamily: F.bold,
    fontSize: 24,
  },
  netWorthNumber: {
    fontFamily: F.bold,
    fontSize: 32,
    color: '#FFFFFF',
  },
  negativeTag: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  negativeTagText: {
    fontFamily: F.medium,
    fontSize: 10,
    color: '#FF6B6B',
  },
  dualTilesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  assetTile: {
    flex: 1,
    backgroundColor: '#181F23',
    borderRadius: 14,
    padding: 12,
    gap: 2,
  },
  liabilityTile: {
    flex: 1,
    backgroundColor: '#181F23',
    borderRadius: 14,
    padding: 12,
    gap: 2,
  },
  tileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  assetTileLabel: {
    fontFamily: F.bold,
    fontSize: 9,
    color: '#20C997',
    letterSpacing: 0.6,
  },
  liabilityTileLabel: {
    fontFamily: F.bold,
    fontSize: 9,
    color: '#FF6B6B',
    letterSpacing: 0.6,
  },
  assetTileVal: {
    fontFamily: F.bold,
    fontSize: 15,
    color: '#FFFFFF',
    marginTop: 2,
  },
  liabilityTileVal: {
    fontFamily: F.bold,
    fontSize: 15,
    color: '#FFFFFF',
    marginTop: 2,
  },
  tileSub: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  healthIndicatorsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  indicatorPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#181F23',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  indicatorText: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  indicatorHighlight: {
    fontFamily: F.bold,
    color: C.onSurface,
  },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  expandBtnText: {
    fontFamily: F.medium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  breakdownSection: {
    backgroundColor: '#181F23',
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  breakdownGroupTitle: {
    fontFamily: F.bold,
    fontSize: 11,
    color: C.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  breakdownLabel: {
    fontFamily: F.medium,
    fontSize: 12,
    color: C.onSurface,
  },
  breakdownAssetVal: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#20C997',
  },
  breakdownLiabilityVal: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#FF6B6B',
  },
});
