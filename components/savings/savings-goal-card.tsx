import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { RollingNumber } from '@/components/ui/rolling-number';
import { SAVINGS_CATEGORY_CONFIG } from '@/constants/default-savings';
import { Vital } from '@/constants/vital-theme';
import { useSavingsStore } from '@/stores/savings-store';
import { SavingsGoal } from '@/types/savings';

const C = Vital.colors;
const F = Vital.fonts;

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onPress: (goal: SavingsGoal) => void;
}

export function SavingsGoalCard({ goal, onPress }: SavingsGoalCardProps) {
  const getGoalPace = useSavingsStore((s) => s.getGoalPace);

  const pace = getGoalPace(goal.id);
  const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const isDone = goal.isCompleted || percentage >= 100;
  const categoryConfig = SAVINGS_CATEGORY_CONFIG[goal.category] || SAVINGS_CATEGORY_CONFIG.GENERAL;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress(goal);
      }}
      style={[styles.card, isDone && styles.cardDone]}>
      {/* TOP HEADER: ICON + NAME + CATEGORY + DETAIL ARROW */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={[styles.iconBox, { backgroundColor: categoryConfig.bgColor }]}>
            <Text style={styles.iconEmoji}>{goal.icon}</Text>
          </View>
          <View style={styles.nameBox}>
            <Text style={styles.goalName} numberOfLines={1}>
              {goal.name}
            </Text>
            <View style={styles.categoryBadge}>
              <Text style={[styles.categoryBadgeText, { color: categoryConfig.color }]}>
                {categoryConfig.label}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.chevronBox}>
          <MaterialIcons name="chevron-right" size={20} color={C.onSurfaceVariant} />
        </View>
      </View>

      {/* BALANCE ROW: SAVED vs TARGET + PERCENTAGE BADGE */}
      <View style={styles.balanceRow}>
        <View style={styles.amountCol}>
          <View style={styles.currentAmountRow}>
            <RollingNumber
              value={goal.currentAmount}
              suffix=" ৳"
              style={styles.currentAmountText}
            />
            <Text style={styles.targetAmountText}>
              / {goal.targetAmount.toLocaleString('en-US').replace(/,/g, ' ')} ৳
            </Text>
          </View>

          <Text style={styles.remainingText}>
            {isDone
              ? '🎉 Target 100% Mastered!'
              : `${pace.remainingAmount.toLocaleString('en-US').replace(/,/g, ' ')} ৳ remaining`}
          </Text>
        </View>

        <View
          style={[
            styles.percentageBadge,
            isDone ? styles.percentageBadgeDone : { backgroundColor: `${goal.color}22` },
          ]}>
          <Text
            style={[
              styles.percentageText,
              isDone ? styles.percentageTextDone : { color: goal.color },
            ]}>
            {isDone ? '🏆 Done' : `${percentage.toFixed(0)}%`}
          </Text>
        </View>
      </View>

      {/* LIQUID PROGRESS CAPSULE */}
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.min(100, Math.max(3, percentage))}%`,
              backgroundColor: isDone ? '#C8F135' : goal.color,
            },
          ]}
        />
      </View>

      {/* MONTHLY PACE FOOTER & QUICK TRIGGER */}
      <View style={styles.footerRow}>
        {!isDone ? (
          <View style={styles.pacePill}>
            <MaterialIcons name="schedule" size={12} color={C.onSurfaceVariant} />
            <Text style={styles.paceText}>
              {pace.monthsRemaining} mo remaining • ~
              {pace.suggestedMonthly.toLocaleString('en-US').replace(/,/g, ' ')} ৳/mo
            </Text>
          </View>
        ) : (
          <View style={styles.donePill}>
            <MaterialIcons name="verified" size={12} color="#C8F135" />
            <Text style={styles.donePillText}>Goal Achieved • Tap to Manage</Text>
          </View>
        )}

        <View style={styles.tapToManageBtn}>
          <Text style={styles.tapToManageText}>Manage & Deposit</Text>
          <MaterialIcons name="arrow-forward" size={12} color="#C8F135" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surfaceContainer,
    borderRadius: 22,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: C.glassBorder,
  },
  cardDone: {
    borderColor: 'rgba(200, 241, 53, 0.35)',
    backgroundColor: 'rgba(22, 26, 29, 0.95)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 18,
  },
  nameBox: {
    flex: 1,
    gap: 2,
  },
  goalName: {
    fontFamily: F.sansBold,
    fontSize: 15,
    color: C.onSurface,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    fontFamily: F.sansMedium,
    fontSize: 11,
  },
  chevronBox: {
    width: 28,
    alignItems: 'center',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  amountCol: {
    gap: 2,
  },
  currentAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  currentAmountText: {
    fontFamily: F.sansBold,
    fontSize: 18,
    color: C.onSurface,
  },
  targetAmountText: {
    fontFamily: F.sans,
    fontSize: 13,
    color: C.onSurfaceVariant,
  },
  remainingText: {
    fontFamily: F.sans,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  percentageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  percentageBadgeDone: {
    backgroundColor: 'rgba(200, 241, 53, 0.15)',
  },
  percentageText: {
    fontFamily: F.sansBold,
    fontSize: 12,
  },
  percentageTextDone: {
    color: '#C8F135',
  },
  track: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  pacePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  paceText: {
    fontFamily: F.sans,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  donePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(200, 241, 53, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  donePillText: {
    fontFamily: F.sansBold,
    fontSize: 10,
    color: '#C8F135',
  },
  tapToManageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  tapToManageText: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: '#C8F135',
  },
});
