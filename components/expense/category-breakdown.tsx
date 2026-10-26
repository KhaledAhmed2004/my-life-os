import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { getCategoryVectorIcon } from '@/constants/expense-categories';
import { Spacing } from '@/constants/theme';
import { Vital } from '@/constants/vital-theme';
import {
  CategoryBudgetStatus,
  CATEGORY_BUCKET_MAP,
  useExpenseStore,
} from '@/stores/expense-store';

const C = Vital.colors;
const F = Vital.fonts;

type CategoryFilterTab = 'ALL' | 'FIXED' | 'FLEXIBLE' | 'OVERBUDGET';

interface CategoryBreakdownProps {
  onOpenPlanner?: () => void;
  onSelectCategory?: (categoryStatus: CategoryBudgetStatus) => void;
  onOpenRebalance?: (deficitCatId?: string) => void;
}

export function CategoryBreakdown({
  onOpenPlanner,
  onSelectCategory,
  onOpenRebalance,
}: CategoryBreakdownProps) {
  const getCategoryBudgetStatus = useExpenseStore((s) => s.getCategoryBudgetStatus);
  const getOverBudgetSummary = useExpenseStore((s) => s.getOverBudgetSummary);
  const monthlyBudget = useExpenseStore((s) => s.monthlyBudget);
  const isPrivacyMode = useExpenseStore((s) => s.isPrivacyMode);

  const [activeTab, setActiveTab] = useState<CategoryFilterTab>('ALL');

  const budgetStatuses = useMemo(() => getCategoryBudgetStatus(), [getCategoryBudgetStatus]);
  const summary = useMemo(() => getOverBudgetSummary(), [getOverBudgetSummary]);

  // Total allocated vs Master Budget
  const totalAllocated = budgetStatuses.reduce((sum, c) => sum + c.budget, 0);
  const isOverAllocated = totalAllocated > monthlyBudget && monthlyBudget > 0;
  const unallocated = monthlyBudget - totalAllocated;

  const filteredList = useMemo(() => {
    return budgetStatuses.filter((item) => {
      const bucket = CATEGORY_BUCKET_MAP[item.category.id] || 'FLEXIBLE';
      if (activeTab === 'OVERBUDGET') return item.status === 'OVERBUDGET';
      if (activeTab === 'FIXED') return bucket === 'FIXED';
      if (activeTab === 'FLEXIBLE') return bucket === 'FLEXIBLE';
      return true;
    });
  }, [budgetStatuses, activeTab]);

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      {/* 1. HEADER ROW */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerSectionLabel}>CATEGORY ENVELOPES</Text>
          <Text style={styles.headerAllocationText}>
            {isPrivacyMode
              ? '•••• ৳ Allocated'
              : `৳ ${totalAllocated.toLocaleString('en-US')} Allocated / ৳ ${monthlyBudget.toLocaleString('en-US')}`}
          </Text>
        </View>

        {onOpenPlanner && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              onOpenPlanner();
            }}
            style={styles.setLimitsBtn}>
            <MaterialIcons name="tune" size={13} color="#C8F135" />
            <Text style={styles.setLimitsText}>Plan Limits</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 2. ALLOCATION HEALTH PROGRESS BAR */}
      <View style={styles.allocationTrack}>
        <View
          style={[
            styles.allocationFill,
            {
              width: `${Math.min(100, monthlyBudget > 0 ? (totalAllocated / monthlyBudget) * 100 : 0)}%`,
              backgroundColor: isOverAllocated ? '#FA5252' : unallocated > 0 ? '#FCC419' : '#20C997',
            },
          ]}
        />
      </View>

      {/* 3. SMART REBALANCE / OVER-BUDGET ALERT BANNER */}
      {summary.overBudgetCount > 0 ? (
        <View style={styles.alertBanner}>
          <View style={styles.alertIconBox}>
            <MaterialIcons name="warning" size={18} color="#FA5252" />
          </View>
          <View style={styles.alertTextCol}>
            <Text style={styles.alertTitle}>
              {summary.overBudgetCount} {summary.overBudgetCount === 1 ? 'Envelope' : 'Envelopes'} Exceeded
            </Text>
            <Text style={styles.alertSubtitle}>
              Deficit: +৳ {summary.totalOverAmount.toLocaleString('en-US')}
            </Text>
          </View>

          {onOpenRebalance && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                const firstOver = budgetStatuses.find((b) => b.status === 'OVERBUDGET');
                onOpenRebalance(firstOver?.category.id);
              }}
              style={styles.rebalanceBtn}>
              <MaterialIcons name="auto-fix-high" size={13} color="#101416" />
              <Text style={styles.rebalanceBtnText}>Rebalance</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.healthyBanner}>
          <MaterialIcons name="verified" size={16} color="#20C997" />
          <Text style={styles.healthyText}>
            All {budgetStatuses.length} Envelopes Within Planned Bounds 🎯
          </Text>
        </View>
      )}

      {/* 4. FILTER TABS (ALL, FLEXIBLE, FIXED, OVERBUDGET) */}
      <View style={styles.filterPillsRow}>
        <TouchableOpacity
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            setActiveTab('ALL');
          }}
          style={[styles.filterPill, activeTab === 'ALL' && styles.filterPillActive]}>
          <Text style={[styles.filterPillText, activeTab === 'ALL' && styles.filterPillTextActive]}>
            All ({budgetStatuses.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            setActiveTab('FLEXIBLE');
          }}
          style={[styles.filterPill, activeTab === 'FLEXIBLE' && styles.filterPillActive]}>
          <Text style={[styles.filterPillText, activeTab === 'FLEXIBLE' && styles.filterPillTextActive]}>
            Daily Flex
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            setActiveTab('FIXED');
          }}
          style={[styles.filterPill, activeTab === 'FIXED' && styles.filterPillActive]}>
          <Text style={[styles.filterPillText, activeTab === 'FIXED' && styles.filterPillTextActive]}>
            Fixed Bills
          </Text>
        </TouchableOpacity>

        {summary.overBudgetCount > 0 && (
          <TouchableOpacity
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setActiveTab('OVERBUDGET');
            }}
            style={[
              styles.filterPill,
              styles.filterPillRed,
              activeTab === 'OVERBUDGET' && styles.filterPillRedActive,
            ]}>
            <Text style={[styles.filterPillText, styles.filterPillTextRed, activeTab === 'OVERBUDGET' && styles.filterPillTextActive]}>
              Over Limit ({summary.overBudgetCount})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 5. CATEGORY ITEMS LIST */}
      <View style={styles.list}>
        {filteredList.map((item) => {
          const isOver = item.status === 'OVERBUDGET';
          const isWarning = item.status === 'WARNING';
          const bucketType = CATEGORY_BUCKET_MAP[item.category.id] || 'FLEXIBLE';

          const baseBarWidth = Math.min(100, item.percentage);
          const overflowPercentage = isOver ? Math.min(50, item.percentage - 100) : 0;
          const vectorIcon = getCategoryVectorIcon(item.category.id);

          return (
            <TouchableOpacity
              key={item.category.id}
              activeOpacity={0.8}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                onSelectCategory?.(item);
              }}
              style={styles.itemRow}>
              {/* TOP HEADER: ICON + NAME + SPENT/BUDGET */}
              <View style={styles.itemHeader}>
                <View style={styles.nameGroup}>
                  <View
                    style={[
                      styles.iconWrap,
                      {
                        backgroundColor: `${item.category.color}1A`,
                        borderColor: `${item.category.color}35`,
                        borderWidth: 1,
                      },
                    ]}>
                    <MaterialIcons
                      name={vectorIcon as any}
                      size={18}
                      color={item.category.color}
                    />
                  </View>
                  <View style={{ gap: 2 }}>
                    <View style={styles.nameBadgeRow}>
                      <Text style={styles.categoryNameText}>{item.category.name}</Text>
                      <View style={bucketType === 'FIXED' ? styles.bucketTagFixed : styles.bucketTagFlex}>
                        <Text style={bucketType === 'FIXED' ? styles.bucketTagTextFixed : styles.bucketTagTextFlex}>
                          {bucketType === 'FIXED' ? 'Fixed' : 'Daily'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.badgesRow}>
                      {isOver ? (
                        <View style={styles.badgeOver}>
                          <Text style={styles.badgeOverText}>
                            🚨 Over by {isPrivacyMode ? '••••' : `৳ ${item.overAmount.toLocaleString('en-US')}`}
                          </Text>
                        </View>
                      ) : isWarning ? (
                        <View style={styles.badgeWarning}>
                          <Text style={styles.badgeWarningText}>
                            ⚠️ {item.percentage.toFixed(0)}% Used
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.badgeSafeText}>
                          {item.percentage.toFixed(0)}% used • ৳{(item.remaining).toLocaleString('en-US')} left
                        </Text>
                      )}
                    </View>
                  </View>
                </View>

                {/* AMOUNT & LIMIT */}
                <View style={styles.amountGroup}>
                  <Text style={[styles.spentAmountText, isOver && styles.spentAmountOver]}>
                    {isPrivacyMode ? '••••' : `৳ ${item.spent.toLocaleString('en-US')}`}
                  </Text>
                  <Text style={styles.limitText}>
                    / {isPrivacyMode ? '••••' : `৳ ${item.budget.toLocaleString('en-US')}`}
                  </Text>
                </View>
              </View>

              {/* PROGRESS BAR */}
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${Math.max(baseBarWidth, 2)}%`,
                      backgroundColor: isPrivacyMode
                        ? 'rgba(255, 255, 255, 0.2)'
                        : isOver
                        ? '#FF922B'
                        : isWarning
                        ? '#FCC419'
                        : item.category.color,
                    },
                  ]}
                />

                {isOver && (
                  <View
                    style={[
                      styles.overflowFill,
                      { width: `${Math.max(overflowPercentage, 8)}%` },
                    ]}
                  />
                )}
              </View>

              {/* INLINE REBALANCE CTA IF OVERBUDGET */}
              {isOver && onOpenRebalance && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => onOpenRebalance(item.category.id)}
                  style={styles.inlineRebalancePrompt}>
                  <MaterialIcons name="auto-fix-high" size={12} color="#C8F135" />
                  <Text style={styles.inlineRebalancePromptText}>
                    Fix with Surplus Envelope Rebalance
                  </Text>
                  <MaterialIcons name="chevron-right" size={14} color="#C8F135" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}

        {filteredList.length === 0 && (
          <View style={styles.emptyFilterBox}>
            <Text style={styles.emptyFilterText}>No categories in this filter.</Text>
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#161A1D',
    borderRadius: 22,
    padding: Spacing.four,
    gap: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleBox: {
    flex: 1,
    gap: 2,
  },
  headerSectionLabel: {
    fontFamily: F.sansBold,
    fontSize: 12,
    color: C.onSurfaceVariant,
    letterSpacing: 0.8,
  },
  headerAllocationText: {
    fontFamily: F.sansMedium,
    fontSize: 12,
    color: C.onSurface,
  },
  setLimitsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(200, 241, 53, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(200, 241, 53, 0.25)',
  },
  setLimitsText: {
    fontFamily: F.sansBold,
    fontSize: 12,
    color: '#C8F135',
  },
  allocationTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  allocationFill: {
    height: '100%',
    borderRadius: 2,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(250, 82, 82, 0.1)',
    borderRadius: 14,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(250, 82, 82, 0.25)',
  },
  alertIconBox: {
    width: 24,
    alignItems: 'center',
  },
  alertTextCol: {
    flex: 1,
    gap: 1,
  },
  alertTitle: {
    fontFamily: F.sansBold,
    fontSize: 13,
    color: '#FA5252',
  },
  alertSubtitle: {
    fontFamily: F.sans,
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  rebalanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#C8F135',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
  },
  rebalanceBtnText: {
    fontFamily: F.sansBold,
    fontSize: 12,
    color: '#101416',
  },
  healthyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(32, 201, 151, 0.08)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(32, 201, 151, 0.18)',
  },
  healthyText: {
    fontFamily: F.sansSemiBold,
    fontSize: 12,
    color: '#20C997',
  },
  filterPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  filterPillActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  filterPillRed: {
    backgroundColor: 'rgba(250, 82, 82, 0.08)',
    borderColor: 'rgba(250, 82, 82, 0.2)',
  },
  filterPillRedActive: {
    backgroundColor: '#FA5252',
    borderColor: '#FA5252',
  },
  filterPillText: {
    fontFamily: F.sansMedium,
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  filterPillTextActive: {
    color: '#101416',
    fontWeight: '700',
  },
  filterPillTextRed: {
    color: '#FA5252',
    fontFamily: F.sansBold,
  },
  list: {
    gap: 10,
  },
  itemRow: {
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.025)',
    padding: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryNameText: {
    fontFamily: F.sansBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  bucketTagFixed: {
    backgroundColor: 'rgba(116, 143, 252, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
  },
  bucketTagTextFixed: {
    fontFamily: F.sansBold,
    fontSize: 10,
    color: '#748FFC',
  },
  bucketTagFlex: {
    backgroundColor: 'rgba(32, 201, 151, 0.12)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
  },
  bucketTagTextFlex: {
    fontFamily: F.sansBold,
    fontSize: 10,
    color: '#20C997',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 17,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeOver: {
    backgroundColor: 'rgba(250, 82, 82, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  badgeOverText: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: '#FA5252',
  },
  badgeWarning: {
    backgroundColor: 'rgba(252, 196, 25, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  badgeWarningText: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: '#FCC419',
  },
  badgeSafeText: {
    fontFamily: F.sans,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  amountGroup: {
    alignItems: 'flex-end',
    gap: 1,
  },
  spentAmountText: {
    fontFamily: F.sansBold,
    fontSize: 14,
    color: C.onSurface,
  },
  spentAmountOver: {
    color: '#FA5252',
  },
  limitText: {
    fontFamily: F.sans,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  track: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  overflowFill: {
    height: '100%',
    backgroundColor: '#FA5252',
    borderRadius: 3,
    marginLeft: 2,
  },
  inlineRebalancePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(200, 241, 53, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 2,
  },
  inlineRebalancePromptText: {
    fontFamily: F.sansSemiBold,
    fontSize: 11,
    color: '#C8F135',
    flex: 1,
  },
  emptyFilterBox: {
    padding: 20,
    alignItems: 'center',
  },
  emptyFilterText: {
    fontFamily: F.sans,
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
});
