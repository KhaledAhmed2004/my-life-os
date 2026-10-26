import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { RollingNumber } from '@/components/ui/rolling-number';
import { Spacing } from '@/constants/theme';
import { Vital } from '@/constants/vital-theme';
import { useExpenseStore } from '@/stores/expense-store';

const C = Vital.colors;
const F = Vital.fonts;

interface FinancialHeroBentoProps {
  onAddPress: (type: 'EXPENSE' | 'INCOME') => void;
  onOpenBudgetStudio: () => void;
  onPressInflow?: () => void;
  onPressOutflow?: () => void;
}

export const FinancialHeroBento: React.FC<FinancialHeroBentoProps> = ({
  onAddPress,
  onOpenBudgetStudio,
  onPressInflow,
  onPressOutflow,
}) => {
  const isPrivacyMode = useExpenseStore((s) => s.isPrivacyMode);
  const togglePrivacyMode = useExpenseStore((s) => s.togglePrivacyMode);
  const monthlyBudget = useExpenseStore((s) => s.monthlyBudget);
  const getTotals = useExpenseStore((s) => s.getTotals);
  const getDailySafeToSpend = useExpenseStore((s) => s.getDailySafeToSpend);
  const getFinancialHealthScore = useExpenseStore((s) => s.getFinancialHealthScore);

  const { netBalance, totalIncome, totalExpense } = getTotals();
  const safeSpend = getDailySafeToSpend();
  const health = getFinancialHealthScore();

  const [expandedHealth, setExpandedHealth] = useState(false);

  // Budget calculations
  const percentage = monthlyBudget > 0 ? Math.min((totalExpense / monthlyBudget) * 100, 100) : 0;
  const rawPercentage = monthlyBudget > 0 ? (totalExpense / monthlyBudget) * 100 : 0;
  const remaining = Math.max(monthlyBudget - totalExpense, 0);
  const isOverBudget = totalExpense > monthlyBudget;

  const isZeroBurn = safeSpend.status === 'ZERO_BURN';
  const isTight = safeSpend.status === 'TIGHT';

  const handleTogglePrivacy = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    void togglePrivacyMode();
  };

  const getProgressColor = () => {
    if (isPrivacyMode) return 'rgba(255, 255, 255, 0.2)';
    if (isOverBudget) return '#FA5252';
    if (rawPercentage > 85) return '#FCC419';
    return '#C8F135';
  };

  const getGradeTheme = () => {
    switch (health.grade) {
      case 'PRIME':
        return { color: '#C8F135', bg: 'rgba(200, 241, 53, 0.12)', border: 'rgba(200, 241, 53, 0.28)', icon: 'diamond' };
      case 'HEALTHY':
        return { color: '#20C997', bg: 'rgba(32, 201, 151, 0.12)', border: 'rgba(32, 201, 151, 0.28)', icon: 'bolt' };
      case 'CAUTION':
        return { color: '#FCC419', bg: 'rgba(252, 196, 25, 0.12)', border: 'rgba(252, 196, 25, 0.28)', icon: 'warning-amber' };
      case 'CRITICAL':
        return { color: '#FA5252', bg: 'rgba(250, 82, 82, 0.12)', border: 'rgba(250, 82, 82, 0.28)', icon: 'shield' };
    }
  };

  const gradeTheme = getGradeTheme();

  return (
    <View style={styles.card}>
      {/* 1. TOP BAR: TITLE + PRIVACY TOGGLE */}
      <View style={styles.topBar}>
        <View style={styles.badgeLabelRow}>
          <View style={styles.pulseDot} />
          <Text style={styles.sectionLabel}>FINANCIAL COMMAND CENTER</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleTogglePrivacy}
          hitSlop={10}
          style={styles.eyeBtn}>
          <MaterialIcons
            name={isPrivacyMode ? 'visibility-off' : 'visibility'}
            size={16}
            color={isPrivacyMode ? '#FCC419' : C.onSurfaceVariant}
          />
        </TouchableOpacity>
      </View>

      {/* 2. NET BALANCE HERO DISPLAY */}
      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>Net Liquid Balance</Text>
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
      </View>

      {/* 3. TAPPABLE INFLOW / OUTFLOW BENTO TILES */}
      <View style={styles.bentoRow}>
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
              <MaterialIcons name="arrow-upward" size={13} color="#20C997" />
            </View>
            <Text style={styles.bentoLabel} numberOfLines={1}>TOTAL INFLOW</Text>
            {!!onPressInflow && (
              <MaterialIcons name="chevron-right" size={14} color="rgba(32, 201, 151, 0.4)" />
            )}
          </View>
          {isPrivacyMode ? (
            <Text style={styles.bentoHiddenText}>••••••</Text>
          ) : (
            <RollingNumber value={totalIncome} prefix="+৳ " style={styles.bentoAmountIncome} />
          )}
        </TouchableOpacity>

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
              <MaterialIcons name="arrow-downward" size={13} color="#FF6B6B" />
            </View>
            <Text style={styles.bentoLabel} numberOfLines={1}>TOTAL OUTFLOW</Text>
            {!!onPressOutflow && (
              <MaterialIcons name="chevron-right" size={14} color="rgba(255, 107, 107, 0.4)" />
            )}
          </View>
          {isPrivacyMode ? (
            <Text style={styles.bentoHiddenText}>••••••</Text>
          ) : (
            <RollingNumber value={totalExpense} prefix="-৳ " style={styles.bentoAmountExpense} />
          )}
        </TouchableOpacity>
      </View>

      {/* 4. PRIMARY ACTIONS (+ EXPENSE / + INCOME) */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          activeOpacity={0.82}
          style={styles.expenseActionBtn}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            onAddPress('EXPENSE');
          }}>
          <MaterialIcons name="add" size={17} color="#101416" />
          <Text style={styles.expenseBtnText}>Add Expense</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.82}
          style={styles.incomeActionBtn}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            onAddPress('INCOME');
          }}>
          <MaterialIcons name="add" size={16} color="#20C997" />
          <Text style={styles.incomeBtnText}>Add Income</Text>
        </TouchableOpacity>
      </View>

      {/* 5. INTEGRATED MASTER MONTHLY BUDGET PROGRESS BAR */}
      <View style={styles.budgetSection}>
        <View style={styles.budgetHeader}>
          <View style={styles.budgetTitleCol}>
            <Text style={styles.budgetLabel}>MONTHLY BUDGET TARGET</Text>
            <Text style={styles.budgetAmount}>
              {isPrivacyMode ? '•••••• ৳' : `৳ ${monthlyBudget.toLocaleString('en-US')}`}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              onOpenBudgetStudio();
            }}
            style={styles.editBudgetBtn}>
            <MaterialIcons name="tune" size={13} color="#C8F135" />
            <Text style={styles.editBudgetBtnText}>Plan Studio</Text>
          </TouchableOpacity>
        </View>

        {/* PROGRESS TRACK */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${percentage}%`, backgroundColor: getProgressColor() },
            ]}
          />
        </View>

        {/* SPENT VS REMAINING */}
        <View style={styles.budgetFooterRow}>
          <View style={styles.statCol}>
            <Text style={styles.subStatLabel}>Total Spent</Text>
            <Text style={[styles.spentText, isOverBudget && styles.overBudgetText]}>
              {isPrivacyMode ? '••••' : `৳ ${totalExpense.toLocaleString('en-US')} `}
              <Text style={styles.pctText}>({rawPercentage.toFixed(0)}%)</Text>
            </Text>
          </View>

          <View style={styles.rightAlign}>
            <Text style={styles.subStatLabel}>
              {isOverBudget ? 'Over Limit' : 'Remaining Target'}
            </Text>
            <Text style={[styles.remainingText, isOverBudget && styles.overBudgetText]}>
              {isPrivacyMode
                ? '••••'
                : isOverBudget
                ? `-৳ ${(totalExpense - monthlyBudget).toLocaleString('en-US')}`
                : `৳ ${remaining.toLocaleString('en-US')} `}
              {!isPrivacyMode && (
                <Text style={styles.pctText}>
                  {isOverBudget
                    ? `(+${(rawPercentage - 100).toFixed(0)}%)`
                    : `(${Math.max(0, 100 - rawPercentage).toFixed(0)}%)`}
                </Text>
              )}
            </Text>
          </View>
        </View>
      </View>

      {/* 6. DAILY SAFE ALLOWANCE & HEALTH GRADE PULSE */}
      <View style={styles.pulseContainer}>
        <View style={styles.pulseHeaderRow}>
          <View style={styles.pulseLeftGroup}>
            <View style={styles.pulseIconBox}>
              <MaterialIcons name="auto-awesome" size={14} color="#C8F135" />
            </View>
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.pulseTitle}>SAFE TO SPEND TODAY</Text>
              <Text style={styles.pulseSubtitle}>{safeSpend.daysLeft} days left in cycle</Text>
            </View>
          </View>

          {/* HEALTH BADGE TRIGGER */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setExpandedHealth(!expandedHealth);
            }}
            style={[
              styles.healthBadge,
              { backgroundColor: gradeTheme.bg, borderColor: gradeTheme.border },
            ]}>
            <MaterialIcons name={gradeTheme.icon as any} size={13} color={gradeTheme.color} />
            <Text style={[styles.healthBadgeText, { color: gradeTheme.color }]}>
              {health.score}/100 • {health.label}
            </Text>
            <MaterialIcons
              name={expandedHealth ? 'expand-less' : 'expand-more'}
              size={15}
              color={gradeTheme.color}
            />
          </TouchableOpacity>
        </View>

        {/* AMOUNT & PACE ROW */}
        <View style={styles.safeAmountRow}>
          <View style={styles.safeAmountGroup}>
            {isPrivacyMode ? (
              <Text style={styles.safeHeroAmount}>•••• ৳</Text>
            ) : isZeroBurn ? (
              <Text style={[styles.safeHeroAmount, styles.safeHeroAmountZero]}>৳ 0</Text>
            ) : (
              <RollingNumber
                value={safeSpend.safeDailyAmount}
                prefix="৳ "
                style={[styles.safeHeroAmount, isTight && styles.safeHeroAmountTight]}
              />
            )}
            <Text style={styles.perDayLabel}>/ today</Text>
          </View>

          {isZeroBurn ? (
            <View style={styles.statusPillRed}>
              <View style={styles.statusDotRed} />
              <Text style={styles.statusTextRed}>Limit Reached</Text>
            </View>
          ) : isTight ? (
            <View style={styles.statusPillAmber}>
              <View style={styles.statusDotAmber} />
              <Text style={styles.statusTextAmber}>Tight Pace</Text>
            </View>
          ) : (
            <View style={styles.statusPillLime}>
              <View style={styles.statusDotLime} />
              <Text style={styles.statusTextLime}>On Pace 🎯</Text>
            </View>
          )}
        </View>

        {/* EXPANDABLE HEALTH FACTORS BREAKDOWN */}
        {expandedHealth && (
          <View style={styles.healthBreakdownBox}>
            <View style={styles.breakdownHeader}>
              <Text style={styles.breakdownTitle}>HEALTH SCORE BREAKDOWN</Text>
              <Text style={styles.breakdownScoreTotal}>{health.score} / 100</Text>
            </View>

            <View style={styles.factorRow}>
              <Text style={styles.factorLabel}>Budget Discipline</Text>
              <Text style={styles.factorValue}>{health.budgetScore} / 45</Text>
            </View>
            <View style={styles.factorTrack}>
              <View
                style={[
                  styles.factorFill,
                  { width: `${Math.min(100, (health.budgetScore / 45) * 100)}%`, backgroundColor: gradeTheme.color },
                ]}
              />
            </View>

            <View style={styles.factorRow}>
              <Text style={styles.factorLabel}>Cashflow Buffer</Text>
              <Text style={styles.factorValue}>{health.cashflowScore} / 30</Text>
            </View>
            <View style={styles.factorTrack}>
              <View
                style={[
                  styles.factorFill,
                  { width: `${Math.min(100, (health.cashflowScore / 30) * 100)}%`, backgroundColor: gradeTheme.color },
                ]}
              />
            </View>

            <View style={styles.factorRow}>
              <Text style={styles.factorLabel}>Diversification</Text>
              <Text style={styles.factorValue}>{health.diversificationScore} / 25</Text>
            </View>
            <View style={styles.factorTrack}>
              <View
                style={[
                  styles.factorFill,
                  { width: `${Math.min(100, (health.diversificationScore / 25) * 100)}%`, backgroundColor: gradeTheme.color },
                ]}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#13191C',
    borderRadius: 20,
    padding: 13,
    gap: 11,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 5,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C8F135',
  },
  sectionLabel: {
    fontFamily: F.sansBold,
    fontSize: 12,
    color: C.onSurfaceVariant,
    letterSpacing: 0.8,
  },
  eyeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceSection: {
    gap: 2,
  },
  balanceLabel: {
    fontFamily: F.sansMedium,
    fontSize: 13,
    color: C.onSurfaceVariant,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  heroBalanceText: {
    fontFamily: F.sansBold,
    fontSize: 28,
    color: '#FFFFFF',
    letterSpacing: -0.6,
  },
  heroBalanceNegative: {
    color: '#FF6B6B',
  },
  hiddenBalanceText: {
    fontFamily: F.sansBold,
    fontSize: 24,
    color: C.onSurface,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bentoTileIncome: {
    flex: 1,
    backgroundColor: 'rgba(32, 201, 151, 0.06)',
    borderRadius: 13,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(32, 201, 151, 0.18)',
    gap: 3,
  },
  bentoTileExpense: {
    flex: 1,
    backgroundColor: 'rgba(255, 107, 107, 0.06)',
    borderRadius: 13,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.18)',
    gap: 3,
  },
  bentoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrowSquircleIncome: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: 'rgba(32, 201, 151, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowSquircleExpense: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 107, 107, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoLabel: {
    fontFamily: F.sansBold,
    fontSize: 10,
    color: C.onSurfaceVariant,
    letterSpacing: 0.5,
    flex: 1,
    marginLeft: 6,
  },
  bentoAmountIncome: {
    fontFamily: F.sansBold,
    fontSize: 15,
    color: '#20C997',
  },
  bentoAmountExpense: {
    fontFamily: F.sansBold,
    fontSize: 15,
    color: '#FF6B6B',
  },
  bentoHiddenText: {
    fontFamily: F.sansBold,
    fontSize: 14,
    color: C.onSurface,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  expenseActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#C8F135',
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#C8F135',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
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
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(32, 201, 151, 0.3)',
  },
  incomeBtnText: {
    fontFamily: F.sansBold,
    fontSize: 13,
    color: '#20C997',
  },
  budgetSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 11,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 8,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  budgetTitleCol: {
    gap: 2,
  },
  budgetLabel: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: C.onSurfaceVariant,
    letterSpacing: 0.7,
  },
  budgetAmount: {
    fontFamily: F.sansBold,
    fontSize: 17,
    color: C.onSurface,
  },
  editBudgetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(200, 241, 53, 0.1)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(200, 241, 53, 0.25)',
  },
  editBudgetBtnText: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: '#C8F135',
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  budgetFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statCol: {
    gap: 1,
  },
  subStatLabel: {
    fontFamily: F.sansMedium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  spentText: {
    fontFamily: F.sansBold,
    fontSize: 12,
    color: C.onSurface,
  },
  pctText: {
    fontFamily: F.sansMedium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  remainingText: {
    fontFamily: F.sansBold,
    fontSize: 12,
    color: '#20C997',
  },
  overBudgetText: {
    color: '#FA5252',
  },
  rightAlign: {
    alignItems: 'flex-end',
    gap: 1,
  },
  pulseContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 8,
  },
  pulseHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  pulseLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  pulseIconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: 'rgba(200, 241, 53, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseTitle: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  pulseSubtitle: {
    fontFamily: F.sans,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9,
    borderWidth: 1,
  },
  healthBadgeText: {
    fontFamily: F.sansBold,
    fontSize: 11,
  },
  safeAmountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  safeAmountGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  safeHeroAmount: {
    fontFamily: F.sansBold,
    fontSize: 22,
    color: '#FFFFFF',
  },
  safeHeroAmountZero: {
    color: '#FA5252',
  },
  safeHeroAmountTight: {
    color: '#FCC419',
  },
  perDayLabel: {
    fontFamily: F.sansMedium,
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  statusPillLime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(200, 241, 53, 0.1)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDotLime: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#C8F135',
  },
  statusTextLime: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: '#C8F135',
  },
  statusPillAmber: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(252, 196, 25, 0.1)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDotAmber: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#FCC419',
  },
  statusTextAmber: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: '#FCC419',
  },
  statusPillRed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(250, 82, 82, 0.1)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDotRed: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#FA5252',
  },
  statusTextRed: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: '#FA5252',
  },
  healthBreakdownBox: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    gap: 8,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breakdownTitle: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: C.onSurfaceVariant,
    letterSpacing: 0.7,
  },
  breakdownScoreTotal: {
    fontFamily: F.sansBold,
    fontSize: 12,
    color: C.onSurface,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  factorLabel: {
    fontFamily: F.sans,
    fontSize: 12,
    color: C.onSurface,
  },
  factorValue: {
    fontFamily: F.sansBold,
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  factorTrack: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  factorFill: {
    height: '100%',
    borderRadius: 3,
  },
});
