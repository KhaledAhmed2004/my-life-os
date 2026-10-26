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

import { Vital } from '@/constants/vital-theme';
import { useWarrantyStore } from '@/stores/warranty-store';
import { WarrantyCategory, WarrantyItem, WarrantyType } from '@/types/warranty';
import {
  WARRANTY_CATEGORY_CONFIG,
  WARRANTY_TYPE_LABELS,
} from './warranty-constants';

const C = Vital.colors;
const F = Vital.fonts;

interface AddWarrantyModalProps {
  visible: boolean;
  onClose: () => void;
  editItem?: WarrantyItem | null;
}

const DURATION_PRESETS: { label: string; months: number }[] = [
  { label: '6 Mos', months: 6 },
  { label: '1 Year', months: 12 },
  { label: '2 Years', months: 24 },
  { label: '3 Years', months: 36 },
  { label: '5 Years', months: 60 },
  { label: '10 Years', months: 120 },
  { label: 'Lifetime', months: 600 },
];

const CATEGORIES: WarrantyCategory[] = [
  'ELECTRONICS',
  'APPLIANCES',
  'GADGETS',
  'VEHICLES',
  'FURNITURE',
  'OTHER',
];

const WARRANTY_TYPES: WarrantyType[] = [
  'MANUFACTURER',
  'EXTENDED',
  'STORE_WARRANTY',
  'LIFETIME',
];

