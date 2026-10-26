import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useState } from 'react';
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

import { LOAN_CATEGORIES } from '@/components/loan/loan-constants';
import { Vital } from '@/constants/vital-theme';
import { calculateEMI, useLoanStore } from '@/stores/loan-store';
import { LoanCategory, LoanItem } from '@/types/loan';

const C = Vital.colors;
const F = Vital.fonts;

interface AddLoanModalProps {
  visible: boolean;
  onClose: () => void;
  loanToEdit?: LoanItem | null;
  initialValues?: {
    principal?: number;
    interestRate?: number;
    tenureMonths?: number;
  };
}

const CATEGORY_KEYS: LoanCategory[] = [
  'HOME_LOAN',
  'CAR_LOAN',
  'PERSONAL_LOAN',
  'CREDIT_CARD_EMI',
  'DEVICE_FINANCING',
  'EDUCATION_LOAN',
  'BUSINESS_LOAN',
  'OTHER',
];

const TENURE_PRESETS = [6, 12, 24, 36, 48, 60, 120, 240];

export function AddLoanModal({
  visible,
  onClose,
  loanToEdit,
  initialValues,
}: AddLoanModalProps) {
  const addLoan = useLoanStore((s) => s.addLoan);
  const updateLoan = useLoanStore((s) => s.updateLoan);

  const [name, setName] = useState('');
  const [lender, setLender] = useState('');
  const [category, setCategory] = useState<LoanCategory>('CAR_LOAN');
  const [principalText, setPrincipalText] = useState('500000');
  const [rateText, setRateText] = useState('9.5');
  const [tenureMonths, setTenureMonths] = useState(36);
  const [paymentsMadeText, setPaymentsMadeText] = useState('0');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loanToEdit) {
      setName(loanToEdit.name);
      setLender(loanToEdit.lender);
      setCategory(loanToEdit.category);
      setPrincipalText(loanToEdit.principalAmount.toString());
      setRateText(loanToEdit.interestRate.toString());
      setTenureMonths(loanToEdit.tenureMonths);
      setPaymentsMadeText(loanToEdit.paymentsMade.toString());
      setNotes(loanToEdit.notes || '');
      setError(null);
    } else {
      setName('');
      setLender('');
      setCategory('CAR_LOAN');
      setPrincipalText(initialValues?.principal ? initialValues.principal.toString() : '500000');
      setRateText(initialValues?.interestRate !== undefined ? initialValues.interestRate.toString() : '9.5');
      setTenureMonths(initialValues?.tenureMonths || 36);
      setPaymentsMadeText('0');
      setNotes('');
      setError(null);
    }
  }, [loanToEdit, initialValues, visible]);

  const principal = useMemo(() => {
    const val = parseFloat(principalText.replace(/,/g, ''));
    return isNaN(val) ? 0 : Math.max(0, val);
  }, [principalText]);

  const interestRate = useMemo(() => {
    const val = parseFloat(rateText);
    return isNaN(val) ? 0 : Math.max(0, val);
  }, [rateText]);

  const paymentsMade = useMemo(() => {
    const val = parseInt(paymentsMadeText, 10);
    return isNaN(val) ? 0 : Math.max(0, val);
  }, [paymentsMadeText]);

  const calculation = useMemo(() => {
    return calculateEMI(principal, interestRate, tenureMonths);
  }, [principal, interestRate, tenureMonths]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a loan or asset name');
      return;
    }
    if (!lender.trim()) {
      setError('Please specify the lender, bank or finance institution');
      return;
    }
    if (principal <= 0) {
      setError('Principal loan amount must be greater than 0');
      return;
    }
    if (tenureMonths <= 0) {
      setError('Tenure duration must be at least 1 month');
      return;
    }

    try {
      if (loanToEdit) {
        await updateLoan(loanToEdit.id, {
          name: name.trim(),
          lender: lender.trim(),
          category,
          principalAmount: principal,
          interestRate,
          tenureMonths,
          paymentsMade,
          notes: notes.trim() || undefined,
        });
      } else {
        await addLoan({
          name: name.trim(),
          lender: lender.trim(),
          category,
          principalAmount: principal,
          interestRate,
          tenureMonths,
          paymentsMade,
          notes: notes.trim() || undefined,
        });
      }
      onClose();
    } catch {
      setError('Failed to save loan. Please check your inputs.');
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
              <View style={styles.iconSquare}>
                <MaterialIcons
                  name={loanToEdit ? 'edit' : 'account-balance'}
                  size={20}
                  color="#38BDF8"
                />
              </View>
              <View>
                <Text style={styles.title}>
                  {loanToEdit ? 'Edit Loan Account' : 'Add Active Loan / EMI'}
                </Text>
                <Text style={styles.subtitle}>
                  Track your monthly obligations & amortization
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

            {/* LIVE EMI PREVIEW BANNER */}
            <View style={styles.livePreviewCard}>
              <View style={styles.previewTop}>
                <Text style={styles.previewLabel}>PROJECTED MONTHLY EMI</Text>
                <Text style={styles.previewEmiAmount}>
                  ৳{Math.round(calculation.monthlyEmi).toLocaleString()}
                </Text>
              </View>
              <View style={styles.previewBreakdownRow}>
                <Text style={styles.previewBreakdownText}>
                  Total Interest: ৳{Math.round(calculation.totalInterest).toLocaleString()}
                </Text>
                <Text style={styles.previewBreakdownText}>
                  Total Payable: ৳{Math.round(calculation.totalPayment).toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Loan Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Loan / Asset Name <Text style={styles.req}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  setError(null);
                }}
                placeholder="e.g. Home Mortgage / Car Loan / MacBook EMI"
                placeholderTextColor="#5C6E79"
              />
            </View>

            {/* Lender / Bank */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Lender / Bank / Source <Text style={styles.req}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={lender}
                onChangeText={(t) => {
                  setLender(t);
                  setError(null);
                }}
                placeholder="e.g. City Bank, BRAC Bank, SCB 0% EMI"
                placeholderTextColor="#5C6E79"
              />
            </View>

            {/* Category Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Loan Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                <View style={styles.categoryRow}>
                  {CATEGORY_KEYS.map((catKey) => {
                    const meta = LOAN_CATEGORIES[catKey];
                    const isSelected = category === catKey;
                    return (
                      <TouchableOpacity
                        key={catKey}
                        activeOpacity={0.8}
                        onPress={() => {
                          void Haptics.selectionAsync().catch(() => {});
                          setCategory(catKey);
                        }}
                        style={[
                          styles.catPill,
                          isSelected && { backgroundColor: meta.color + '26' },
                        ]}>
                        <MaterialIcons
                          name={meta.icon}
                          size={14}
                          color={isSelected ? meta.color : C.onSurfaceVariant}
                        />
                        <Text
                          style={[
                            styles.catPillText,
                            isSelected && { color: meta.color, fontFamily: F.bold },
                          ]}>
                          {meta.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            {/* Principal & Interest */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>
                  Principal Amount (৳) <Text style={styles.req}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={principalText}
                  onChangeText={(t) => setPrincipalText(t.replace(/[^0-9]/g, ''))}
                  placeholder="0"
                  placeholderTextColor="#5C6E79"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Interest Rate (% p.a.)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  value={rateText}
                  onChangeText={setRateText}
                  placeholder="0.0"
                  placeholderTextColor="#5C6E79"
                />
              </View>
            </View>

            {/* Tenure Months */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tenure (Total Months)</Text>
              <View style={styles.tenurePresetsRow}>
                {TENURE_PRESETS.map((m) => (
                  <TouchableOpacity
                    key={m}
                    activeOpacity={0.7}
                    onPress={() => {
                      void Haptics.selectionAsync().catch(() => {});
                      setTenureMonths(m);
                    }}
                    style={[
                      styles.tenureChip,
                      tenureMonths === m && styles.tenureChipActive,
                    ]}>
                    <Text
                      style={[
                        styles.tenureChipText,
                        tenureMonths === m && styles.tenureChipTextActive,
                      ]}>
                      {m >= 12 ? `${m / 12}Y (${m}m)` : `${m}m`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Payments Already Made */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Installments Already Paid (Count)</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={paymentsMadeText}
                onChangeText={(t) => setPaymentsMadeText(t.replace(/[^0-9]/g, ''))}
                placeholder="0"
                placeholderTextColor="#5C6E79"
              />
              <Text style={styles.helperText}>
                If this is an ongoing loan, specify how many monthly EMIs you have already paid.
              </Text>
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. Auto-debit from salary account on 10th"
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
              style={styles.submitBtn}>
              <MaterialIcons name="check" size={18} color="#0D1113" />
              <Text style={styles.submitBtnText}>
                {loanToEdit ? 'Save Changes' : 'Add Loan'}
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
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
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
  livePreviewCard: {
    backgroundColor: '#192227',
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  previewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewLabel: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#38BDF8',
    letterSpacing: 0.6,
  },
  previewEmiAmount: {
    fontFamily: F.bold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  previewBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewBreakdownText: {
    fontFamily: F.regular,
    fontSize: 11,
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
    minHeight: 60,
    textAlignVertical: 'top',
  },
  helperText: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#181F23',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  catPillText: {
    fontFamily: F.medium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  tenurePresetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tenureChip: {
    backgroundColor: '#181F23',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  tenureChipActive: {
    backgroundColor: '#38BDF8',
  },
  tenureChipText: {
    fontFamily: F.medium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  tenureChipTextActive: {
    fontFamily: F.bold,
    color: '#0D1113',
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
    backgroundColor: '#38BDF8',
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
