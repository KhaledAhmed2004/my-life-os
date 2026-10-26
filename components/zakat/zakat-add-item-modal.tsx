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

import {
  GRAMS_PER_BHORI,
  ZAKAT_CATEGORIES_META,
  ZAKAT_COLORS,
} from '@/components/zakat/zakat-constants';
import { Vital } from '@/constants/vital-theme';
import { useZakatStore } from '@/stores/zakat-store';
import {
  ZakatAssetCategory,
  ZakatDeductionCategory,
  ZakatManualItem,
} from '@/types/zakat';

const C = Vital.colors;
const F = Vital.fonts;

const ASSET_CATEGORIES: ZakatAssetCategory[] = [
  'GOLD_JEWELRY',
  'SILVER',
  'CASH',
  'INVESTMENTS_STOCKS',
  'BUSINESS_GOODS',
  'OTHER_ASSET',
];

const DEDUCTION_CATEGORIES: ZakatDeductionCategory[] = [
  'IMMEDIATE_EXPENSES',
  'MONEY_BORROWED',
  'OTHER_DEDUCTION',
];

interface ZakatAddItemModalProps {
  visible: boolean;
  isDeductionInitial: boolean;
  itemToEdit?: ZakatManualItem | null;
  onClose: () => void;
}

export function ZakatAddItemModal({
  visible,
  isDeductionInitial,
  itemToEdit,
  onClose,
}: ZakatAddItemModalProps) {
  const { goldPricePerGram, silverPricePerGram, addManualItem, updateManualItem } =
    useZakatStore();

  const [isDeduction, setIsDeduction] = useState(isDeductionInitial);
  const [selectedCategory, setSelectedCategory] = useState<
    ZakatAssetCategory | ZakatDeductionCategory
  >('GOLD_JEWELRY');
  const [name, setName] = useState('');
  const [amountText, setAmountText] = useState('');
  const [weightText, setWeightText] = useState('');
  const [weightUnit, setWeightUnit] = useState<'GRAM' | 'BHORI'>('GRAM');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (visible) {
      if (itemToEdit) {
        setIsDeduction(itemToEdit.isDeduction);
        setSelectedCategory(itemToEdit.category);
        setName(itemToEdit.name);
        setAmountText(itemToEdit.amount.toString());
        setWeightText(itemToEdit.weightGrams ? itemToEdit.weightGrams.toString() : '');
        setNote(itemToEdit.note || '');
      } else {
        setIsDeduction(isDeductionInitial);
        setSelectedCategory(isDeductionInitial ? 'IMMEDIATE_EXPENSES' : 'GOLD_JEWELRY');
        setName('');
        setAmountText('');
        setWeightText('');
        setNote('');
      }
    }
  }, [visible, isDeductionInitial, itemToEdit]);

  const isMetalCategory =
    selectedCategory === 'GOLD_JEWELRY' || selectedCategory === 'SILVER';

  const handleWeightChange = (t: string) => {
    const val = t.replace(/[^0-9.]/g, '');
    setWeightText(val);

    const numWeight = parseFloat(val);
    if (!isNaN(numWeight) && numWeight > 0) {
      const grams = weightUnit === 'GRAM' ? numWeight : numWeight * GRAMS_PER_BHORI;
      const rate =
        selectedCategory === 'GOLD_JEWELRY' ? goldPricePerGram : silverPricePerGram;
      const autoAmount = Math.round(grams * rate);
      setAmountText(autoAmount.toString());
    }
  };

  const handleSave = async () => {
    const amountVal = parseFloat(amountText.replace(/[^0-9.]/g, '')) || 0;
    if (amountVal <= 0) return;

    const trimmedName =
      name.trim() ||
      ZAKAT_CATEGORIES_META[selectedCategory]?.label ||
      'Custom Item';

    const weightVal = parseFloat(weightText.replace(/[^0-9.]/g, ''));
    const finalGrams =
      !isNaN(weightVal) && weightVal > 0
        ? weightUnit === 'GRAM'
          ? weightVal
          : Math.round(weightVal * GRAMS_PER_BHORI * 100) / 100
        : undefined;

    if (itemToEdit) {
      await updateManualItem(itemToEdit.id, {
        name: trimmedName,
        category: selectedCategory,
        amount: amountVal,
        isDeduction,
        weightGrams: finalGrams,
        note: note.trim() || undefined,
      });
    } else {
      await addManualItem({
        name: trimmedName,
        category: selectedCategory,
        amount: amountVal,
        isDeduction,
        isEnabled: true,
        weightGrams: finalGrams,
        note: note.trim() || undefined,
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                {itemToEdit ? 'Edit Item' : isDeduction ? 'Add Deduction' : 'Add Zakatable Asset'}
              </Text>
              <Text style={styles.subtitle}>
                {isDeduction
                  ? 'Immediate debts & urgent liabilities'
                  : 'Gold, silver, savings, stocks, and business goods'}
              </Text>
            </View>

            <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={20} color={C.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}>
            {/* Category Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoriesGrid}>
                {(isDeduction ? DEDUCTION_CATEGORIES : ASSET_CATEGORIES).map((cat) => {
                  const meta = ZAKAT_CATEGORIES_META[cat];
                  const isSel = selectedCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      activeOpacity={0.8}
                      onPress={() => {
                        void Haptics.selectionAsync().catch(() => {});
                        setSelectedCategory(cat);
                      }}
                      style={[
                        styles.categoryTile,
                        isSel && styles.categoryTileActive,
                      ]}>
                      <MaterialIcons
                        name={meta.icon as any}
                        size={18}
                        color={isSel ? '#0D1113' : meta.color}
                      />
                      <Text
                        style={[
                          styles.categoryTileText,
                          isSel && styles.categoryTileTextActive,
                        ]}>
                        {meta.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* If Gold or Silver: Weight in Grams / Bhori */}
            {isMetalCategory && (
              <View style={styles.inputGroup}>
                <View style={styles.weightLabelRow}>
                  <Text style={styles.label}>
                    {selectedCategory === 'GOLD_JEWELRY' ? 'Gold' : 'Silver'} Weight
                  </Text>

                  <View style={styles.unitToggleSmall}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setWeightUnit('GRAM')}
                      style={[
                        styles.unitBtnSmall,
                        weightUnit === 'GRAM' && styles.unitBtnSmallActive,
                      ]}>
                      <Text
                        style={[
                          styles.unitBtnSmallText,
                          weightUnit === 'GRAM' && styles.unitBtnSmallTextActive,
                        ]}>
                        Gram
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setWeightUnit('BHORI')}
                      style={[
                        styles.unitBtnSmall,
                        weightUnit === 'BHORI' && styles.unitBtnSmallActive,
                      ]}>
                      <Text
                        style={[
                          styles.unitBtnSmallText,
                          weightUnit === 'BHORI' && styles.unitBtnSmallTextActive,
                        ]}>
                        Bhori (11.66g)
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  value={weightText}
                  onChangeText={handleWeightChange}
                  placeholder={`e.g. 11.66`}
                  placeholderTextColor="#5C6E79"
                />
              </View>
            )}

            {/* Title / Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Item Name (Optional)</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder={ZAKAT_CATEGORIES_META[selectedCategory]?.label || 'e.g. Gold Necklace'}
                placeholderTextColor="#5C6E79"
              />
            </View>

            {/* Total Valuation Amount */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Total Zakatable Value (BDT)</Text>
              <View style={styles.amountInputBox}>
                <Text style={styles.takaSign}>৳</Text>
                <TextInput
                  style={styles.amountInput}
                  keyboardType="number-pad"
                  value={amountText}
                  onChangeText={(t) => setAmountText(t.replace(/[^0-9]/g, ''))}
                  placeholder="0"
                  placeholderTextColor="#5C6E79"
                />
              </View>
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={note}
                onChangeText={setNote}
                placeholder="Add purchase date or purity details..."
                placeholderTextColor="#5C6E79"
                multiline
                numberOfLines={2}
              />
            </View>
          </ScrollView>

          {/* Footer CTA */}
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => void handleSave()}
              style={[
                styles.saveBtn,
                isDeduction ? styles.saveBtnCoral : styles.saveBtnGold,
              ]}>
              <Text style={styles.saveBtnText}>
                {itemToEdit ? 'Save Changes' : isDeduction ? 'Add Deduction' : 'Add to Zakatable Wealth'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#13191C',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
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
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1B2226',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontFamily: F.bold,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ZAKAT_COLORS.tileBg,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 6,
  },
  categoryTileActive: {
    backgroundColor: ZAKAT_COLORS.gold,
  },
  categoryTileText: {
    fontFamily: F.medium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  categoryTileTextActive: {
    fontFamily: F.bold,
    color: '#0D1113',
  },
  weightLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitToggleSmall: {
    flexDirection: 'row',
    backgroundColor: ZAKAT_COLORS.tileBg,
    borderRadius: 6,
    padding: 2,
  },
  unitBtnSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  unitBtnSmallActive: {
    backgroundColor: ZAKAT_COLORS.gold,
  },
  unitBtnSmallText: {
    fontFamily: F.medium,
    fontSize: 9,
    color: C.onSurfaceVariant,
  },
  unitBtnSmallTextActive: {
    fontFamily: F.bold,
    color: '#0D1113',
  },
  input: {
    backgroundColor: ZAKAT_COLORS.tileBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: F.medium,
    fontSize: 14,
    color: '#FFFFFF',
  },
  amountInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ZAKAT_COLORS.tileBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  takaSign: {
    fontFamily: F.bold,
    fontSize: 18,
    color: ZAKAT_COLORS.gold,
  },
  amountInput: {
    flex: 1,
    fontFamily: F.bold,
    fontSize: 18,
    color: '#FFFFFF',
    padding: 0,
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  saveBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
  },
  saveBtnGold: {
    backgroundColor: ZAKAT_COLORS.gold,
  },
  saveBtnCoral: {
    backgroundColor: ZAKAT_COLORS.coral,
  },
  saveBtnText: {
    fontFamily: F.bold,
    fontSize: 14,
    color: '#0D1113',
  },
});