export function AddWarrantyModal({
  visible,
  onClose,
  editItem,
}: AddWarrantyModalProps) {
  const addItem = useWarrantyStore((s) => s.addItem);
  const updateItem = useWarrantyStore((s) => s.updateItem);

  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [category, setCategory] = useState<WarrantyCategory>('ELECTRONICS');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [storeName, setStoreName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [durationMonths, setDurationMonths] = useState<number>(12);
  const [warrantyType, setWarrantyType] = useState<WarrantyType>('MANUFACTURER');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const getTodayString = () => new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (editItem) {
      setProductName(editItem.productName);
      setBrand(editItem.brand);
      setModelNumber(editItem.modelNumber || '');
      setSerialNumber(editItem.serialNumber || '');
      setCategory(editItem.category);
      setPurchasePrice(editItem.purchasePrice ? String(editItem.purchasePrice) : '');
      setStoreName(editItem.storeName || '');
      setPurchaseDate(editItem.purchaseDate);
      setDurationMonths(editItem.warrantyDurationMonths || 12);
      setWarrantyType(editItem.warrantyType);
      setNotes(editItem.notes || '');
    } else {
      setProductName('');
      setBrand('');
      setModelNumber('');
      setSerialNumber('');
      setCategory('ELECTRONICS');
      setPurchasePrice('');
      setStoreName('');
      setPurchaseDate(getTodayString());
      setDurationMonths(12);
      setWarrantyType('MANUFACTURER');
      setNotes('');
    }
    setErrorMsg('');
  }, [editItem, visible]);

  const calculateEndDate = (startDateStr: string, months: number): string => {
    try {
      const parts = startDateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        d.setMonth(d.getMonth() + months);
        return d.toISOString().split('T')[0];
      }
    } catch {
      // fallback
    }
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0];
  };

  const handleSave = async () => {
    if (!productName.trim()) {
      setErrorMsg('Please enter a product name');
      return;
    }
    if (!brand.trim()) {
      setErrorMsg('Please enter the manufacturer or brand');
      return;
    }

    const priceNum = parseFloat(purchasePrice) || 0;
    const pDate = purchaseDate.trim() || getTodayString();
    const endDate = calculateEndDate(pDate, durationMonths);

    if (editItem) {
      await updateItem(editItem.id, {
        productName: productName.trim(),
        brand: brand.trim(),
        modelNumber: modelNumber.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
        category,
        purchasePrice: priceNum,
        storeName: storeName.trim() || undefined,
        purchaseDate: pDate,
        warrantyStartDate: pDate,
        warrantyDurationMonths: durationMonths,
        warrantyEndDate: endDate,
        warrantyType,
        notes: notes.trim() || undefined,
      });
    } else {
      await addItem({
        productName: productName.trim(),
        brand: brand.trim(),
        modelNumber: modelNumber.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
        category,
        purchasePrice: priceNum,
        storeName: storeName.trim() || undefined,
        purchaseDate: pDate,
        warrantyStartDate: pDate,
        warrantyDurationMonths: durationMonths,
        warrantyEndDate: endDate,
        warrantyType,
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerTitleGroup}>
              <MaterialIcons name="verified-user" size={18} color="#FF922B" />
              <Text style={styles.headerTitle}>
                {editItem ? 'Edit Warranty Item' : 'Add New Warranty Item'}
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={20} color={C.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}>
            {errorMsg ? (
              <View style={styles.errorBox}>
                <MaterialIcons name="error-outline" size={14} color="#FA5252" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* PRODUCT NAME & BRAND */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Product Name *</Text>
              <TextInput
                value={productName}
                onChangeText={(t) => {
                  setProductName(t);
                  setErrorMsg('');
                }}
                placeholder="e.g. iPhone 15 Pro, Smart TV, Oven"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={styles.textInput}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Brand / Maker *</Text>
                <TextInput
                  value={brand}
                  onChangeText={(t) => {
                    setBrand(t);
                    setErrorMsg('');
                  }}
                  placeholder="e.g. Apple, Sony, LG"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  style={styles.textInput}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Model Number</Text>
                <TextInput
                  value={modelNumber}
                  onChangeText={setModelNumber}
                  placeholder="e.g. A2991 / 65C3"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  style={styles.textInput}
                />
              </View>
            </View>

            {/* SERIAL NUMBER */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Serial Number / IMEI</Text>
              <TextInput
                value={serialNumber}
                onChangeText={setSerialNumber}
                placeholder="e.g. C02G80X0MD6R"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={styles.textInput}
                autoCapitalize="characters"
              />
            </View>

            {/* CATEGORY PICKER */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  const cfg = WARRANTY_CATEGORY_CONFIG[cat];
                  return (
                    <TouchableOpacity
                      key={cat}
                      activeOpacity={0.8}
                      onPress={() => {
                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        setCategory(cat);
                      }}
                      style={[
                        styles.catOption,
                        isSelected && { borderColor: cfg.color, backgroundColor: cfg.bgColor },
                      ]}>
                      <MaterialIcons
                        name={cfg.icon}
                        size={15}
                        color={isSelected ? cfg.color : C.onSurfaceVariant}
                      />
                      <Text
                        style={[
                          styles.catOptionText,
                          isSelected && { color: cfg.color, fontFamily: F.sansBold },
                        ]}>
                        {cfg.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* PURCHASE PRICE & STORE */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Purchase Price (৳)</Text>
                <TextInput
                  value={purchasePrice}
                  onChangeText={setPurchasePrice}
                  placeholder="e.g. 85000"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="numeric"
                  style={styles.textInput}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Store / Dealer</Text>
                <TextInput
                  value={storeName}
                  onChangeText={setStoreName}
                  placeholder="e.g. Apple Store, Amazon"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  style={styles.textInput}
                />
              </View>
            </View>

            {/* PURCHASE DATE */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Purchase Date (YYYY-MM-DD)</Text>
              <TextInput
                value={purchaseDate}
                onChangeText={setPurchaseDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={styles.textInput}
              />
            </View>

            {/* WARRANTY DURATION PRESETS */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Warranty Coverage Duration</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.durationPresetsRow}>
                {DURATION_PRESETS.map((preset) => {
                  const isSelected = durationMonths === preset.months;
                  return (
                    <TouchableOpacity
                      key={preset.months}
                      activeOpacity={0.8}
                      onPress={() => {
                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        setDurationMonths(preset.months);
                      }}
                      style={[
                        styles.durationChip,
                        isSelected && styles.durationChipSelected,
                      ]}>
                      <Text
                        style={[
                          styles.durationChipText,
                          isSelected && styles.durationChipTextSelected,
                        ]}>
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* WARRANTY TYPE */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Warranty Type</Text>
              <View style={styles.typeRow}>
                {WARRANTY_TYPES.map((type) => {
                  const isSelected = warrantyType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      activeOpacity={0.8}
                      onPress={() => {
                        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        setWarrantyType(type);
                      }}
                      style={[
                        styles.typeChip,
                        isSelected && styles.typeChipSelected,
                      ]}>
                      <Text
                        style={[
                          styles.typeChipText,
                          isSelected && styles.typeChipTextSelected,
                        ]}
                        numberOfLines={1}>
                        {WARRANTY_TYPE_LABELS[type].split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* NOTES */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes / Terms</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Include accidental damage notes, receipt numbers..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                multiline
                numberOfLines={3}
                style={[styles.textInput, styles.textArea]}
              />
            </View>
          </ScrollView>

          {/* ACTION BUTTONS */}
          <View style={styles.footerActions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSave}
              style={styles.saveBtn}>
              <MaterialIcons name="check" size={16} color="#101416" />
              <Text style={styles.saveBtnText}>
                {editItem ? 'Save Changes' : 'Add to Wallet'}
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
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: F.sansBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    padding: 16,
    gap: 14,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(250, 82, 82, 0.12)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(250, 82, 82, 0.25)',
  },
  errorText: {
    fontFamily: F.sansMedium,
    fontSize: 12,
    color: '#FA5252',
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontFamily: F.sansMedium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  textInput: {
    backgroundColor: '#1A2125',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: F.sans,
    fontSize: 13,
    color: '#FFFFFF',
  },
  textArea: {
    minHeight: 65,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  catOptionText: {
    fontFamily: F.sansMedium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  durationPresetsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  durationChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 9,
  },
  durationChipSelected: {
    backgroundColor: '#FF922B',
  },
  durationChipText: {
    fontFamily: F.sansMedium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  durationChipTextSelected: {
    fontFamily: F.sansBold,
    color: '#101416',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  typeChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingVertical: 8,
    borderRadius: 9,
  },
  typeChipSelected: {
    backgroundColor: 'rgba(255, 146, 43, 0.18)',
  },
  typeChipText: {
    fontFamily: F.sansMedium,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  typeChipTextSelected: {
    fontFamily: F.sansBold,
    color: '#FF922B',
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  cancelBtnText: {
    fontFamily: F.sansMedium,
    fontSize: 13,
    color: C.onSurfaceVariant,
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FF922B',
    shadowColor: '#FF922B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  saveBtnText: {
    fontFamily: F.sansBold,
    fontSize: 13,
    color: '#101416',
  },
});
