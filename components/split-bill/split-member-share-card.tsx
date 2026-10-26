import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Vital } from '@/constants/vital-theme';
import { SplitMember } from '@/types/split-bill';

const C = Vital.colors;
const F = Vital.fonts;

interface SplitMemberShareCardProps {
  member: SplitMember;
  onToggleSettled: () => void;
  onShare: () => void;
  onSyncUdhaar?: () => void;
}

export function SplitMemberShareCard({
  member,
  onToggleSettled,
  onShare,
  onSyncUdhaar,
}: SplitMemberShareCardProps) {
  return (
    <View style={[styles.card, member.isSettled && styles.cardSettled]}>
      {/* Top row: Name & Payer / Status */}
      <View style={styles.topRow}>
        <View style={styles.nameCol}>
          <View style={styles.nameRow}>
            <Text style={styles.nameText} numberOfLines={1}>
              {member.name}
            </Text>
            {member.isPayer && (
              <View style={styles.payerBadge}>
                <Text style={styles.payerBadgeText}>PAID THE BILL</Text>
              </View>
            )}
            {member.linkedDebtId && (
              <View style={styles.syncedBadge}>
                <MaterialIcons name="sync" size={10} color="#51CF66" />
                <Text style={styles.syncedBadgeText}>UDHAAR SYNCED</Text>
              </View>
            )}
          </View>

          {member.phone ? (
            <Text style={styles.phoneText}>{member.phone}</Text>
          ) : null}
        </View>

        {/* Total Share */}
        <View style={styles.shareCol}>
          <Text style={styles.takaText}>
            ৳{member.totalShare.toLocaleString()}
          </Text>
          <Text style={styles.shareSub}>
            Food: ৳{member.subtotalShare} • Tax: ৳{member.vatShare + member.serviceChargeShare}
          </Text>
        </View>
      </View>

      {/* Bottom Action Bar */}
      <View style={styles.bottomRow}>
        {!member.isPayer && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              void Haptics.selectionAsync().catch(() => {});
              onToggleSettled();
            }}
            style={[
              styles.statusPill,
              member.isSettled ? styles.statusPillPaid : styles.statusPillPending,
            ]}>
            <MaterialIcons
              name={member.isSettled ? 'check-circle' : 'pending'}
              size={12}
              color={member.isSettled ? '#20C997' : '#FF922B'}
            />
            <Text
              style={[
                styles.statusPillText,
                { color: member.isSettled ? '#20C997' : '#FF922B' },
              ]}>
              {member.isSettled ? 'Paid / Settled' : 'Unpaid (Tap to Settle)'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.actionIconsRow}>
          {!member.isPayer && !member.linkedDebtId && !member.isSettled && onSyncUdhaar && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                onSyncUdhaar();
              }}
              style={styles.udhaarBtn}>
              <MaterialIcons name="swap-horiz" size={14} color="#51CF66" />
              <Text style={styles.udhaarBtnText}>To Udhaar</Text>
            </TouchableOpacity>
          )}

          {!member.isPayer && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                onShare();
              }}
              style={styles.shareIconBtn}>
              <MaterialIcons name="share" size={14} color="#38BDF8" />
              <Text style={styles.shareIconText}>Share</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#181F23',
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  cardSettled: {
    opacity: 0.85,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameCol: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  nameText: {
    fontFamily: F.bold,
    fontSize: 13,
    color: C.onSurface,
  },
  payerBadge: {
    backgroundColor: 'rgba(32, 201, 151, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  payerBadgeText: {
    fontFamily: F.bold,
    fontSize: 8,
    color: '#20C997',
  },
  syncedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(81, 207, 102, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  syncedBadgeText: {
    fontFamily: F.bold,
    fontSize: 8,
    color: '#51CF66',
  },
  phoneText: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  shareCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  takaText: {
    fontFamily: F.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  shareSub: {
    fontFamily: F.regular,
    fontSize: 9,
    color: C.onSurfaceVariant,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPillPaid: {
    backgroundColor: 'rgba(32, 201, 151, 0.12)',
  },
  statusPillPending: {
    backgroundColor: 'rgba(255, 146, 43, 0.12)',
  },
  statusPillText: {
    fontFamily: F.bold,
    fontSize: 10,
  },
  actionIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  udhaarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(81, 207, 102, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  udhaarBtnText: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#51CF66',
  },
  shareIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  shareIconText: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#38BDF8',
  },
});
