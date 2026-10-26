import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { getCategoryVectorIcon } from '@/constants/expense-categories';
import { Vital } from '@/constants/vital-theme';
import { CategoryBudgetStatus, useExpenseStore } from '@/stores/expense-store';
import { Transaction } from '@/types/expense';

const C = Vital.colors;
const F = Vital.fonts;

interface CategoryDetailSheetProps {
  visible: boolean;
  categoryStatus: CategoryBudgetStatus | null;
  onClose: () => void;
  onDeleteTransaction?: (id: string) => void;
}

export function CategoryDetailSheet({
  visible,
  categoryStatus,
  onClose,
  onDeleteTransaction,
}: CategoryDetailSheetProps) {
  const transactions = useExpenseStore((s) => s.transactions);
  const setCategoryBudget = useExpenseStore((s) => s.setCategoryBudget);
  const isPrivacyMode = useExpenseStore((s) => s.isPrivacyMode);

  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [limitInput, setLimitInput] = useState('');

  // Filter transactions for this specific category
  const categoryTransactions = useMemo(() => {
    if (!categoryStatus) return [];
    return transactions.filter(
      (tx) => tx.type === 'EXPENSE' && tx.categoryId === categoryStatus.category.id
    );
  }, [transactions, categoryStatus]);

  if (!categoryStatus) return null;

  const { category, budget, spent, remaining, percentage, status, overAmount } = categoryStatus;
  const isOver = status === 'OVERBUDGET';
  const isWarning = status === 'WARNING';

  const handleOpenLimitEditor = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setLimitInput(String(budget));
    setIsEditingLimit(true);
  };

  const handleSaveLimit = () => {
    const parsed = parseFloat(limitInput);
    if (!isNaN(parsed) && parsed >= 0) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      void setCategoryBudget(category.id, parsed);
    }
    setIsEditingLimit(false);
  };

  const handleQuickAdjust = (diff: number) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const nextVal = Math.max(500, budget + diff);
    void setCategoryBudget(category.id, nextVal);
  };

  const getStatusTheme = () => {
    if (isOver) {
      return {
        badgeBg: 'rgba(250, 82, 82, 0.15)',
        badgeBorder: 'rgba(250, 82, 82, 0.3)',
        color: '#FA5252',
        label: `Over Budget (+৳ ${overAmount.toLocaleString('en-US')})`,
        icon: 'warning',
      };
    }
    if (isWarning) {
      return {
        badgeBg: 'rgba(252, 196, 25, 0.15)',
        badgeBorder: 'rgba(252, 196, 25, 0.3)',
        color: '#FCC419',
        label: `Near Limit (${percentage.toFixed(0)}% Used)`,
        icon: 'info',
      };
    }
    return {
      badgeBg: 'rgba(32, 201, 151, 0.15)',
      badgeBorder: 'rgba(32, 201, 151, 0.3)',
      color: '#20C997',
      label: `Within Budget (${percentage.toFixed(0)}% Used)`,
      icon: 'check-circle',
    };
  };

  const statusTheme = getStatusTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}>
        <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.modalBackdrop} />

        <View style={styles.sheetContainer}>
          {/* DRAG HANDLE */}
          <View style={styles.handleBar} />

          {/* 1. HEADER: ICON + NAME + CLOSE */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.categoryIconBox,
                  {
                    backgroundColor: `${category.color}1A`,
                    borderColor: `${category.color}35`,
                    borderWidth: 1,
                  },
                ]}>
                <MaterialIcons
                  name={getCategoryVectorIcon(category.id) as any}
                  size={22}
                  color={category.color}
                />
              </View>
              <View>
                <Text style={styles.categoryTitle}>{category.name}</Text>
                <Text style={styles.categorySub}>
                  {categoryTransactions.length} transaction
                  {categoryTransactions.length !== 1 ? 's' : ''} this cycle
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={18} color={C.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* 2. SPENDING & BUDGET HERO CARD */}
          <View style={styles.summaryHero}>
            <View style={styles.heroRow}>
              <View>
                <Text style={styles.heroLabel}>TOTAL SPENT</Text>
                <Text style={[styles.heroSpent, isOver && styles.heroSpentOver]}>
                  {isPrivacyMode ? '•••• ৳' : `৳ ${spent.toLocaleString('en-US')}`}
                </Text>
              </View>

              <View style={styles.heroRightCol}>
                <Text style={styles.heroLabel}>MONTHLY LIMIT</Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleOpenLimitEditor}
                  style={styles.limitBadge}>
                  <Text style={styles.limitBadgeText}>
                    {isPrivacyMode ? '••••' : `৳ ${budget.toLocaleString('en-US')}`}
                  </Text>
                  <MaterialIcons name="edit" size={12} color="#C8F135" />
                </TouchableOpacity>
              </View>
            </View>

            {/* PROGRESS TRACK */}
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(100, percentage)}%`,
                    backgroundColor: isOver
                      ? '#FA5252'
                      : isWarning
                      ? '#FCC419'
                      : category.color,
                  },
                ]}
              />
            </View>

            {/* STATUS FOOTER */}
            <View style={styles.heroFooter}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: statusTheme.badgeBg,
                    borderColor: statusTheme.badgeBorder,
                  },
                ]}>
                <MaterialIcons
                  name={statusTheme.icon as any}
                  size={12}
                  color={statusTheme.color}
                />
                <Text style={[styles.statusBadgeText, { color: statusTheme.color }]}>
                  {statusTheme.label}
                </Text>
              </View>

              <Text style={styles.remainingText}>
                {isOver
                  ? `Exceeded`
                  : isPrivacyMode
                  ? '•••• left'
                  : `৳ ${remaining.toLocaleString('en-US')} left`}
              </Text>
            </View>
          </View>

          {/* 3. INLINE QUICK LIMIT ADJUSTER */}
          {isEditingLimit ? (
            <View style={styles.inlineEditBox}>
              <Text style={styles.inlineEditLabel}>Set Custom Limit for {category.name}</Text>
              <View style={styles.inlineInputRow}>
                <Text style={styles.currencySymbol}>৳</Text>
                <TextInput
                  style={styles.inlineInput}
                  keyboardType="numeric"
                  value={limitInput}
                  onChangeText={setLimitInput}
                  autoFocus
                  selectTextOnFocus
                />
                <TouchableOpacity onPress={handleSaveLimit} style={styles.saveLimitBtn}>
                  <Text style={styles.saveLimitBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.quickAdjustRow}>
              <Text style={styles.quickAdjustLabel}>Quick Adjust:</Text>
              <TouchableOpacity
                onPress={() => handleQuickAdjust(1000)}
                style={styles.quickAdjustChip}>
                <Text style={styles.quickAdjustChipText}>+৳ 1,000</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleQuickAdjust(2000)}
                style={styles.quickAdjustChip}>
                <Text style={styles.quickAdjustChipText}>+৳ 2,000</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleQuickAdjust(-1000)}
                style={styles.quickAdjustChip}>
                <Text style={styles.quickAdjustChipText}>-৳ 1,000</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 4. RECENT TRANSACTIONS IN THIS CATEGORY */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>TRANSACTIONS</Text>
            <Text style={styles.sectionCount}>{categoryTransactions.length} Items</Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.transactionsList}>
            {categoryTransactions.map((tx) => (
              <View key={tx.id} style={styles.txRow}>
                <View style={styles.txLeft}>
                  <Text style={styles.txTitle}>{tx.title}</Text>
                  <Text style={styles.txDate}>
                    {tx.date} {tx.notes ? `• ${tx.notes}` : ''}
                  </Text>
                </View>

                <View style={styles.txRight}>
                  <Text style={styles.txAmount}>
                    {isPrivacyMode ? '•••• ৳' : `-৳ ${tx.amount.toLocaleString('en-US')}`}
                  </Text>
                  {onDeleteTransaction && (
                    <TouchableOpacity
                      onPress={() => onDeleteTransaction(tx.id)}
                      hitSlop={6}
                      style={styles.deleteBtn}>
                      <MaterialIcons name="delete-outline" size={15} color="rgba(255,107,107,0.7)" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            {categoryTransactions.length === 0 && (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyEmoji}>✨</Text>
                <Text style={styles.emptyTitle}>No expenses logged in this category</Text>
                <Text style={styles.emptySubtitle}>
                  Transactions categorized under {category.name} will appear here.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  sheetContainer: {
    backgroundColor: '#161A1D',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '85%',
    gap: 14,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'center',
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryTitle: {
    fontFamily: F.sansBold,
    fontSize: 17,
    color: C.onSurface,
  },
  categorySub: {
    fontFamily: F.sans,
    fontSize: 12,
    color: C.onSurfaceVariant,
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryHero: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  heroLabel: {
    fontFamily: F.sansBold,
    fontSize: 9,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  heroSpent: {
    fontFamily: F.sansBold,
    fontSize: 24,
    color: C.onSurface,
    marginTop: 2,
  },
  heroSpentOver: {
    color: '#FA5252',
  },
  heroRightCol: {
    alignItems: 'flex-end',
    gap: 3,
  },
  limitBadge: {
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
  limitBadgeText: {
    fontFamily: F.sansBold,
    fontSize: 13,
    color: '#C8F135',
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontFamily: F.sansBold,
    fontSize: 11,
  },
  remainingText: {
    fontFamily: F.sansMedium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  inlineEditBox: {
    backgroundColor: 'rgba(200, 241, 53, 0.06)',
    borderRadius: 14,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(200, 241, 53, 0.2)',
  },
  inlineEditLabel: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: '#C8F135',
  },
  inlineInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currencySymbol: {
    fontFamily: F.sansBold,
    fontSize: 18,
    color: '#C8F135',
  },
  inlineInput: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontFamily: F.sansBold,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  saveLimitBtn: {
    backgroundColor: '#C8F135',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveLimitBtnText: {
    fontFamily: F.sansBold,
    fontSize: 12,
    color: '#101416',
  },
  quickAdjustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickAdjustLabel: {
    fontFamily: F.sansMedium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  quickAdjustChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  quickAdjustChipText: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: C.onSurface,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  sectionTitle: {
    fontFamily: F.sansBold,
    fontSize: 10,
    color: C.onSurfaceVariant,
    letterSpacing: 0.8,
  },
  sectionCount: {
    fontFamily: F.sansMedium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  transactionsList: {
    gap: 8,
    paddingBottom: 20,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  txLeft: {
    flex: 1,
    gap: 2,
  },
  txTitle: {
    fontFamily: F.sansSemiBold,
    fontSize: 14,
    color: C.onSurface,
  },
  txDate: {
    fontFamily: F.sans,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  txRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  txAmount: {
    fontFamily: F.sansBold,
    fontSize: 14,
    color: C.onSurface,
  },
  deleteBtn: {
    padding: 4,
  },
  emptyBox: {
    padding: 24,
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    marginTop: 4,
  },
  emptyEmoji: {
    fontSize: 26,
  },
  emptyTitle: {
    fontFamily: F.sansBold,
    fontSize: 13,
    color: C.onSurface,
  },
  emptySubtitle: {
    fontFamily: F.sans,
    fontSize: 11,
    color: C.onSurfaceVariant,
    textAlign: 'center',
  },
});
