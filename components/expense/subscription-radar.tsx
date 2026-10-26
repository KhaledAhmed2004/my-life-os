import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Vital } from '@/constants/vital-theme';
import { useExpenseStore } from '@/stores/expense-store';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { Subscription } from '@/types/subscription';

import { AddSubscriptionModal, getSafeSubVectorIcon } from './add-subscription-modal';

const C = Vital.colors;
const F = Vital.fonts;

export function SubscriptionRadar() {
  const isPrivacyMode = useExpenseStore((s) => s.isPrivacyMode);

  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const getSummary = useSubscriptionStore((s) => s.getSummary);
  const getUpcomingBills = useSubscriptionStore((s) => s.getUpcomingBills);
  const markAsPaid = useSubscriptionStore((s) => s.markAsPaid);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);

  const summary = getSummary();
  const upcomingBills = getUpcomingBills();

  const handleOpenAdd = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedSub(null);
    setModalVisible(true);
  };

  const handleOpenEdit = (sub: Subscription) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedSub(sub);
    setModalVisible(true);
  };

  const handleMarkPaid = async (sub: Subscription) => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    await markAsPaid(sub.id);
  };

  return (
    <View style={styles.card}>
      {/* HEADER ROW */}
      <View style={styles.headerRow}>
        <View style={styles.titleBadge}>
          <View style={styles.radarIconBox}>
            <MaterialIcons name="autorenew" size={14} color="#C8F135" />
          </View>
          <Text style={styles.titleText}>RECURRING BILLS RADAR</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleOpenAdd}
          style={styles.addBtn}>
          <MaterialIcons name="add" size={13} color="#101416" />
          <Text style={styles.addBtnText}>Add Bill</Text>
        </TouchableOpacity>
      </View>

      {/* COMMITMENTS SUMMARY BENTO */}
      <View style={styles.summaryBento}>
        <View style={styles.summaryCol}>
          <Text style={styles.summaryLabel}>TOTAL MONTHLY COMMITMENT</Text>
          <Text style={styles.summaryAmount}>
            {isPrivacyMode
              ? '•••••• ৳'
              : `৳ ${summary.totalMonthlyCommitment.toLocaleString('en-US')}`}
          </Text>
        </View>

        <View style={styles.paidStatusPill}>
          <MaterialIcons name="verified" size={13} color="#C8F135" />
          <Text style={styles.paidStatusText}>
            {summary.paidThisMonthCount} / {summary.activeCount} Paid This Month
          </Text>
        </View>
      </View>

      {/* SUBSCRIPTION BILLS LIST */}
      <View style={styles.billsList}>
        {upcomingBills.map((sub) => {
          const isPaid = sub.isPaidThisMonth;
          let dueLabel = `Due in ${sub.daysUntilDue}d`;
          if (sub.daysUntilDue === 0) dueLabel = 'Due Today 🔥';
          if (sub.daysUntilDue === 1) dueLabel = 'Due Tomorrow ⚠️';

          return (
            <TouchableOpacity
              key={sub.id}
              activeOpacity={0.8}
              onPress={() => handleOpenEdit(sub)}
              style={[styles.billRow, isPaid && styles.billRowPaid]}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: `${sub.color}22`,
                    borderWidth: 1,
                    borderColor: `${sub.color}35`,
                  },
                ]}>
                <MaterialIcons
                  name={getSafeSubVectorIcon(sub.icon)}
                  size={18}
                  color={sub.color}
                />
              </View>

              <View style={styles.billDetails}>
                <Text style={styles.billName} numberOfLines={1}>
                  {sub.name}
                </Text>
                <View style={styles.dueDayPill}>
                  <Text
                    style={[
                      styles.dueDayText,
                      isPaid ? styles.dueDayTextPaid : styles.dueDayTextDue,
                    ]}>
                    {isPaid ? '✓ Paid this month' : `${dueLabel} • ${sub.dueDay}th of month`}
                  </Text>
                </View>
              </View>

              <View style={styles.actionCol}>
                <Text style={styles.billAmount}>
                  {isPrivacyMode ? '••••' : `৳ ${sub.amount.toLocaleString('en-US')}`}
                </Text>

                {!isPaid ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleMarkPaid(sub)}
                    style={styles.payBtn}>
                    <Text style={styles.payBtnText}>Mark Paid</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.paidCheckPill}>
                    <MaterialIcons name="check" size={11} color="#C8F135" />
                    <Text style={styles.paidCheckText}>Paid</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {upcomingBills.length === 0 && (
          <View style={styles.emptyBillsBox}>
            <MaterialIcons name="playlist-add-check" size={24} color={C.onSurfaceVariant} />
            <Text style={styles.emptyBillsTitle}>No Recurring Bills Tracked</Text>
            <Text style={styles.emptyBillsSubtitle}>
              Keep track of Netflix, Gym, WiFi, or Rent commitments in one place.
            </Text>
            <TouchableOpacity onPress={handleOpenAdd} style={styles.emptyAddBtn}>
              <Text style={styles.emptyAddBtnText}>+ Add First Recurring Bill</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ADD / EDIT MODAL */}
      <AddSubscriptionModal
        visible={modalVisible}
        subscriptionToEdit={selectedSub}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#161A1D',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radarIconBox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: 'rgba(200, 241, 53, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontFamily: F.sansBold,
    fontSize: 10,
    color: C.onSurfaceVariant,
    letterSpacing: 0.8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#C8F135',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addBtnText: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: '#101416',
  },
  summaryBento: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  summaryCol: {
    gap: 2,
  },
  summaryLabel: {
    fontFamily: F.sansBold,
    fontSize: 9,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  summaryAmount: {
    fontFamily: F.sansBold,
    fontSize: 20,
    color: C.onSurface,
  },
  paidStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(200, 241, 53, 0.1)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  paidStatusText: {
    fontFamily: F.sansBold,
    fontSize: 10,
    color: '#C8F135',
  },
  billsList: {
    gap: 8,
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  billRowPaid: {
    opacity: 0.65,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 16,
  },
  billDetails: {
    flex: 1,
    gap: 2,
  },
  billName: {
    fontFamily: F.sansSemiBold,
    fontSize: 13,
    color: C.onSurface,
  },
  dueDayPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDayText: {
    fontFamily: F.sansMedium,
    fontSize: 10,
  },
  dueDayTextDue: {
    color: C.onSurfaceVariant,
  },
  dueDayTextPaid: {
    color: '#20C997',
  },
  actionCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  billAmount: {
    fontFamily: F.sansBold,
    fontSize: 13,
    color: C.onSurface,
  },
  payBtn: {
    backgroundColor: 'rgba(200, 241, 53, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(200, 241, 53, 0.25)',
  },
  payBtnText: {
    fontFamily: F.sansBold,
    fontSize: 10,
    color: '#C8F135',
  },
  paidCheckPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  paidCheckText: {
    fontFamily: F.sansBold,
    fontSize: 10,
    color: '#C8F135',
  },
  emptyBillsBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  emptyBillsTitle: {
    fontFamily: F.sansBold,
    fontSize: 13,
    color: C.onSurface,
  },
  emptyBillsSubtitle: {
    fontFamily: F.sans,
    fontSize: 11,
    color: C.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 15,
  },
  emptyAddBtn: {
    marginTop: 4,
    backgroundColor: 'rgba(200, 241, 53, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(200, 241, 53, 0.25)',
  },
  emptyAddBtnText: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: '#C8F135',
  },
});
