import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { RollingNumber } from '@/components/ui/rolling-number';
import { Vital } from '@/constants/vital-theme';
import { useExpenseStore } from '@/stores/expense-store';

const C = Vital.colors;
const F = Vital.fonts;

interface BalanceCardProps {
  netBalance: number;
  totalIncome: number;
  totalExpense: number;
  onAddPress: (type: 'EXPENSE' | 'INCOME') => void;
  onPressInflow?: () => void;
  onPressOutflow?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  netBalance,
  totalIncome,
  totalExpense,
  onAddPress,
  onPressInflow,
  onPressOutflow,
}) => {
  const isPrivacyMode = useExpenseStore((s) => s.isPrivacyMode);
  const togglePrivacyMode = useExpenseStore((s) => s.togglePrivacyMode);

  const handleTogglePrivacy = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    void togglePrivacyMode();
  };

  // Retention / savings rate calculation
  const savingsRate =
    totalIncome > 0
      ? Math.max(0, Math.min(100, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)))
      : 0;

  // Dynamic semantic badge calculation (Clean DRY Logic)
  const getSavingsBadge = () => {
    if (totalIncome <= 0) {
      return {
        label: 'No Income Logged',
        icon: 'info-outline' as const,
        color: C.onSurfaceVariant,
      };
    }
    if (netBalance < 0) {
      return {
        label: 'Deficit Month',
        icon: 'trending-down' as const,
        color: '#FF6B6B',
      };
    }

    const isHealthy = savingsRate >= 50;
    const isModerate = savingsRate >= 20;

    return {
      label: `${savingsRate}% Income Remaining`,
      icon: isHealthy || isModerate ? ('trending-up' as const) : ('trending-flat' as const),
      color: isHealthy ? '#20C997' : isModerate ? '#FCC419' : '#FF8787',
    };
  };

  const savingsBadge = getSavingsBadge();

  return (
    <View style={styles.card}>
      {/* 1. TOP RIGHT PRIVACY TOGGLE (40x40 touch-friendly hit area) */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleTogglePrivacy}
        hitSlop={8}
        style={styles.eyeBtn}>
        <MaterialIcons
          name={isPrivacyMode ? 'visibility-off' : 'visibility'}
          size={16}
          color={isPrivacyMode ? '#FCC419' : C.onSurfaceVariant}
        />
      </TouchableOpacity>

      {/* 2. HERO AMOUNT + UNIFIED CONTEXTUAL STATUS CAPSULE */}
      <View style={styles.amountSection}>
        {isPrivacyMode ? (
          <Text style={styles.hiddenBalanceText}>•••••••• ৳</Text>
        ) : (
          <View style={styles.balanceRow}>
            <RollingNumber
              value={netBalance}
              prefix="৳ "
              style={[
                styles.heroBalanceText,
                netBalance < 0 && styles.heroBalanceNegative,
              ]}
            />
          </View>
        )}

        {/* ORGANIZED GLASS STATUS CAPSULE */}
        <View style={styles.statusCapsule}>
          <Text style={styles.capsuleLeftText}>Available to Spend</Text>
          <View style={styles.capsuleDivider} />
          <View style={styles.capsuleRightGroup}>
            <MaterialIcons name={savingsBadge.icon} size={12} color={savingsBadge.color} />
            <Text style={[styles.capsuleRightText, { color: savingsBadge.color }]}>
              {savingsBadge.label}
            </Text>
          </View>
        </View>
      </View>

      {/* 3. DUAL TAPPABLE BENTO CASHFLOW STREAM (INCOME VS EXPENSES) */}
      <View style={styles.bentoRow}>
        {/* INFLOW TILE */}
        <TouchableOpacity
          activeOpacity={onPressInflow ? 0.75 : 1}
          onPress={() => {
            if (onPressInflow) {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              onPressInflow();
            }
          }}
          style={styles.bentoTileIncome}>
          <View style={styles.bentoHeader}>
            <View style={styles.arrowSquircleIncome}>
              <MaterialIcons name="arrow-upward" size={12} color="#20C997" />
            </View>
            <Text style={styles.bentoLabel}>TOTAL INCOME</Text>
            {!!onPressInflow && (
              <MaterialIcons name="chevron-right" size={13} color="rgba(32, 201, 151, 0.4)" style={styles.bentoChevron} />
            )}
          </View>
          {isPrivacyMode ? (
            <Text style={styles.bentoHiddenText}>••••••</Text>
          ) : (
            <RollingNumber
              value={totalIncome}
              prefix="+৳ "
              style={styles.bentoAmountIncome}
            />
          )}
        </TouchableOpacity>

        {/* OUTFLOW TILE */}
        <TouchableOpacity
          activeOpacity={onPressOutflow ? 0.75 : 1}
          onPress={() => {
            if (onPressOutflow) {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              onPressOutflow();
            }
          }}
          style={styles.bentoTileExpense}>
          <View style={styles.bentoHeader}>
            <View style={styles.arrowSquircleExpense}>
              <MaterialIcons name="arrow-downward" size={12} color="#FF6B6B" />
            </View>
            <Text style={styles.bentoLabel}>TOTAL EXPENSES</Text>
            {!!onPressOutflow && (
              <MaterialIcons name="chevron-right" size={13} color="rgba(255, 107, 107, 0.4)" style={styles.bentoChevron} />
            )}
          </View>
          {isPrivacyMode ? (
            <Text style={styles.bentoHiddenText}>••••••</Text>
          ) : (
            <RollingNumber
              value={totalExpense}
              prefix="-৳ "
              style={styles.bentoAmountExpense}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* 4. PREMIUM DUAL ACTION BUTTONS (PRIMARY: EXPENSE, SECONDARY: INCOME) */}
      <View style={styles.actionsRow}>
        {/* ADD EXPENSE (PRIMARY LIME HIGHLIGHT BUTTON) */}
        <TouchableOpacity
          activeOpacity={0.82}
          style={styles.expenseActionBtn}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            onAddPress('EXPENSE');
          }}>
          <View style={styles.actionIconBoxExpense}>
            <MaterialIcons name="add" size={15} color="#101416" />
          </View>
          <Text style={styles.expenseBtnText}>Add Expense</Text>
        </TouchableOpacity>

        {/* ADD INCOME (SECONDARY OBSIDIAN GLASS BUTTON) */}
        <TouchableOpacity
          activeOpacity={0.82}
          style={styles.incomeActionBtn}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            onAddPress('INCOME');
          }}>
          <View style={styles.actionIconBoxIncome}>
            <MaterialIcons name="add" size={14} color="#20C997" />
          </View>
          <Text style={styles.incomeBtnText}>Add Income</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#13191C',
    borderRadius: 22,
    padding: 18,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  statusCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 4,
  },
  capsuleLeftText: {
    fontFamily: F.sansMedium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  capsuleDivider: {
    width: 1,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  capsuleRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  capsuleRightText: {
    fontFamily: F.sansBold,
    fontSize: 11,
  },
  amountSection: {
    alignItems: 'center',
    gap: 4,
    paddingTop: 8,
    paddingBottom: 2,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBalanceText: {
    fontFamily: F.sansBold,
    fontSize: 34,
    color: '#FFFFFF',
    letterSpacing: -0.6,
  },
  heroBalanceNegative: {
    color: '#FF6B6B',
  },
  hiddenBalanceText: {
    fontFamily: F.sansBold,
    fontSize: 30,
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 2,
  },
  balanceSubtext: {
    fontFamily: F.sansMedium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  bentoTileIncome: {
    flex: 1,
    backgroundColor: 'rgba(32, 201, 151, 0.05)',
    borderRadius: 14,
    padding: 12,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(32, 201, 151, 0.14)',
  },
  bentoTileExpense: {
    flex: 1,
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
    borderRadius: 14,
    padding: 12,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.14)',
  },
  bentoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bentoChevron: {
    marginLeft: 'auto',
  },
  arrowSquircleIncome: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: 'rgba(32, 201, 151, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowSquircleExpense: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoLabel: {
    fontFamily: F.sansBold,
    fontSize: 9,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  bentoAmountIncome: {
    fontFamily: F.sansBold,
    fontSize: 16,
    color: '#20C997',
    marginTop: 2,
  },
  bentoAmountExpense: {
    fontFamily: F.sansBold,
    fontSize: 16,
    color: '#FF6B6B',
    marginTop: 2,
  },
  bentoHiddenText: {
    fontFamily: F.sansBold,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.3)',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  expenseActionBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#C8F135',
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#C8F135',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIconBoxExpense: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseBtnText: {
    fontFamily: F.sansBold,
    fontSize: 13,
    color: '#101416',
  },
  incomeActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionIconBoxIncome: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: 'rgba(32, 201, 151, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  incomeBtnText: {
    fontFamily: F.sansSemiBold,
    fontSize: 13,
    color: C.onSurface,
  },
});
