import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Alert,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SAVINGS_CATEGORY_CONFIG } from '@/constants/default-savings';
import { Vital } from '@/constants/vital-theme';
import { useSavingsStore } from '@/stores/savings-store';
import { SavingsGoal } from '@/types/savings';

const C = Vital.colors;
const F = Vital.fonts;

interface VaultDetailModalProps {
  visible: boolean;
  goal: SavingsGoal | null;
  onClose: () => void;
  onEdit: (goal: SavingsGoal) => void;
}

export function VaultDetailModal({
  visible,
  goal,
  onClose,
  onEdit,
}: VaultDetailModalProps) {
  const insets = useSafeAreaInsets();
  const deposit = useSavingsStore((s) => s.deposit);
  const withdraw = useSavingsStore((s) => s.withdraw);
  const deleteGoal = useSavingsStore((s) => s.deleteGoal);
  const getGoalPace = useSavingsStore((s) => s.getGoalPace);

  const [transferMode, setTransferMode] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');
  const [amountStr, setAmountStr] = useState('5000');
  const [note, setNote] = useState('');
  const [celebrateShimmer, setCelebrateShimmer] = useState(false);

  if (!goal) return null;

  const pace = getGoalPace(goal.id);
  const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const isDone = goal.isCompleted || percentage >= 100;
  const categoryConfig = SAVINGS_CATEGORY_CONFIG[goal.category] || SAVINGS_CATEGORY_CONFIG.GENERAL;

  const parsedAmount = parseInt(amountStr.replace(/[^0-9]/g, ''), 10) || 0;
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  const handleQuickChip = (val: number) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setAmountStr(String(val));
  };

  const handleExecuteTransfer = async () => {
    if (parsedAmount <= 0) return;

    if (transferMode === 'DEPOSIT') {
      const reached100 = await deposit(goal.id, parsedAmount, note.trim() || undefined);
      if (reached100) {
        setCelebrateShimmer(true);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } else {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      }
    } else {
      await withdraw(goal.id, parsedAmount, note.trim() || undefined);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }

    setAmountStr('5000');
    setNote('');
  };

  const handleDeleteWithRefund = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Alert.alert(
      'Delete Vault & Refund',
      `Delete "${goal.name}"? Any remaining balance of ${goal.currentAmount.toLocaleString('en-US').replace(/,/g, ' ')} ৳ will be automatically refunded to your spendable wallet.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete & Refund',
          style: 'destructive',
          onPress: async () => {
            await deleteGoal(goal.id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.avoidingContainer}>
          <View
            style={[
              styles.sheetContainer,
              { paddingBottom: Math.max(insets.bottom, 20) },
            ]}>
            {/* HEADER WITH TITLE & ACTION BUTTONS */}
            <View style={styles.headerRow}>
              <View style={styles.titleGroup}>
                <View style={[styles.iconBox, { backgroundColor: categoryConfig.bgColor }]}>
                  <Text style={styles.iconEmoji}>{goal.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.goalName} numberOfLines={1}>
                    {goal.name}
                  </Text>
                  <Text style={[styles.categoryName, { color: categoryConfig.color }]}>
                    {categoryConfig.label}
                  </Text>
                </View>
              </View>

              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={() => {
                    onClose();
                    onEdit(goal);
                  }}
                  style={styles.actionIconBtn}>
                  <MaterialIcons name="edit" size={17} color={C.onSurface} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDeleteWithRefund}
                  style={styles.actionIconBtn}>
                  <MaterialIcons name="delete-outline" size={17} color="#FA5252" />
                </TouchableOpacity>

                <TouchableOpacity onPress={onClose} style={styles.actionIconBtn}>
                  <MaterialIcons name="close" size={18} color={C.onSurface} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}>
              {/* BALANCE & PROGRESS HERO CARD */}
              <View style={[styles.progressCard, isDone && styles.progressCardDone]}>
                <View style={styles.progressHeaderRow}>
                  <View>
                    <Text style={styles.progressBalanceLabel}>STORED VAULT BALANCE</Text>
                    <Text style={styles.progressBalanceAmount}>
                      {goal.currentAmount.toLocaleString('en-US').replace(/,/g, ' ')} ৳
                    </Text>
                  </View>

                  <View style={styles.progressBadgeCol}>
                    <View
                      style={[
                        styles.pctBadge,
                        isDone ? styles.pctBadgeDone : { backgroundColor: `${goal.color}25` },
                      ]}>
                      <Text
                        style={[
                          styles.pctBadgeText,
                          isDone ? styles.pctBadgeTextDone : { color: goal.color },
                        ]}>
                        {isDone ? '🏆 Goal 100% Mastered' : `${percentage.toFixed(0)}%`}
                      </Text>
                    </View>
                    <Text style={styles.targetLabel}>
                      Target: {goal.targetAmount.toLocaleString('en-US').replace(/,/g, ' ')} ৳
                    </Text>
                  </View>
                </View>

                {/* LIQUID PROGRESS CAPSULE */}
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(100, Math.max(3, percentage))}%`,
                        backgroundColor: isDone ? '#C8F135' : goal.color,
                      },
                    ]}
                  />
                </View>

                {/* MILESTONE BADGES ROW (25%, 50%, 75%, 100%) */}
                <View style={styles.milestonesRow}>
                  <View style={[styles.milestoneItem, percentage >= 25 && styles.milestonePassed]}>
                    <Text style={styles.milestoneIcon}>{percentage >= 25 ? '🥉' : '⚪'}</Text>
                    <Text style={styles.milestoneLabel}>25%</Text>
                  </View>
                  <View style={[styles.milestoneItem, percentage >= 50 && styles.milestonePassed]}>
                    <Text style={styles.milestoneIcon}>{percentage >= 50 ? '🥈' : '⚪'}</Text>
                    <Text style={styles.milestoneLabel}>50%</Text>
                  </View>
                  <View style={[styles.milestoneItem, percentage >= 75 && styles.milestonePassed]}>
                    <Text style={styles.milestoneIcon}>{percentage >= 75 ? '🥇' : '⚪'}</Text>
                    <Text style={styles.milestoneLabel}>75%</Text>
                  </View>
                  <View style={[styles.milestoneItem, percentage >= 100 && styles.milestonePassed]}>
                    <Text style={styles.milestoneIcon}>{percentage >= 100 ? '🏆' : '⚪'}</Text>
                    <Text style={styles.milestoneLabel}>100%</Text>
                  </View>
                </View>

                {/* PACE & DEADLINE PILL */}
                {!isDone && (
                  <View style={styles.pacePill}>
                    <MaterialIcons name="event" size={14} color="#C8F135" />
                    <Text style={styles.paceText}>
                      {pace.monthsRemaining} months remaining • Recommended:{' '}
                      ~{pace.suggestedMonthly.toLocaleString('en-US').replace(/,/g, ' ')} ৳/mo
                    </Text>
                  </View>
                )}
              </View>

              {/* INLINE TRANSFER STEPPERS SECTION */}
              <View style={styles.transferSection}>
                {/* MODE TOGGLE: DEPOSIT VS WITHDRAW */}
                <View style={styles.modeToggleRow}>
                  <TouchableOpacity
                    onPress={() => setTransferMode('DEPOSIT')}
                    style={[
                      styles.modeToggleBtn,
                      transferMode === 'DEPOSIT' && styles.modeToggleBtnActive,
                    ]}>
                    <MaterialIcons
                      name="add"
                      size={15}
                      color={transferMode === 'DEPOSIT' ? '#101416' : C.onSurfaceVariant}
                    />
                    <Text
                      style={[
                        styles.modeToggleText,
                        transferMode === 'DEPOSIT' && styles.modeToggleTextActive,
                      ]}>
                      Deposit Funds
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setTransferMode('WITHDRAW')}
                    style={[
                      styles.modeToggleBtn,
                      transferMode === 'WITHDRAW' && styles.modeToggleBtnActive,
                    ]}>
                    <MaterialIcons
                      name="north-east"
                      size={15}
                      color={transferMode === 'WITHDRAW' ? '#101416' : C.onSurfaceVariant}
                    />
                    <Text
                      style={[
                        styles.modeToggleText,
                        transferMode === 'WITHDRAW' && styles.modeToggleTextActive,
                      ]}>
                      Withdraw
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* QUICK CHIPS */}
                <View style={styles.chipsRow}>
                  {transferMode === 'DEPOSIT' ? (
                    <>
                      <TouchableOpacity
                        onPress={() => handleQuickChip(1000)}
                        style={styles.quickChip}>
                        <Text style={styles.quickChipText}>+1k</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleQuickChip(5000)}
                        style={styles.quickChip}>
                        <Text style={styles.quickChipText}>+5k</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleQuickChip(10000)}
                        style={styles.quickChip}>
                        <Text style={styles.quickChipText}>+10k</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleQuickChip(25000)}
                        style={styles.quickChip}>
                        <Text style={styles.quickChipText}>+25k</Text>
                      </TouchableOpacity>
                      {remaining > 0 && (
                        <TouchableOpacity
                          onPress={() => handleQuickChip(remaining)}
                          style={[styles.quickChip, styles.quickChipHighlight]}>
                          <Text style={styles.quickChipHighlightText}>Fill 🎯</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  ) : (
                    <>
                      <TouchableOpacity
                        onPress={() => handleQuickChip(1000)}
                        style={styles.quickChip}>
                        <Text style={styles.quickChipText}>1k</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleQuickChip(5000)}
                        style={styles.quickChip}>
                        <Text style={styles.quickChipText}>5k</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleQuickChip(10000)}
                        style={styles.quickChip}>
                        <Text style={styles.quickChipText}>10k</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleQuickChip(goal.currentAmount)}
                        style={[styles.quickChip, styles.quickChipHighlight]}>
                        <Text style={styles.quickChipHighlightText}>Max</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>

                {/* AMOUNT INPUT & EXECUTE BUTTON */}
                <View style={styles.amountInputRow}>
                  <View style={styles.amountInputBox}>
                    <TextInput
                      style={styles.amountInput}
                      keyboardType="numeric"
                      value={amountStr}
                      onChangeText={setAmountStr}
                    />
                    <Text style={styles.currencySuffix}>৳</Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    disabled={parsedAmount <= 0}
                    onPress={handleExecuteTransfer}
                    style={[
                      styles.executeBtn,
                      transferMode === 'WITHDRAW' && styles.executeBtnWithdraw,
                      parsedAmount <= 0 && styles.executeBtnDisabled,
                    ]}>
                    <Text
                      style={[
                        styles.executeBtnText,
                        transferMode === 'WITHDRAW' && styles.executeBtnTextWithdraw,
                      ]}>
                      {transferMode === 'DEPOSIT' ? 'Deposit' : 'Withdraw'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* OPTIONAL NOTE INPUT */}
                <TextInput
                  style={styles.noteInput}
                  placeholder="Note (e.g. Salary savings, bonus)"
                  placeholderTextColor={C.onSurfaceVariant}
                  value={note}
                  onChangeText={setNote}
                />
              </View>

              {/* ACTIVITY TIMELINE LOG */}
              <Text style={styles.timelineHeader}>CONTRIBUTION TIMELINE LOG</Text>
              <View style={styles.timelineList}>
                {goal.history.map((tx) => {
                  const isDep = tx.type === 'DEPOSIT';
                  return (
                    <View key={tx.id} style={styles.historyRow}>
                      <View style={styles.historyIconBox}>
                        <MaterialIcons
                          name={isDep ? 'arrow-downward' : 'arrow-upward'}
                          size={14}
                          color={isDep ? '#C8F135' : '#FA5252'}
                        />
                      </View>
                      <View style={styles.historyDetails}>
                        <Text style={styles.historyNote}>{tx.note || (isDep ? 'Deposit' : 'Withdrawal')}</Text>
                        <Text style={styles.historyDate}>{tx.date}</Text>
                      </View>
                      <Text
                        style={[
                          styles.historyAmount,
                          isDep ? styles.historyAmountDeposit : styles.historyAmountWithdraw,
                        ]}>
                        {isDep ? '+' : '-'}{tx.amount.toLocaleString('en-US').replace(/,/g, ' ')} ৳
                      </Text>
                    </View>
                  );
                })}

                {goal.history.length === 0 && (
                  <Text style={styles.emptyHistoryText}>No contributions recorded yet.</Text>
                )}
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  avoidingContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#161A1D',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 22,
  },
  goalName: {
    fontFamily: F.sansBold,
    fontSize: 16,
    color: C.onSurface,
  },
  categoryName: {
    fontFamily: F.sansMedium,
    fontSize: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  progressCard: {
    backgroundColor: C.surfaceContainer,
    borderRadius: 22,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: C.glassBorder,
  },
  progressCardDone: {
    borderColor: 'rgba(200, 241, 53, 0.35)',
  },
  progressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  progressBalanceLabel: {
    fontFamily: F.sansBold,
    fontSize: 10,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  progressBalanceAmount: {
    fontFamily: F.sansBold,
    fontSize: 26,
    color: C.onSurface,
    letterSpacing: -0.5,
  },
  progressBadgeCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  pctBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  pctBadgeDone: {
    backgroundColor: 'rgba(200, 241, 53, 0.2)',
  },
  pctBadgeText: {
    fontFamily: F.sansBold,
    fontSize: 13,
  },
  pctBadgeTextDone: {
    color: '#C8F135',
  },
  targetLabel: {
    fontFamily: F.sans,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  progressTrack: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  milestonesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  milestoneItem: {
    alignItems: 'center',
    gap: 2,
    opacity: 0.5,
  },
  milestonePassed: {
    opacity: 1,
  },
  milestoneIcon: {
    fontSize: 14,
  },
  milestoneLabel: {
    fontFamily: F.sansBold,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  pacePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(200, 241, 53, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  paceText: {
    fontFamily: F.sans,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  transferSection: {
    backgroundColor: C.surfaceContainer,
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: C.glassBorder,
  },
  modeToggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  modeToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  modeToggleBtnActive: {
    backgroundColor: '#C8F135',
  },
  modeToggleText: {
    fontFamily: F.sansMedium,
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  modeToggleTextActive: {
    fontFamily: F.sansBold,
    color: '#101416',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  quickChipText: {
    fontFamily: F.sansBold,
    fontSize: 12,
    color: C.onSurface,
  },
  quickChipHighlight: {
    backgroundColor: 'rgba(200, 241, 53, 0.15)',
    borderColor: '#C8F135',
  },
  quickChipHighlightText: {
    fontFamily: F.sansBold,
    fontSize: 12,
    color: '#C8F135',
  },
  amountInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  amountInputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  amountInput: {
    flex: 1,
    fontFamily: F.sansBold,
    fontSize: 20,
    color: C.onSurface,
  },
  currencySuffix: {
    fontFamily: F.sansBold,
    fontSize: 16,
    color: C.onSurfaceVariant,
  },
  executeBtn: {
    backgroundColor: '#C8F135',
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C8F135',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  executeBtnWithdraw: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    shadowOpacity: 0,
  },
  executeBtnDisabled: {
    opacity: 0.4,
  },
  executeBtnText: {
    fontFamily: F.sansBold,
    fontSize: 14,
    color: '#101416',
  },
  executeBtnTextWithdraw: {
    color: C.onSurface,
  },
  noteInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: F.sans,
    fontSize: 12,
    color: C.onSurface,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  timelineHeader: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: C.onSurfaceVariant,
    letterSpacing: 0.8,
    marginTop: 4,
  },
  timelineList: {
    gap: 8,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  historyIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyDetails: {
    flex: 1,
    gap: 2,
  },
  historyNote: {
    fontFamily: F.sansBold,
    fontSize: 13,
    color: C.onSurface,
  },
  historyDate: {
    fontFamily: F.sans,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  historyAmount: {
    fontFamily: F.sansBold,
    fontSize: 13,
  },
  historyAmountDeposit: {
    color: '#C8F135',
  },
  historyAmountWithdraw: {
    color: '#FA5252',
  },
  emptyHistoryText: {
    fontFamily: F.sans,
    fontSize: 12,
    color: C.onSurfaceVariant,
    textAlign: 'center',
    paddingVertical: 14,
  },
});
