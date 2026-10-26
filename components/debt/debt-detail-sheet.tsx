import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { DEBT_STATUS_METAS, DEBT_TYPE_METAS } from '@/components/debt/debt-constants';
import { Vital } from '@/constants/vital-theme';
import { useDebtStore } from '@/stores/debt-store';
import { DebtItem } from '@/types/debt';

const C = Vital.colors;
const F = Vital.fonts;

interface DebtDetailSheetProps {
  visible: boolean;
  debt: DebtItem | null;
  onClose: () => void;
  onEdit: (debt: DebtItem) => void;
}

export function DebtDetailSheet({
  visible,
  debt,
  onClose,
  onEdit,
}: DebtDetailSheetProps) {
  const deleteDebt = useDebtStore((s) => s.deleteDebt);
  const recordRepayment = useDebtStore((s) => s.recordRepayment);
  const settleDebt = useDebtStore((s) => s.settleDebt);

  const [repayModalVisible, setRepayModalVisible] = useState(false);
  const [repayAmountText, setRepayAmountText] = useState('');
  const [repayNote, setRepayNote] = useState('');

  const typeMeta = debt ? DEBT_TYPE_METAS[debt.type] || DEBT_TYPE_METAS.I_LENT : DEBT_TYPE_METAS.I_LENT;
  const statusMeta = debt ? DEBT_STATUS_METAS[debt.status] || DEBT_STATUS_METAS.PENDING : DEBT_STATUS_METAS.PENDING;

  const initials = useMemo(() => {
    if (!debt) return '';
    return debt.personName
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('');
  }, [debt]);

  if (!debt) return null;

  const handleSettleFull = async () => {
    Alert.alert(
      'Mark as Settled',
      `Clear full remaining balance of ৳${debt.remainingAmount.toLocaleString()} for ${debt.personName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Settle',
          onPress: async () => {
            await settleDebt(debt.id);
          },
        },
      ]
    );
  };

  const handleRepaySubmit = async () => {
    const amount = parseFloat(repayAmountText.replace(/,/g, ''));
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    await recordRepayment(debt.id, amount, repayNote.trim() || undefined);
    setRepayModalVisible(false);
    setRepayAmountText('');
    setRepayNote('');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Record',
      `Are you sure you want to remove this record with ${debt.personName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteDebt(debt.id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.avatarCircle, { backgroundColor: typeMeta.bg }]}>
                <Text style={[styles.avatarText, { color: typeMeta.color }]}>
                  {initials || '?'}
                </Text>
              </View>
              <View style={styles.titleColumn}>
                <Text style={styles.title} numberOfLines={1}>
                  {debt.personName}
                </Text>
                <Text style={styles.subtitle}>
                  {typeMeta.label} {debt.phone ? `• ${debt.phone}` : ''}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.closeBtn}>
              <MaterialIcons name="close" size={20} color={C.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}>
            {/* 1. STATUS HERO BANNER */}
            <View style={[styles.statusHero, { backgroundColor: statusMeta.bg }]}>
              <MaterialIcons name={statusMeta.icon} size={20} color={statusMeta.color} />
              <View style={styles.statusHeroTextCol}>
                <Text style={[styles.statusHeroTitle, { color: statusMeta.color }]}>
                  {statusMeta.label}
                </Text>
                <Text style={styles.statusHeroSubtitle}>
                  {debt.status === 'SETTLED'
                    ? 'All dues are completely settled and cleared.'
                    : debt.dueDate
                    ? `Due by ${new Date(debt.dueDate).toLocaleDateString()}`
                    : 'No strict due date set'}
                </Text>
              </View>
            </View>

            {/* 2. AMOUNT METRICS BENTO */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>
                  {debt.status === 'SETTLED' ? 'SETTLED TOTAL' : 'REMAINING AMOUNT'}
                </Text>
                <Text style={[styles.metricPrimaryVal, { color: typeMeta.color }]}>
                  ৳{(debt.status === 'SETTLED' ? debt.amount : debt.remainingAmount).toLocaleString()}
                </Text>
                <Text style={styles.metricSub}>{typeMeta.badgeText}</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>TOTAL ORIGINAL</Text>
                <Text style={styles.metricPrimaryVal}>
                  ৳{debt.amount.toLocaleString()}
                </Text>
                <Text style={styles.metricSub}>Initial Transaction</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>ALREADY PAID</Text>
                <Text style={[styles.metricPrimaryVal, { color: '#20C997' }]}>
                  ৳{debt.paidAmount.toLocaleString()}
                </Text>
                <Text style={styles.metricSub}>
                  {Math.round((debt.paidAmount / (debt.amount || 1)) * 100)}% Cleared
                </Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>DATE RECORDED</Text>
                <Text style={styles.metricPrimaryVal}>
                  {new Date(debt.startDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
                <Text style={styles.metricSub}>
                  {new Date(debt.startDate).getFullYear()}
                </Text>
              </View>
            </View>

            {/* 3. REPAYMENT ACTIONS */}
            {debt.status !== 'SETTLED' && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setRepayModalVisible(true)}
                  style={[styles.partialRepayBtn, { backgroundColor: typeMeta.color }]}>
                  <MaterialIcons name="add-circle-outline" size={18} color="#0D1113" />
                  <Text style={styles.partialRepayBtnText}>Record Payment</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleSettleFull}
                  style={styles.settleBtn}>
                  <MaterialIcons name="done-all" size={18} color="#20C997" />
                  <Text style={styles.settleBtnText}>Mark Settle Full</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 4. NOTES */}
            {Boolean(debt.notes) && (
              <View style={styles.notesBox}>
                <Text style={styles.notesLabel}>Transaction Note / Reason</Text>
                <Text style={styles.notesContent}>{debt.notes}</Text>
              </View>
            )}

            {/* 5. REPAYMENT TIMELINE */}
            <View style={styles.timelineBox}>
              <Text style={styles.timelineTitle}>Repayment History</Text>
              {debt.history.length === 0 ? (
                <Text style={styles.emptyHistoryText}>
                  No partial repayments recorded yet.
                </Text>
              ) : (
                debt.history.map((entry) => (
                  <View key={entry.id} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <MaterialIcons name="check" size={14} color="#20C997" />
                      <View>
                        <Text style={styles.timelineNote}>{entry.note || 'Repayment'}</Text>
                        <Text style={styles.timelineDate}>
                          {new Date(entry.date).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.timelineAmount}>+৳{entry.amount.toLocaleString()}</Text>
                  </View>
                ))
              )}
            </View>

            {/* 6. EDIT & DELETE */}
            <View style={styles.footerActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  onClose();
                  onEdit(debt);
                }}
                style={styles.editBtn}>
                <MaterialIcons name="edit" size={16} color={C.onSurface} />
                <Text style={styles.editBtnText}>Edit Record</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleDelete}
                style={styles.deleteBtn}>
                <MaterialIcons name="delete-outline" size={16} color="#FF6B6B" />
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* RECORD PAYMENT SUB-MODAL */}
      <Modal
        visible={repayModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRepayModalVisible(false)}>
        <View style={styles.subModalOverlay}>
          <View style={styles.subModalContent}>
            <Text style={styles.subModalTitle}>Record Repayment</Text>
            <Text style={styles.subModalSubtitle}>
              Log amount received from or returned to {debt.personName}.
            </Text>

            <View style={styles.subInputWrapper}>
              <Text style={[styles.subInputPrefix, { color: typeMeta.color }]}>৳</Text>
              <TextInput
                style={styles.subInput}
                keyboardType="numeric"
                value={repayAmountText}
                onChangeText={(t) => setRepayAmountText(t.replace(/[^0-9]/g, ''))}
                placeholder={`Remaining: ${debt.remainingAmount}`}
                placeholderTextColor="#5C6E79"
                autoFocus
              />
            </View>

            <TextInput
              style={[styles.subInput, { height: 40, marginTop: 8 }]}
              value={repayNote}
              onChangeText={setRepayNote}
              placeholder="Note (e.g. bKash payment / Cash)"
              placeholderTextColor="#5C6E79"
            />

            <View style={styles.subModalActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setRepayModalVisible(false)}
                style={styles.subCancelBtn}>
                <Text style={styles.subCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleRepaySubmit}
                style={[styles.subConfirmBtn, { backgroundColor: typeMeta.color }]}>
                <Text style={styles.subConfirmBtnText}>Save Payment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flex: 1,
    marginRight: 10,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: F.bold,
    fontSize: 16,
  },
  titleColumn: {
    flex: 1,
    gap: 2,
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
  statusHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    padding: 12,
  },
  statusHeroTextCol: {
    flex: 1,
    gap: 2,
  },
  statusHeroTitle: {
    fontFamily: F.bold,
    fontSize: 13,
  },
  statusHeroSubtitle: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#181F23',
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  metricLabel: {
    fontFamily: F.bold,
    fontSize: 9,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  metricPrimaryVal: {
    fontFamily: F.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  metricSub: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  partialRepayBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  partialRepayBtnText: {
    fontFamily: F.bold,
    fontSize: 13,
    color: '#0D1113',
  },
  settleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E262B',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  settleBtnText: {
    fontFamily: F.bold,
    fontSize: 13,
    color: '#20C997',
  },
  notesBox: {
    backgroundColor: '#181F23',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  notesLabel: {
    fontFamily: F.bold,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  notesContent: {
    fontFamily: F.regular,
    fontSize: 12,
    color: C.onSurface,
  },
  timelineBox: {
    backgroundColor: '#181F23',
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  timelineTitle: {
    fontFamily: F.bold,
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  emptyHistoryText: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#263137',
  },
  timelineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timelineNote: {
    fontFamily: F.medium,
    fontSize: 12,
    color: C.onSurface,
  },
  timelineDate: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  timelineAmount: {
    fontFamily: F.bold,
    fontSize: 13,
    color: '#20C997',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 8,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C2226',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  editBtnText: {
    fontFamily: F.bold,
    fontSize: 13,
    color: C.onSurface,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  deleteBtnText: {
    fontFamily: F.bold,
    fontSize: 13,
    color: '#FF6B6B',
  },
  subModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  subModalContent: {
    width: '100%',
    backgroundColor: '#161C20',
    borderRadius: 20,
    padding: 20,
    gap: 10,
  },
  subModalTitle: {
    fontFamily: F.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  subModalSubtitle: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  subInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E262B',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
    marginTop: 6,
  },
  subInputPrefix: {
    fontFamily: F.bold,
    fontSize: 18,
  },
  subInput: {
    flex: 1,
    fontFamily: F.bold,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: '#1E262B',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  subModalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  subCancelBtn: {
    flex: 1,
    backgroundColor: '#20292F',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  subCancelBtnText: {
    fontFamily: F.bold,
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  subConfirmBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  subConfirmBtnText: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#0D1113',
  },
});
