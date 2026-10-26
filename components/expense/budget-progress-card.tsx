import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { Vital } from '@/constants/vital-theme';
import { useExpenseStore } from '@/stores/expense-store';

const C = Vital.colors;
const F = Vital.fonts;

interface BudgetProgressCardProps {
  monthlyBudget: number;
  totalExpense: number;
  onUpdateBudget: (newBudget: number) => void;
}

export const BudgetProgressCard: React.FC<BudgetProgressCardProps> = ({
  monthlyBudget,
  totalExpense,
  onUpdateBudget,
}) => {
  const isPrivacyMode = useExpenseStore((s) => s.isPrivacyMode);

  const [modalVisible, setModalVisible] = useState(false);
  const [budgetInput, setBudgetInput] = useState(String(monthlyBudget));
  const [errorMsg, setErrorMsg] = useState('');

  const percentage = monthlyBudget > 0 ? Math.min((totalExpense / monthlyBudget) * 100, 100) : 0;
  const rawPercentage = monthlyBudget > 0 ? (totalExpense / monthlyBudget) * 100 : 0;
  const remaining = Math.max(monthlyBudget - totalExpense, 0);
  const isOverBudget = totalExpense > monthlyBudget;

  const handleOpenEdit = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setBudgetInput(String(monthlyBudget));
    setErrorMsg('');
    setModalVisible(true);
  };

  const handleSave = () => {
    const parsed = parseFloat(budgetInput);
    if (isNaN(parsed) || parsed <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }
    if (parsed > 9999999) {
      setErrorMsg('Maximum budget capacity is ৳ 9,999,999');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onUpdateBudget(parsed);
    setModalVisible(false);
  };

  const handleApplyPreset = (adjustment: number | 'DEFAULT') => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (adjustment === 'DEFAULT') {
      setBudgetInput('50000');
    } else {
      const current = parseFloat(budgetInput) || monthlyBudget || 50000;
      const nextVal = Math.max(1000, current + adjustment);
      setBudgetInput(String(nextVal));
    }
    setErrorMsg('');
  };

  const getProgressColor = () => {
    if (isOverBudget) return '#FA5252';
    if (rawPercentage > 85) return '#FCC419';
    return '#C8F135';
  };

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      {/* HEADER ROW */}
      <View style={styles.header}>
        <View style={styles.titleCol}>
          <Text style={styles.sectionLabel}>MONTHLY BUDGET LIMIT</Text>
          <Text style={styles.budgetAmount}>
            {isPrivacyMode ? '•••••• ৳' : `৳ ${monthlyBudget.toLocaleString('en-US')}`}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleOpenEdit}
          style={styles.editBtn}>
          <MaterialIcons name="edit" size={13} color="#C8F135" />
          <Text style={styles.editBtnText}>Edit Limit</Text>
        </TouchableOpacity>
      </View>

      {/* PROGRESS BAR TRACK */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${percentage}%`, backgroundColor: getProgressColor() },
          ]}
        />
      </View>

      {/* BREAKDOWN DETAILS */}
      <View style={styles.footerRow}>
        <View style={styles.statCol}>
          <Text style={styles.subText}>Total Spent</Text>
          <Text style={[styles.spentText, isOverBudget && styles.overBudgetText]}>
            {isPrivacyMode ? '••••' : `৳ ${totalExpense.toLocaleString('en-US')} `}
            <Text style={styles.pctText}>({rawPercentage.toFixed(0)}%)</Text>
          </Text>
        </View>

        <View style={styles.rightAlign}>
          <Text style={styles.subText}>
            {isOverBudget ? 'Over Budget' : 'Remaining Target'}
          </Text>
          <Text style={[styles.remainingText, isOverBudget && styles.overBudgetText]}>
            {isPrivacyMode
              ? '••••'
              : isOverBudget
              ? `-৳ ${(totalExpense - monthlyBudget).toLocaleString('en-US')}`
              : `৳ ${remaining.toLocaleString('en-US')}`}
          </Text>
        </View>
      </View>

      {/* QUICK BUDGET ADJUSTMENT MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
            style={styles.modalBackdrop}
          />
          <View style={styles.sheetContent}>
            {/* Sheet Handle */}
            <View style={styles.handleBar} />

            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Adjust Monthly Budget</Text>
                <Text style={styles.sheetSubtitle}>
                  Set your maximum target spending capacity for this month
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}>
                <MaterialIcons name="close" size={18} color={C.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            {/* Input Row */}
            <View style={[styles.inputBox, !!errorMsg && styles.inputBoxError]}>
              <Text style={styles.currencyPrefix}>৳</Text>
              <TextInput
                style={styles.inputField}
                keyboardType="numeric"
                value={budgetInput}
                onChangeText={(val) => {
                  setBudgetInput(val);
                  setErrorMsg('');
                }}
                placeholder="50000"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                autoFocus
                selectTextOnFocus
              />
            </View>

            {/* Live Formatted Preview */}
            {!isNaN(parseFloat(budgetInput)) && parseFloat(budgetInput) > 0 && !errorMsg && (
              <Text style={styles.livePreviewText}>
                Preview: ৳ {parseFloat(budgetInput).toLocaleString('en-US')}
              </Text>
            )}

            {!!errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

            {/* Quick Adjust Presets */}
            <View style={styles.presetsRow}>
              <TouchableOpacity
                onPress={() => handleApplyPreset(5000)}
                style={styles.presetChip}>
                <Text style={styles.presetChipText}>+ 5 000</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleApplyPreset(10000)}
                style={styles.presetChip}>
                <Text style={styles.presetChipText}>+ 10 000</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleApplyPreset(-5000)}
                style={styles.presetChip}>
                <Text style={styles.presetChipText}>- 5 000</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleApplyPreset('DEFAULT')}
                style={[styles.presetChip, styles.presetChipDefault]}>
                <Text style={styles.presetChipDefaultText}>50 000 (Std)</Text>
              </TouchableOpacity>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSave}
              style={styles.saveActionBtn}>
              <Text style={styles.saveActionText}>Save New Budget</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#161A1D',
    borderRadius: 20,
    padding: Spacing.four,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleCol: {
    gap: 2,
  },
  sectionLabel: {
    fontFamily: F.sansBold,
    fontSize: 10,
    color: C.onSurfaceVariant,
    letterSpacing: 0.8,
  },
  budgetAmount: {
    fontFamily: F.sansBold,
    fontSize: 22,
    color: C.onSurface,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(200, 241, 53, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(200, 241, 53, 0.25)',
  },
  editBtnText: {
    fontFamily: F.sansBold,
    fontSize: 11,
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statCol: {
    gap: 2,
  },
  subText: {
    fontFamily: F.sansMedium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  spentText: {
    fontFamily: F.sansBold,
    fontSize: 14,
    color: C.onSurface,
  },
  pctText: {
    fontFamily: F.sansMedium,
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  remainingText: {
    fontFamily: F.sansBold,
    fontSize: 14,
    color: '#20C997',
  },
  overBudgetText: {
    color: '#FA5252',
  },
  rightAlign: {
    alignItems: 'flex-end',
    gap: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  sheetContent: {
    backgroundColor: '#1A1E22',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 12,
    gap: 16,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'center',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    fontFamily: F.sansBold,
    fontSize: 17,
    color: C.onSurface,
  },
  sheetSubtitle: {
    fontFamily: F.sans,
    fontSize: 12,
    color: C.onSurfaceVariant,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputBoxError: {
    borderColor: '#FA5252',
  },
  currencyPrefix: {
    fontFamily: F.sansBold,
    fontSize: 22,
    color: '#C8F135',
  },
  inputField: {
    flex: 1,
    fontFamily: F.sansBold,
    fontSize: 22,
    color: '#FFFFFF',
  },
  errorText: {
    fontFamily: F.sansMedium,
    fontSize: 12,
    color: '#FA5252',
    marginTop: -8,
  },
  livePreviewText: {
    fontFamily: F.sansSemiBold,
    fontSize: 12,
    color: '#C8F135',
    marginTop: -8,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  presetChipText: {
    fontFamily: F.sansSemiBold,
    fontSize: 12,
    color: C.onSurface,
  },
  presetChipDefault: {
    backgroundColor: 'rgba(200, 241, 53, 0.08)',
    borderColor: 'rgba(200, 241, 53, 0.2)',
  },
  presetChipDefaultText: {
    fontFamily: F.sansBold,
    fontSize: 12,
    color: '#C8F135',
  },
  saveActionBtn: {
    backgroundColor: '#C8F135',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C8F135',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 4,
  },
  saveActionText: {
    fontFamily: F.sansBold,
    fontSize: 14,
    color: '#101416',
  },
});
