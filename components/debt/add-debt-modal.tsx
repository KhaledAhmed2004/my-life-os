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

import { DEBT_TYPE_METAS } from '@/components/debt/debt-constants';
import { Vital } from '@/constants/vital-theme';
import { useDebtStore } from '@/stores/debt-store';
import { DebtItem, DebtType } from '@/types/debt';

const C = Vital.colors;
const F = Vital.fonts;

interface AddDebtModalProps {
  visible: boolean;
  onClose: () => void;
  debtToEdit?: DebtItem | null;
  defaultType?: DebtType;
}

const DUE_PRESETS = [
  { label: '7 Days', days: 7 },
  { label: '15 Days', days: 15 },
  { label: '1 Month', days: 30 },
  { label: '2 Months', days: 60 },
  { label: 'No Due Date', days: 0 },
];

export function AddDebtModal({
  visible,
  onClose,
  debtToEdit,
  defaultType = 'I_LENT',
}: AddDebtModalProps) {
  const addDebt = useDebtStore((s) => s.addDebt);
  const updateDebt = useDebtStore((s) => s.updateDebt);

  const [type, setType] = useState<DebtType>(defaultType);
  const [personName, setPersonName] = useState('');
  const [phone, setPhone] = useState('');
  const [amountText, setAmountText] = useState('');
  const [dueDays, setDueDays] = useState<number>(30);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (debtToEdit) {
      setType(debtToEdit.type);
      setPersonName(debtToEdit.personName);
      setPhone(debtToEdit.phone || '');
      setAmountText(debtToEdit.amount.toString());
      if (debtToEdit.dueDate) {
        const diffDays = Math.ceil((debtToEdit.dueDate - Date.now()) / (1000 * 60 * 60 * 24));
        setDueDays(Math.max(0, diffDays));
      } else {
        setDueDays(0);
      }
      setNotes(debtToEdit.notes || '');
      setError(null);
    } else {
      setType(defaultType);
      setPersonName('');
      setPhone('');
      setAmountText('');
      setDueDays(30);
      setNotes('');
      setError(null);
    }
  }, [debtToEdit, defaultType, visible]);

  const typeMeta = DEBT_TYPE_METAS[type];

  const handleSave = async () => {
    if (!personName.trim()) {
      setError('Please enter the person or contact name');
      return;
    }
    const amount = parseFloat(amountText.replace(/,/g, ''));
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    const dueDate = dueDays > 0 ? Date.now() + dueDays * 24 * 60 * 60 * 1000 : undefined;

    try {
      if (debtToEdit) {
        await updateDebt(debtToEdit.id, {
          type,
          personName: personName.trim(),
          phone: phone.trim() || undefined,
          amount,
          dueDate,
          notes: notes.trim() || undefined,
        });
      } else {
        await addDebt({
          type,
          personName: personName.trim(),
          phone: phone.trim() || undefined,
          amount,
          startDate: Date.now(),
          dueDate,
          notes: notes.trim() || undefined,
        });
      }
      onClose();
    } catch {
      setError('Failed to save. Please try again.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconSquare, { backgroundColor: typeMeta.bg }]}>
                <MaterialIcons name={typeMeta.icon} size={20} color={typeMeta.color} />
              </View>
              <View>
                <Text style={styles.title}>
                  {debtToEdit ? 'Edit Udhaar / Debt' : 'Record Money Udhaar'}
                </Text>
                <Text style={styles.subtitle}>
                  Track personal loans with friends & family
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.closeButton}>
              <MaterialIcons name="close" size={20} color={C.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}>
            {error && (
              <View style={styles.errorBox}>
                <MaterialIcons name="error-outline" size={16} color="#FF6B6B" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* 1. TYPE SELECTOR: I LENT VS I BORROWED */}
            <View style={styles.typeSwitcher}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  void Haptics.selectionAsync().catch(() => {});
                  setType('I_LENT');
                }}
                style={[
                  styles.typeBtn,
                  type === 'I_LENT' && { backgroundColor: 'rgba(32, 201, 151, 0.2)' },
                ]}>
                <MaterialIcons
                  name="call-made"
                  size={16}
                  color={type === 'I_LENT' ? '#20C997' : C.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.typeBtnText,
                    type === 'I_LENT' && { color: '#20C997', fontFamily: F.bold },
                  ]}>
                  I Lent Money
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  void Haptics.selectionAsync().catch(() => {});
                  setType('I_BORROWED');
                }}
                style={[
                  styles.typeBtn,
                  type === 'I_BORROWED' && { backgroundColor: 'rgba(255, 107, 107, 0.2)' },
                ]}>
                <MaterialIcons
                  name="call-received"
                  size={16}
                  color={type === 'I_BORROWED' ? '#FF6B6B' : C.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.typeBtnText,
                    type === 'I_BORROWED' && { color: '#FF6B6B', fontFamily: F.bold },
                  ]}>
                  I Borrowed
                </Text>
              </TouchableOpacity>
            </View>

            {/* 2. PERSON NAME */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Person Name <Text style={styles.req}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={personName}
                onChangeText={(t) => {
                  setPersonName(t);
                  setError(null);
                }}
                placeholder="e.g. Tanvir, Rafiq Bhai, Cousin Sarah"
                placeholderTextColor="#5C6E79"
              />
            </View>

            {/* 3. PHONE NUMBER */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone / Mobile (Optional)</Text>
              <TextInput
                style={styles.input}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                placeholder="e.g. +880 1711-XXXXXX"
                placeholderTextColor="#5C6E79"
              />
            </View>

            {/* 4. AMOUNT */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Amount (৳) <Text style={styles.req}>*</Text>
              </Text>
              <View style={styles.amountInputRow}>
                <Text style={[styles.amountPrefix, { color: typeMeta.color }]}>৳</Text>
                <TextInput
                  style={styles.amountInput}
                  keyboardType="numeric"
                  value={amountText}
                  onChangeText={(t) => {
                    setAmountText(t.replace(/[^0-9]/g, ''));
                    setError(null);
                  }}
                  placeholder="0"
                  placeholderTextColor="#5C6E79"
                />
              </View>
            </View>

            {/* 5. DUE DATE PRESETS */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Repayment Expected Within</Text>
              <View style={styles.presetsRow}>
                {DUE_PRESETS.map((preset) => (
                  <TouchableOpacity
                    key={preset.label}
                    activeOpacity={0.7}
                    onPress={() => {
                      void Haptics.selectionAsync().catch(() => {});
                      setDueDays(preset.days);
                    }}
                    style={[
                      styles.presetChip,
                      dueDays === preset.days && { backgroundColor: typeMeta.color },
                    ]}>
                    <Text
                      style={[
                        styles.presetChipText,
                        dueDays === preset.days && { color: '#0D1113', fontFamily: F.bold },
                      ]}>
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 6. NOTES */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Reason / Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. Vacation ticket booking advance"
                placeholderTextColor="#5C6E79"
                multiline
                numberOfLines={2}
              />
            </View>
          </ScrollView>

          {/* Footer CTA */}
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSave}
              style={[styles.submitBtn, { backgroundColor: typeMeta.color }]}>
              <MaterialIcons name="check" size={18} color="#0D1113" />
              <Text style={styles.submitBtnText}>
                {debtToEdit ? 'Save Changes' : 'Record Transaction'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#13191C',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconSquare: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: F.bold,
    fontSize: 16,
    color: C.onSurface,
  },
  subtitle: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1B2226',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 14,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
    padding: 10,
    borderRadius: 12,
  },
  errorText: {
    fontFamily: F.medium,
    fontSize: 12,
    color: '#FF6B6B',
    flex: 1,
  },
  typeSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#181F23',
    borderRadius: 14,
    padding: 4,
    gap: 6,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  typeBtnText: {
    fontFamily: F.medium,
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontFamily: F.medium,
    fontSize: 12,
    color: C.onSurface,
  },
  req: {
    color: '#FF6B6B',
  },
  input: {
    backgroundColor: '#181F23',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: F.medium,
    fontSize: 14,
    color: '#FFFFFF',
  },
  textArea: {
    minHeight: 56,
    textAlignVertical: 'top',
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181F23',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  amountPrefix: {
    fontFamily: F.bold,
    fontSize: 18,
  },
  amountInput: {
    flex: 1,
    fontFamily: F.bold,
    fontSize: 16,
    color: '#FFFFFF',
    padding: 0,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetChip: {
    backgroundColor: '#181F23',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  presetChipText: {
    fontFamily: F.medium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#1C2226',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: F.bold,
    fontSize: 13,
    color: C.onSurfaceVariant,
  },
  submitBtn: {
    flex: 2,
    flexDirection: 'row',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  submitBtnText: {
    fontFamily: F.bold,
    fontSize: 13,
    color: '#0D1113',
  },
});
