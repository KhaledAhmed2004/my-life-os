import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Vital } from '@/constants/vital-theme';
import { MemberMonthlySettlement } from '@/types/mess';

const C = Vital.colors;
const F = Vital.fonts;

interface MessMemberLedgerCardProps {
  settlement: MemberMonthlySettlement;
  onAddDeposit: (memberId: string) => void;
  onEditMeals: (memberId: string) => void;
  onSyncUdhaar?: (memberId: string) => void;
}

export function MessMemberLedgerCard({
  settlement,
  onAddDeposit,
  onEditMeals,
  onSyncUdhaar,
}: MessMemberLedgerCardProps) {
  const {
    memberId,
    memberName,
    role,
    totalMeals,
    mealCost,
    utilityShare,
    totalCost,
    totalDeposited,
    balance,
    status,
  } = settlement;

  const isDue = status === 'DUE';
  const isRefundable = status === 'REFUNDABLE';

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor:
                  role === 'MANAGER'
                    ? 'rgba(212, 160, 23, 0.15)'
                    : 'rgba(56, 189, 248, 0.15)',
              },
            ]}>
            <MaterialIcons
              name={role === 'MANAGER' ? 'star' : 'person'}
              size={16}
              color={role === 'MANAGER' ? '#D4A017' : '#38BDF8'}
            />
          </View>
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{memberName}</Text>
              {role === 'MANAGER' && (
                <View style={styles.managerTag}>
                  <Text style={styles.managerTagText}>MANAGER</Text>
                </View>
              )}
            </View>
            <Text style={styles.subtext}>
              {totalMeals} Meals • Total Cost: ৳{totalCost.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            isRefundable && styles.statusBadgeRefund,
            isDue && styles.statusBadgeDue,
          ]}>
          <Text
            style={[
              styles.statusBadgeText,
              isRefundable && { color: '#20C997' },
              isDue && { color: '#FF922B' },
            ]}>
            {isRefundable
              ? `পাবে ৳${balance.toLocaleString()}`
              : isDue
              ? `দিতে হবে ৳${Math.abs(balance).toLocaleString()}`
              : 'পরিশোধিত'}
          </Text>
        </View>
      </View>

      {/* Cost Breakdown Bento */}
      <View style={styles.bentoRow}>
        <View style={styles.bentoTile}>
          <Text style={styles.bentoLabel}>MEALS COST</Text>
          <Text style={styles.bentoValue}>৳{mealCost.toLocaleString()}</Text>
          <Text style={styles.bentoSub}>{totalMeals} টি মিল</Text>
        </View>

        <View style={styles.bentoTile}>
          <Text style={styles.bentoLabel}>UTILITY & RENT</Text>
          <Text style={styles.bentoValue}>৳{utilityShare.toLocaleString()}</Text>
          <Text style={styles.bentoSub}>বাসা ও বিল</Text>
        </View>

        <View style={styles.bentoTile}>
          <Text style={styles.bentoLabel}>DEPOSITED</Text>
          <Text style={[styles.bentoValue, { color: '#38BDF8' }]}>
            ৳{totalDeposited.toLocaleString()}
          </Text>
          <Text style={styles.bentoSub}>মোট জমা</Text>
        </View>
      </View>

      {/* Action Chips */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            onAddDeposit(memberId);
          }}
          style={styles.actionBtn}>
          <MaterialIcons name="add-circle-outline" size={14} color="#20C997" />
          <Text style={[styles.actionBtnText, { color: '#20C997' }]}>
            টাকা জমা (+Deposit)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            onEditMeals(memberId);
          }}
          style={styles.actionBtn}>
          <MaterialIcons name="edit" size={14} color="#38BDF8" />
          <Text style={[styles.actionBtnText, { color: '#38BDF8' }]}>
            মিল আপডেট
          </Text>
        </TouchableOpacity>

        {isDue && onSyncUdhaar && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              onSyncUdhaar(memberId);
            }}
            style={[styles.actionBtn, styles.actionBtnDue]}>
            <MaterialIcons name="swap-horiz" size={14} color="#FF922B" />
            <Text style={[styles.actionBtnText, { color: '#FF922B' }]}>
              To Udhaar
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#181F23',
    borderRadius: 16,
    padding: 14,
    gap: 12,
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
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontFamily: F.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  managerTag: {
    backgroundColor: 'rgba(212, 160, 23, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  managerTagText: {
    fontFamily: F.bold,
    fontSize: 8,
    color: '#D4A017',
  },
  subtext: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
    marginTop: 1,
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusBadgeRefund: {
    backgroundColor: 'rgba(32, 201, 151, 0.12)',
  },
  statusBadgeDue: {
    backgroundColor: 'rgba(255, 146, 43, 0.12)',
  },
  statusBadgeText: {
    fontFamily: F.bold,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bentoTile: {
    flex: 1,
    backgroundColor: '#13191C',
    borderRadius: 10,
    padding: 8,
    gap: 1,
  },
  bentoLabel: {
    fontFamily: F.bold,
    fontSize: 8,
    color: C.onSurfaceVariant,
    letterSpacing: 0.4,
  },
  bentoValue: {
    fontFamily: F.bold,
    fontSize: 13,
    color: '#FFFFFF',
    marginTop: 2,
  },
  bentoSub: {
    fontFamily: F.regular,
    fontSize: 8,
    color: C.onSurfaceVariant,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#13191C',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnDue: {
    backgroundColor: 'rgba(255, 146, 43, 0.1)',
  },
  actionBtnText: {
    fontFamily: F.bold,
    fontSize: 10,
  },
});
