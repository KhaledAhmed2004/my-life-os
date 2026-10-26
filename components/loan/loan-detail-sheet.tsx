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

import { LOAN_CATEGORIES, LOAN_STATUS_THEMES } from '@/components/loan/loan-constants';
import { Vital } from '@/constants/vital-theme';
import { useLoanStore } from '@/stores/loan-store';
import { LoanItem } from '@/types/loan';

const C = Vital.colors;
const F = Vital.fonts;

interface LoanDetailSheetProps {
  visible: boolean;
  loan: LoanItem | null;
  onClose: () => void;
  onEdit: (loan: LoanItem) => void;
}

export function LoanDetailSheet({
  visible,
  loan,
  onClose,
  onEdit,
}: LoanDetailSheetProps) {
  const deleteLoan = useLoanStore((s) => s.deleteLoan);
  const logEmiPayment = useLoanStore((s) => s.logEmiPayment);
  const recordPrepayment = useLoanStore((s) => s.recordPrepayment);
  const getAmortization = useLoanStore((s) => s.getAmortization);

  const [showAmortization, setShowAmortization] = useState(false);
  const [prepayModalVisible, setPrepayModalVisible] = useState(false);
  const [prepayAmountText, setPrepayAmountText] = useState('');
  const [prepayNote, setPrepayNote] = useState('');

  const categoryMeta = loan ? LOAN_CATEGORIES[loan.category] || LOAN_CATEGORIES.OTHER : LOAN_CATEGORIES.OTHER;
  const statusTheme = loan ? LOAN_STATUS_THEMES[loan.status] || LOAN_STATUS_THEMES.ACTIVE : LOAN_STATUS_THEMES.ACTIVE;

  const amortizationSchedule = useMemo(() => {
    if (!loan) return [];
    return getAmortization(loan.id);
  }, [loan, getAmortization]);

  if (!loan) return null;

  const progressPercent =
    loan.status === 'PAID_OFF'
      ? 100
      : loan.principalAmount > 0
      ? Math.min(100, Math.max(0, Math.round(((loan.principalAmount - loan.remainingBalance) / loan.principalAmount) * 100)))
      : 0;

  const handlePayEmi = async () => {
    Alert.alert(
      'Confirm EMI Payment',
      `Record monthly EMI payment of ৳${loan.monthlyEmi.toLocaleString()} for ${loan.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Pay',
          onPress: async () => {
            await logEmiPayment(loan.id);
          },
        },
      ]
    );
  };

  const handlePrepaySubmit = async () => {
    const amount = parseFloat(prepayAmountText.replace(/,/g, ''));
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid prepayment amount.');
      return;
    }

    await recordPrepayment(loan.id, amount, prepayNote.trim() || undefined);
    setPrepayModalVisible(false);
    setPrepayAmountText('');
    setPrepayNote('');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Loan',
      `Are you sure you want to remove "${loan.name}" from your portfolio?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteLoan(loan.id);
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
          {/* Top Bar */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.categoryIcon, { backgroundColor: categoryMeta.bg }]}>
                <MaterialIcons name={categoryMeta.icon} size={22} color={categoryMeta.color} />
              </View>
              <View style={styles.titleColumn}>
                <Text style={styles.title} numberOfLines={1}>
                  {loan.name}
                </Text>
                <Text style={styles.subtitle}>
                  {loan.lender} • {categoryMeta.label}
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
            {/* 1. HERO STATUS BANNER */}
            <View style={[styles.statusHero, { backgroundColor: statusTheme.bg }]}>
              <MaterialIcons name={statusTheme.icon} size={20} color={statusTheme.color} />
              <View style={styles.statusHeroTextCol}>
                <Text style={[styles.statusHeroTitle, { color: statusTheme.color }]}>
                  {statusTheme.label}
                </Text>
                <Text style={styles.statusHeroSubtitle}>
                  {loan.status === 'PAID_OFF'
                    ? 'All installments successfully completed!'
                    : `Next EMI due on ${new Date(loan.nextDueDate).toLocaleDateString()}`}
                </Text>
              </View>
            </View>

            {/* 2. CORE FINANCIAL METRICS BENTO */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>MONTHLY EMI</Text>
                <Text style={styles.metricPrimaryVal}>
                  ৳{loan.monthlyEmi.toLocaleString()}
                </Text>
                <Text style={styles.metricSub}>{loan.interestRate}% Interest Rate</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>REMAINING BALANCE</Text>
                <Text style={styles.metricPrimaryVal}>
                  ৳{loan.remainingBalance.toLocaleString()}
                </Text>
                <Text style={styles.metricSub}>Of ৳{loan.principalAmount.toLocaleString()} Principal</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>TOTAL INTEREST</Text>
                <Text style={[styles.metricPrimaryVal, { color: '#FF6B6B' }]}>
                  ৳{loan.totalInterest.toLocaleString()}
                </Text>
                <Text style={styles.metricSub}>Payable: ৳{loan.totalPayment.toLocaleString()}</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>TENURE PROGRESS</Text>
                <Text style={[styles.metricPrimaryVal, { color: '#A78BFA' }]}>
                  {loan.paymentsMade}/{loan.tenureMonths} Mo
                </Text>
                <Text style={styles.metricSub}>{progressPercent}% Complete</Text>
              </View>
            </View>

            {/* 3. PROGRESS BAR */}
            <View style={styles.progressBox}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progressPercent}%`,
                      backgroundColor: loan.status === 'PAID_OFF' ? '#20C997' : categoryMeta.color,
                    },
                  ]}
                />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressText}>Paid: ৳{loan.totalPaidAmount.toLocaleString()}</Text>
                <Text style={styles.progressText}>Remaining: ৳{loan.remainingBalance.toLocaleString()}</Text>
              </View>
            </View>

            {/* 4. PRIMARY ACTIONS (PAY EMI / PREPAY) */}
            {loan.status === 'ACTIVE' && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handlePayEmi}
                  style={styles.payEmiBtn}>
                  <MaterialIcons name="check-circle-outline" size={18} color="#0D1113" />
                  <Text style={styles.payEmiBtnText}>Pay Monthly EMI</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setPrepayModalVisible(true)}
                  style={styles.prepayBtn}>
                  <MaterialIcons name="trending-down" size={18} color="#FFFFFF" />
                  <Text style={styles.prepayBtnText}>Prepay Principal</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 5. NOTES */}
            {Boolean(loan.notes) && (
              <View style={styles.notesBox}>
                <Text style={styles.notesLabel}>Loan Notes & Terms</Text>
                <Text style={styles.notesContent}>{loan.notes}</Text>
              </View>
            )}

            {/* 6. AMORTIZATION SCHEDULE TOGGLE & TABLE */}
            <View style={styles.amortizationContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setShowAmortization(!showAmortization);
                }}
                style={styles.amortizationHeader}>
                <View style={styles.amortizationTitleRow}>
                  <MaterialIcons name="table-chart" size={18} color="#38BDF8" />
                  <Text style={styles.amortizationTitle}>Amortization Schedule</Text>
                </View>
                <MaterialIcons
                  name={showAmortization ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={22}
                  color={C.onSurfaceVariant}
                />
              </TouchableOpacity>

              {showAmortization && (
                <View style={styles.scheduleTable}>
                  <View style={styles.tableHeaderRow}>
                    <Text style={[styles.th, { flex: 0.8 }]}>Month</Text>
                    <Text style={[styles.th, { flex: 1.2 }]}>Principal</Text>
                    <Text style={[styles.th, { flex: 1.2 }]}>Interest</Text>
                    <Text style={[styles.th, { flex: 1.4 }]}>Balance</Text>
                  </View>

                  {amortizationSchedule.slice(0, 36).map((month) => {
                    const isPaid = month.monthIndex <= loan.paymentsMade;
                    return (
                      <View
                        key={month.monthIndex}
                        style={[
                          styles.tableRow,
                          isPaid && styles.tableRowPaid,
                        ]}>
                        <View style={[styles.tdCol, { flex: 0.8 }]}>
                          <Text style={[styles.td, isPaid && styles.tdPaid]}>
                            M{month.monthIndex}
                          </Text>
                        </View>
                        <View style={[styles.tdCol, { flex: 1.2 }]}>
                          <Text style={[styles.td, isPaid && styles.tdPaid]}>
                            ৳{Math.round(month.principal).toLocaleString()}
                          </Text>
                        </View>
                        <View style={[styles.tdCol, { flex: 1.2 }]}>
                          <Text style={[styles.td, { color: '#FF6B6B' }, isPaid && styles.tdPaid]}>
                            ৳{Math.round(month.interest).toLocaleString()}
                          </Text>
                        </View>
                        <View style={[styles.tdCol, { flex: 1.4 }]}>
                          <Text style={[styles.td, isPaid && styles.tdPaid]}>
                            ৳{Math.round(month.balanceRemaining).toLocaleString()}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* 7. RECENT PAYMENT LOGS */}
            {loan.paymentLogs.length > 0 && (
              <View style={styles.logsSection}>
                <Text style={styles.logsTitle}>Recent Repayments Log</Text>
                {loan.paymentLogs.slice(0, 5).map((log) => (
                  <View key={log.id} style={styles.logItem}>
                    <View style={styles.logLeft}>
                      <MaterialIcons name="done-all" size={16} color="#20C997" />
                      <View>
                        <Text style={styles.logNote}>{log.note || 'Payment Recorded'}</Text>
                        <Text style={styles.logDate}>
                          {new Date(log.paymentDate).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.logAmount}>৳{log.amount.toLocaleString()}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* 8. FOOTER ACTIONS (EDIT / DELETE) */}
            <View style={styles.footerActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  onClose();
                  onEdit(loan);
                }}
                style={styles.editBtn}>
                <MaterialIcons name="edit" size={16} color={C.onSurface} />
                <Text style={styles.editBtnText}>Edit Terms</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleDelete}
                style={styles.deleteBtn}>
                <MaterialIcons name="delete-outline" size={16} color="#FF6B6B" />
                <Text style={styles.deleteBtnText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* PREPAYMENT SUB-MODAL */}
      <Modal
        visible={prepayModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPrepayModalVisible(false)}>
        <View style={styles.subModalOverlay}>
          <View style={styles.subModalContent}>
            <Text style={styles.subModalTitle}>Lump-sum Prepayment</Text>
            <Text style={styles.subModalSubtitle}>
              Directly reduces loan principal and future interest burden.
            </Text>

            <View style={styles.subInputWrapper}>
              <Text style={styles.subInputPrefix}>৳</Text>
              <TextInput
                style={styles.subInput}
                keyboardType="numeric"
                value={prepayAmountText}
                onChangeText={(t) => setPrepayAmountText(t.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 50000"
                placeholderTextColor="#5C6E79"
                autoFocus
              />
            </View>

            <TextInput
              style={[styles.subInput, { height: 40, marginTop: 8 }]}
              value={prepayNote}
              onChangeText={setPrepayNote}
              placeholder="Note (e.g. Annual Bonus Prepayment)"
              placeholderTextColor="#5C6E79"
            />

            <View style={styles.subModalActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setPrepayModalVisible(false)}
                style={styles.subCancelBtn}>
                <Text style={styles.subCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handlePrepaySubmit}
                style={styles.subConfirmBtn}>
                <Text style={styles.subConfirmBtnText}>Apply Prepayment</Text>
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
    maxHeight: '92%',
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
  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 12,
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
  progressBox: {
    gap: 6,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E262B',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontFamily: F.medium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  payEmiBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#38BDF8',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  payEmiBtnText: {
    fontFamily: F.bold,
    fontSize: 13,
    color: '#0D1113',
  },
  prepayBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E262B',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  prepayBtnText: {
    fontFamily: F.bold,
    fontSize: 13,
    color: '#FFFFFF',
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
  amortizationContainer: {
    backgroundColor: '#181F23',
    borderRadius: 14,
    overflow: 'hidden',
  },
  amortizationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  amortizationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amortizationTitle: {
    fontFamily: F.bold,
    fontSize: 13,
    color: C.onSurface,
  },
  scheduleTable: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 4,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#263137',
  },
  th: {
    fontFamily: F.bold,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  tableRowPaid: {
    opacity: 0.5,
  },
  tdCol: {
    justifyContent: 'center',
  },
  td: {
    fontFamily: F.medium,
    fontSize: 11,
    color: C.onSurface,
  },
  tdPaid: {
    textDecorationLine: 'line-through',
  },
  logsSection: {
    gap: 8,
  },
  logsTitle: {
    fontFamily: F.bold,
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#181F23',
    padding: 10,
    borderRadius: 10,
  },
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logNote: {
    fontFamily: F.medium,
    fontSize: 12,
    color: C.onSurface,
  },
  logDate: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  logAmount: {
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
    color: '#38BDF8',
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
    backgroundColor: '#38BDF8',
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
