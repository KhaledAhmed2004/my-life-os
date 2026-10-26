import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
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

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
} from '@/constants/expense-categories';
import { Spacing } from '@/constants/theme';
import { Vital } from '@/constants/vital-theme';
import { useTheme } from '@/hooks/use-theme';
import { useExpenseStore } from '@/stores/expense-store';
import { useSavingsStore } from '@/stores/savings-store';
import { PaymentMethod, Transaction, TransactionType } from '@/types/expense';

const F = Vital.fonts;

interface AddTransactionModalProps {
  visible: boolean;
  initialType?: TransactionType;
  onClose: () => void;
  onSubmit: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  visible,
  initialType = 'EXPENSE',
  onClose,
  onSubmit,
}) => {
  const theme = useTheme();
  const savingsGoals = useSavingsStore((s) => s.goals);
  const deposit = useSavingsStore((s) => s.deposit);

  const monthlyBudget = useExpenseStore((s) => s.monthlyBudget);
  const getTotals = useExpenseStore((s) => s.getTotals);
  const { totalExpense } = getTotals();

  const [type, setType] = useState<TransactionType>(initialType);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(
    initialType === 'EXPENSE' ? EXPENSE_CATEGORIES[0].id : INCOME_CATEGORIES[0].id
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
  const [notes, setNotes] = useState('');
  const [roundUpActive, setRoundUpActive] = useState(false);

  const targetGoal = savingsGoals.find((g) => !g.isCompleted) || savingsGoals[0];
  const numAmount = parseFloat(amount) || 0;
  const roundedTarget = numAmount > 0 ? Math.ceil(numAmount / 50) * 50 : 0;
  const spareChange = roundedTarget > numAmount ? roundedTarget - numAmount : (numAmount > 0 ? (Math.ceil(numAmount / 100) * 100 - numAmount) : 0);

  const remainingAfterExpense = monthlyBudget - totalExpense - numAmount;

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategoryId(newType === 'EXPENSE' ? EXPENSE_CATEGORIES[0].id : INCOME_CATEGORIES[0].id);
  };

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    onSubmit({
      title: title.trim(),
      amount: parsedAmount,
      type,
      categoryId,
      date: new Date().toISOString().split('T')[0],
      paymentMethod,
      notes: notes.trim() || undefined,
    });

    if (type === 'EXPENSE' && roundUpActive && spareChange > 0 && targetGoal) {
      void deposit(targetGoal.id, spareChange, `Spare change from "${title.trim()}"`);
    }

    setTitle('');
    setAmount('');
    setNotes('');
    setRoundUpActive(false);
    onClose();
  };

  const categories = type === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}>
        <ThemedView type="background" style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="subtitle" style={styles.headerTitle}>
              Add Transaction
            </ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <ThemedText style={styles.closeIcon}>✕</ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Type Toggle */}
            <View style={styles.typeToggle}>
              <TouchableOpacity
                style={[styles.typeBtn, type === 'EXPENSE' && styles.expenseActiveBtn]}
                onPress={() => handleTypeChange('EXPENSE')}>
                <ThemedText
                  style={[styles.typeBtnText, type === 'EXPENSE' && styles.activeBtnText]}>
                  Expense
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, type === 'INCOME' && styles.incomeActiveBtn]}
                onPress={() => handleTypeChange('INCOME')}>
                <ThemedText
                  style={[styles.typeBtnText, type === 'INCOME' && styles.activeBtnText]}>
                  Income
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <View style={styles.inputGroup}>
              <View style={styles.amountLabelRow}>
                <ThemedText themeColor="textSecondary" type="smallBold">
                  AMOUNT (৳)
                </ThemedText>
                {type === 'EXPENSE' && numAmount > 0 && (
                  <Text
                    style={[
                      styles.budgetImpactText,
                      remainingAfterExpense < 0 && styles.budgetImpactNegative,
                    ]}>
                    {remainingAfterExpense >= 0
                      ? `Budget left: ৳ ${remainingAfterExpense.toLocaleString('en-US')}`
                      : `Exceeds budget by ৳ ${Math.abs(remainingAfterExpense).toLocaleString('en-US')} ⚠️`}
                  </Text>
                )}
              </View>
              <View style={[styles.amountInputWrap, { borderColor: theme.backgroundElement }]}>
                <ThemedText style={styles.currencySymbol}>৳</ThemedText>
                <TextInput
                  style={[styles.amountInput, { color: theme.text }]}
                  placeholder="0.00"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                  autoFocus
                />
              </View>

              {/* 1-TAP ROUND-UP MICRO SAVINGS CHIP */}
              {type === 'EXPENSE' && spareChange > 0 && targetGoal && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setRoundUpActive(!roundUpActive);
                  }}
                  style={[styles.roundUpChip, roundUpActive && styles.roundUpChipActive]}>
                  <Text style={styles.roundUpEmoji}>🪙</Text>
                  <Text
                    style={[styles.roundUpText, roundUpActive && styles.roundUpTextActive]}>
                    Round up to {numAmount + spareChange} (+{spareChange} to {targetGoal.icon}{' '}
                    {targetGoal.name})
                  </Text>
                  <MaterialIcons
                    name={roundUpActive ? 'check-circle' : 'add-circle-outline'}
                    size={16}
                    color={roundUpActive ? '#C8F135' : '#9BA1A6'}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Title / Description */}
            <View style={styles.inputGroup}>
              <ThemedText themeColor="textSecondary" type="smallBold">
                DESCRIPTION / TITLE
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: theme.backgroundElement, color: theme.text },
                ]}
                placeholder="e.g. Whey Protein, Gym membership, Client fee"
                placeholderTextColor={theme.textSecondary}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Category Selector */}
            <View style={styles.inputGroup}>
              <ThemedText themeColor="textSecondary" type="smallBold">
                CATEGORY
              </ThemedText>
              <View style={styles.categoriesGrid}>
                {categories.map((cat) => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: isSelected ? cat.color : theme.backgroundElement,
                        },
                      ]}
                      onPress={() => setCategoryId(cat.id)}>
                      <ThemedText style={styles.categoryChipEmoji}>{cat.icon}</ThemedText>
                      <ThemedText
                        style={[
                          styles.categoryChipText,
                          isSelected && { color: '#FFFFFF', fontWeight: '700' },
                        ]}>
                        {cat.name}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Payment Method */}
            <View style={styles.inputGroup}>
              <ThemedText themeColor="textSecondary" type="smallBold">
                PAYMENT METHOD
              </ThemedText>
              <View style={styles.paymentMethodsRow}>
                {PAYMENT_METHODS.map((pm) => {
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <TouchableOpacity
                      key={pm.id}
                      style={[
                        styles.paymentChip,
                        isSelected
                          ? { backgroundColor: theme.text }
                          : { backgroundColor: theme.backgroundElement },
                      ]}
                      onPress={() => setPaymentMethod(pm.id)}>
                      <ThemedText
                        style={[
                          styles.paymentChipText,
                          isSelected && { color: theme.background, fontWeight: '700' },
                        ]}>
                        {pm.icon} {pm.label}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.submitBtn,
                type === 'EXPENSE' ? styles.expenseSubmit : styles.incomeSubmit,
              ]}
              onPress={handleSubmit}>
              <ThemedText style={styles.submitBtnText}>
                Save {type === 'EXPENSE' ? 'Expense' : 'Income'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  closeIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#868E96',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(128, 128, 128, 0.12)',
    borderRadius: 14,
    padding: 4,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  expenseActiveBtn: {
    backgroundColor: '#FA5252',
  },
  incomeActiveBtn: {
    backgroundColor: '#2B8A3E',
  },
  typeBtnText: {
    fontWeight: '600',
    fontSize: 14,
  },
  activeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  inputGroup: {
    gap: Spacing.one,
  },
  amountInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: 4,
  },
  roundUpChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  amountLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  budgetImpactText: {
    fontFamily: F.sansBold,
    fontSize: 10,
    color: '#20C997',
  },
  budgetImpactNegative: {
    color: '#FA5252',
  },
  roundUpChipActive: {
    backgroundColor: 'rgba(200, 241, 53, 0.15)',
    borderColor: '#C8F135',
  },
  roundUpEmoji: {
    fontSize: 14,
  },
  roundUpText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#868E96',
  },
  roundUpTextActive: {
    color: '#C8F135',
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '800',
    color: '#868E96',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '800',
    paddingVertical: 6,
  },
  textInput: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 15,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  categoryChipEmoji: {
    fontSize: 14,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  paymentMethodsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paymentChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  paymentChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseSubmit: {
    backgroundColor: '#FA5252',
  },
  incomeSubmit: {
    backgroundColor: '#2B8A3E',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
