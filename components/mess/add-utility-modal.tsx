import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { UTILITY_PRESETS } from '@/components/mess/mess-constants';
import { useMessStore } from '@/stores/mess-store';
import { Vital } from '@/constants/vital-theme';
import { MessUtilityCategory } from '@/types/mess';

const C = Vital.colors;
const F = Vital.fonts;

interface AddUtilityModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddUtilityModal({ visible, onClose }: AddUtilityModalProps) {
  const addUtilityBill = useMessStore((s) => s.addUtilityBill);

  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState<MessUtilityCategory>('RENT');

  const handleSelectPreset = (p: (typeof UTILITY_PRESETS)[0]) => {
    void Haptics.selectionAsync().catch(() => {});
    setTitle(p.title);
    setCategory(p.category);
    setAmountStr(p.defaultAmount.toString());
  };

  const handleSave = async () => {
    const amount = parseFloat(amountStr);
    if (!amount || amount <= 0) return;

    await addUtilityBill({
      title: title.trim() || 'ইউটিলিটি খরচ',
      amount,
      category,
      splitMode: 'EQUAL',
    });

    setTitle('');
    setAmountStr('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="receipt" size={18} color="#FF922B" />
              </View>
              <Text style={styles.title}>বাসা ভাড়া ও ইউটিলিটি বিল</Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={20} color={C.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Quick Presets */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>কুইক প্রিসেট বেছে নিন</Text>
            <View style={styles.presetsGrid}>
              {UTILITY_PRESETS.map((p) => {
                const isSelected = category === p.category && title === p.title;
                return (
                  <TouchableOpacity
                    key={p.category}
                    activeOpacity={0.8}
                    onPress={() => handleSelectPreset(p)}
                    style={[
                      styles.presetChip,
                      isSelected && styles.presetChipActive,
                    ]}>
                    <MaterialIcons
                      name={p.icon}
                      size={14}
                      color={isSelected ? '#101416' : p.color}
                    />
                    <Text
                      style={[
                        styles.presetText,
                        isSelected && styles.presetTextActive,
                      ]}
                      numberOfLines={1}>
                      {p.title.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Title */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>বিলের নাম / বিবরণ</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. বাসা ভাড়া, কাজের বুয়া"
              placeholderTextColor={C.onSurfaceVariant}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Amount */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>মোট টাকার পরিমাণ (৳)</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              placeholder="e.g. 22000"
              placeholderTextColor={C.onSurfaceVariant}
              value={amountStr}
              onChangeText={setAmountStr}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSave}
            disabled={!amountStr}
            style={[styles.submitBtn, !amountStr && { opacity: 0.5 }]}>
            <Text style={styles.submitBtnText}>ইউটিলিটি বিল যোগ করুন</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#181F23',
    borderRadius: 20,
    padding: 18,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 146, 43, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: F.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  closeBtn: {
    padding: 4,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: F.medium,
    fontSize: 11,
    color: C.onSurface,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#13191C',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  presetChipActive: {
    backgroundColor: '#FF922B',
  },
  presetText: {
    fontFamily: F.medium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  presetTextActive: {
    fontFamily: F.bold,
    color: '#101416',
  },
  textInput: {
    backgroundColor: '#13191C',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: F.medium,
    fontSize: 13,
    color: '#FFFFFF',
  },
  amountInput: {
    backgroundColor: '#13191C',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: F.bold,
    fontSize: 20,
    color: '#FF922B',
  },
  submitBtn: {
    backgroundColor: '#FF922B',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    fontFamily: F.bold,
    fontSize: 13,
    color: '#101416',
  },
});
