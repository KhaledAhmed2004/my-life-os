import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  SAVINGS_CATEGORY_CONFIG,
  SAVINGS_PRESETS,
} from '@/constants/default-savings';
import { Vital } from '@/constants/vital-theme';
import { useSavingsStore } from '@/stores/savings-store';
import { SavingsCategory, SavingsGoal, SavingsPreset } from '@/types/savings';

const C = Vital.colors;
const F = Vital.fonts;

const AVAILABLE_EMOJIS = ['🛡️', '🚗', '✈️', '💻', '🏋️', '🏠', '💍', '📈', '🎮', '🎓', '🏖️', '🐷'];

const TIMELINE_OPTIONS = [
  { label: '3 Mo', months: 3 },
  { label: '6 Mo', months: 6 },
  { label: '1 Year', months: 12 },
  { label: '2 Years', months: 24 },
];

interface SavingsGoalSheetProps {
  visible: boolean;
  goalToEdit?: SavingsGoal | null;
  onClose: () => void;
}

export function SavingsGoalSheet({
  visible,
  goalToEdit,
  onClose,
}: SavingsGoalSheetProps) {
  const insets = useSafeAreaInsets();
  const addGoal = useSavingsStore((s) => s.addGoal);
  const updateGoal = useSavingsStore((s) => s.updateGoal);

  const isEditMode = !!goalToEdit;

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🛡️');
  const [targetAmount, setTargetAmount] = useState('150000');
  const [initialDeposit, setInitialDeposit] = useState('0');
  const [selectedCategory, setSelectedCategory] = useState<SavingsCategory>('EMERGENCY');
  const [selectedMonths, setSelectedMonths] = useState(6);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (visible) {
      if (goalToEdit) {
        setName(goalToEdit.name);
        setIcon(goalToEdit.icon);
        setTargetAmount(String(goalToEdit.targetAmount));
        setSelectedCategory(goalToEdit.category);
        setNotes(goalToEdit.notes || '');
        setInitialDeposit('0');
      } else {
        setName('');
        setIcon('🛡️');
        setTargetAmount('150000');
        setInitialDeposit('0');
        setSelectedCategory('EMERGENCY');
        setSelectedMonths(6);
        setNotes('');
      }
    }
  }, [visible, goalToEdit]);

  const handleSelectPreset = (preset: SavingsPreset) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setName(preset.title);
    setIcon(preset.icon);
    setTargetAmount(String(preset.defaultTarget));
    setSelectedCategory(preset.category);
    setSelectedMonths(preset.durationMonths);
  };

  const parsedTarget = parseInt(targetAmount.replace(/[^0-9]/g, ''), 10) || 0;
  const parsedInitial = parseInt(initialDeposit.replace(/[^0-9]/g, ''), 10) || 0;
  const remainingTarget = isEditMode
    ? Math.max(0, parsedTarget - (goalToEdit?.currentAmount || 0))
    : Math.max(0, parsedTarget - parsedInitial);
  const suggestedMonthly = selectedMonths > 0 ? Math.ceil(remainingTarget / selectedMonths) : 0;

  const handleSubmit = async () => {
    if (!name.trim() || parsedTarget <= 0) return;

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const targetDateObj = new Date();
    targetDateObj.setMonth(targetDateObj.getMonth() + selectedMonths);
    const targetDateStr = targetDateObj.toISOString().split('T')[0];

    const categoryConfig = SAVINGS_CATEGORY_CONFIG[selectedCategory] || SAVINGS_CATEGORY_CONFIG.GENERAL;

    if (isEditMode && goalToEdit) {
      await updateGoal(goalToEdit.id, {
        name: name.trim(),
        icon,
        targetAmount: parsedTarget,
        targetDate: targetDateStr,
        color: categoryConfig.color,
        category: selectedCategory,
        notes: notes.trim() || undefined,
      });
    } else {
      await addGoal({
        name: name.trim(),
        icon,
        targetAmount: parsedTarget,
        initialDeposit: parsedInitial,
        targetDate: targetDateStr,
        color: categoryConfig.color,
        category: selectedCategory,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
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
            {/* HEADER */}
            <View style={styles.headerRow}>
              <View style={styles.headerTitleBox}>
                <Text style={styles.sheetTitle}>
                  {isEditMode ? 'Edit Vault Settings' : 'Create Wealth Vault'}
                </Text>
                <Text style={styles.sheetSubtitle}>
                  {isEditMode
                    ? 'Update target amount, deadline, or vault details'
                    : 'Set up a dedicated target and timeline for your savings'}
                </Text>
              </View>

              <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={10}>
                <MaterialIcons name="close" size={20} color={C.onSurface} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}>
              {/* STARTER PRESETS (ONLY IN CREATE MODE) */}
              {!isEditMode && (
                <>
                  <Text style={styles.sectionTitle}>STARTER VAULT PRESETS</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.presetsRow}>
                    {SAVINGS_PRESETS.map((preset) => (
                      <TouchableOpacity
                        key={preset.id}
                        activeOpacity={0.8}
                        onPress={() => handleSelectPreset(preset)}
                        style={styles.presetChip}>
                        <Text style={styles.presetEmoji}>{preset.icon}</Text>
                        <Text style={styles.presetTitle}>{preset.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              {/* VAULT NAME & ICON */}
              <Text style={styles.sectionTitle}>VAULT NAME & ICON</Text>
              <View style={styles.inputGroup}>
                <View style={styles.nameAndEmojiRow}>
                  <View style={styles.currentEmojiBox}>
                    <Text style={styles.currentEmojiText}>{icon}</Text>
                  </View>

                  <TextInput
                    style={styles.nameTextInput}
                    placeholder="e.g. Emergency Fund, Japan Trip"
                    placeholderTextColor={C.onSurfaceVariant}
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                {/* EMOJI HORIZONTAL STRIP */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.emojiList}>
                  {AVAILABLE_EMOJIS.map((em) => (
                    <TouchableOpacity
                      key={em}
                      onPress={() => {
                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        setIcon(em);
                      }}
                      style={[styles.emojiBtn, icon === em && styles.emojiBtnSelected]}>
                      <Text style={styles.emojiBtnText}>{em}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* TARGET AMOUNT & (IF CREATE) INITIAL DEPOSIT */}
              <View style={styles.amountsRow}>
                <View style={[styles.amountCol, { flex: 1.2 }]}>
                  <Text style={styles.sectionTitle}>TARGET AMOUNT</Text>
                  <View style={styles.amountInputWrap}>
                    <TextInput
                      style={styles.amountInput}
                      keyboardType="numeric"
                      value={targetAmount}
                      onChangeText={setTargetAmount}
                    />
                    <Text style={styles.currencySuffix}>৳</Text>
                  </View>
                </View>

                {!isEditMode && (
                  <View style={[styles.amountCol, { flex: 1 }]}>
                    <Text style={styles.sectionTitle}>INITIAL DEPOSIT</Text>
                    <View style={styles.amountInputWrap}>
                      <TextInput
                        style={styles.amountInput}
                        keyboardType="numeric"
                        value={initialDeposit}
                        onChangeText={setInitialDeposit}
                      />
                      <Text style={styles.currencySuffix}>৳</Text>
                    </View>
                  </View>
                )}
              </View>

              {/* TIMELINE SHORTCUTS */}
              <Text style={styles.sectionTitle}>TARGET TIMELINE</Text>
              <View style={styles.timelineRow}>
                {TIMELINE_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.months}
                    onPress={() => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      setSelectedMonths(opt.months);
                    }}
                    style={[
                      styles.timelineBtn,
                      selectedMonths === opt.months && styles.timelineBtnActive,
                    ]}>
                    <Text
                      style={[
                        styles.timelineText,
                        selectedMonths === opt.months && styles.timelineTextActive,
                      ]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* LIVE PACE HELPER BANNER */}
              {parsedTarget > 0 && (
                <View style={styles.paceHelperCard}>
                  <MaterialIcons name="insights" size={18} color="#C8F135" />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.paceHelperTitle}>Suggested Monthly Pace</Text>
                    <Text style={styles.paceHelperText}>
                      Save ~{suggestedMonthly.toLocaleString('en-US').replace(/,/g, ' ')} ৳/month for{' '}
                      {selectedMonths} months to hit your goal.
                    </Text>
                  </View>
                </View>
              )}

              {/* OPTIONAL NOTES */}
              <Text style={styles.sectionTitle}>NOTES (OPTIONAL)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Add goal details, bank account info, or reminders"
                placeholderTextColor={C.onSurfaceVariant}
                value={notes}
                onChangeText={setNotes}
              />
            </ScrollView>

            {/* BOTTOM ACTION BUTTON */}
            <View style={styles.footer}>
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={!name.trim() || parsedTarget <= 0}
                onPress={handleSubmit}
                style={[
                  styles.createBtn,
                  (!name.trim() || parsedTarget <= 0) && styles.createBtnDisabled,
                ]}>
                <MaterialIcons
                  name={isEditMode ? 'save' : 'lock'}
                  size={18}
                  color="#101416"
                />
                <Text style={styles.createBtnText}>
                  {isEditMode ? 'Save Vault Changes' : 'Create Vault'}
                </Text>
              </TouchableOpacity>
            </View>
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
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerTitleBox: {
    flex: 1,
    gap: 2,
  },
  sheetTitle: {
    fontFamily: F.sansBold,
    fontSize: 18,
    color: C.onSurface,
  },
  sheetSubtitle: {
    fontFamily: F.sans,
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  sectionTitle: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.surfaceContainer,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.glassBorder,
  },
  presetEmoji: {
    fontSize: 14,
  },
  presetTitle: {
    fontFamily: F.sansSemiBold,
    fontSize: 12,
    color: C.onSurface,
  },
  inputGroup: {
    gap: 10,
  },
  nameAndEmojiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  currentEmojiBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentEmojiText: {
    fontSize: 22,
  },
  nameTextInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: F.sansMedium,
    fontSize: 15,
    color: C.onSurface,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  emojiList: {
    flexDirection: 'row',
    gap: 8,
  },
  emojiBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBtnSelected: {
    backgroundColor: 'rgba(200, 241, 53, 0.2)',
    borderWidth: 1,
    borderColor: '#C8F135',
  },
  emojiBtnText: {
    fontSize: 18,
  },
  amountsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  amountCol: {
    gap: 6,
  },
  amountInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  amountInput: {
    flex: 1,
    fontFamily: F.sansBold,
    fontSize: 16,
    color: C.onSurface,
  },
  currencySuffix: {
    fontFamily: F.sansBold,
    fontSize: 14,
    color: C.onSurfaceVariant,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 8,
  },
  timelineBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  timelineBtnActive: {
    backgroundColor: '#C8F135',
    borderColor: '#C8F135',
  },
  timelineText: {
    fontFamily: F.sansBold,
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  timelineTextActive: {
    color: '#101416',
  },
  paceHelperCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(200, 241, 53, 0.1)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(200, 241, 53, 0.25)',
  },
  paceHelperTitle: {
    fontFamily: F.sansBold,
    fontSize: 12,
    color: '#C8F135',
  },
  paceHelperText: {
    fontFamily: F.sans,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  notesInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: F.sans,
    fontSize: 13,
    color: C.onSurface,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C8F135',
    borderRadius: 18,
    paddingVertical: 14,
    gap: 8,
    shadowColor: '#C8F135',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  createBtnDisabled: {
    opacity: 0.4,
  },
  createBtnText: {
    fontFamily: F.sansBold,
    fontSize: 15,
    color: '#101416',
  },
});
