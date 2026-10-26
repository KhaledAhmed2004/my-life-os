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

import { useMessStore } from '@/stores/mess-store';
import { Vital } from '@/constants/vital-theme';

const C = Vital.colors;
const F = Vital.fonts;

interface AddBazaarModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddBazaarModal({ visible, onClose }: AddBazaarModalProps) {
  const members = useMessStore((s) => s.currentSession.members);
  const addBazaarEntry = useMessStore((s) => s.addBazaarEntry);

  const [amountStr, setAmountStr] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState(
    members[0]?.id || ''
  );
  const [itemsSummary, setItemsSummary] = useState('');

  const handleSave = async () => {
    const amount = parseFloat(amountStr);
    if (!amount || amount <= 0) return;

    const shopper = members.find((m) => m.id === selectedMemberId);
    const shopperName = shopper ? shopper.name : 'Unknown';

    await addBazaarEntry({
      date: new Date().toISOString().split('T')[0],
      shopperMemberId: selectedMemberId,
      shopperName,
      amount,
      itemsSummary: itemsSummary.trim() || 'দৈনিক মেস বাজার',
    });

    setAmountStr('');
    setItemsSummary('');
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
                <MaterialIcons name="shopping-basket" size={18} color="#20C997" />
              </View>
              <Text style={styles.title}>নতুন বাজার এন্ট্রি</Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={20} color={C.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>বাজার খরচের পরিমাণ (৳)</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              placeholder="e.g. 3500"
              placeholderTextColor={C.onSurfaceVariant}
              value={amountStr}
              onChangeText={setAmountStr}
              autoFocus
            />
          </View>

          {/* Shopper Selector */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>বাজার কে করেছে?</Text>
            <View style={styles.membersRow}>
              {members.map((m) => {
                const isSelected = (selectedMemberId || members[0]?.id) === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    activeOpacity={0.8}
                    onPress={() => {
                      void Haptics.selectionAsync().catch(() => {});
                      setSelectedMemberId(m.id);
                    }}
                    style={[
                      styles.memberChip,
                      isSelected && styles.memberChipActive,
                    ]}>
                    <Text
                      style={[
                        styles.memberChipText,
                        isSelected && styles.memberChipTextActive,
                      ]}>
                      {m.name.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Items Summary Input */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>কী কী কেনা হয়েছে? (সংক্ষেপ)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. চাল ২৫ কেজি, তেল ৫ লিটার, মুরগি, আলু"
              placeholderTextColor={C.onSurfaceVariant}
              value={itemsSummary}
              onChangeText={setItemsSummary}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSave}
            disabled={!amountStr}
            style={[
              styles.submitBtn,
              !amountStr && { opacity: 0.5 },
            ]}>
            <Text style={styles.submitBtnText}>বাজার খরচ সেভ করুন</Text>
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
    backgroundColor: 'rgba(32, 201, 151, 0.15)',
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
  amountInput: {
    backgroundColor: '#13191C',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: F.bold,
    fontSize: 20,
    color: '#20C997',
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
  membersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  memberChip: {
    backgroundColor: '#13191C',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  memberChipActive: {
    backgroundColor: '#20C997',
  },
  memberChipText: {
    fontFamily: F.medium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  memberChipTextActive: {
    fontFamily: F.bold,
    color: '#101416',
  },
  submitBtn: {
    backgroundColor: '#20C997',
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
