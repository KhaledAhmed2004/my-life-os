import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAtmStore } from '@/stores/atm-store';
import { Vital } from '@/constants/vital-theme';
import { AtmCashStatus, AtmLocation } from '@/types/atm';

const C = Vital.colors;
const F = Vital.fonts;

interface AtmReportStatusModalProps {
  visible: boolean;
  atm: AtmLocation | null;
  onClose: () => void;
}

const STATUS_OPTIONS: {
  status: AtmCashStatus;
  label: string;
  sub: string;
  icon: string;
  color: string;
}[] = [
  {
    status: 'CASH_AVAILABLE',
    label: 'Cash Available (টাকা আছে)',
    sub: 'Withdrawal is actively working',
    icon: 'check-circle',
    color: '#20C997',
  },
  {
    status: 'LOW_CASH',
    label: 'Low Cash / Long Queue (টাকা কম)',
    sub: 'Running out of notes or high crowd',
    icon: 'warning',
    color: '#FF922B',
  },
  {
    status: 'OUT_OF_CASH',
    label: 'Out of Cash / Closed (টাকা নেই)',
    sub: 'Machine empty or out of order',
    icon: 'cancel',
    color: '#FF6B6B',
  },
];

export function AtmReportStatusModal({
  visible,
  atm,
  onClose,
}: AtmReportStatusModalProps) {
  const updateAtmCashStatus = useAtmStore((s) => s.updateAtmCashStatus);

  if (!atm) return null;

  const handleSelectStatus = async (status: AtmCashStatus) => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    await updateAtmCashStatus(atm.id, status);
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
                <MaterialIcons name="flag" size={18} color="#FF922B" />
              </View>
              <View>
                <Text style={styles.title}>Update ATM Status</Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {atm.name}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={20} color={C.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Status Options List */}
          <View style={styles.optionsList}>
            {STATUS_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.status}
                activeOpacity={0.8}
                onPress={() => handleSelectStatus(opt.status)}
                style={styles.optionBtn}>
                <MaterialIcons
                  name={opt.icon as any}
                  size={20}
                  color={opt.color}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionLabel}>{opt.label}</Text>
                  <Text style={styles.optionSub}>{opt.sub}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
    flex: 1,
    marginRight: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 146, 43, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: F.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  subtitle: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  closeBtn: {
    padding: 4,
  },
  optionsList: {
    gap: 8,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#13191C',
    padding: 12,
    borderRadius: 12,
  },
  optionLabel: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  optionSub: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
    marginTop: 1,
  },
});
