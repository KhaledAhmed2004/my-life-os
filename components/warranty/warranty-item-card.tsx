import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Vital } from '@/constants/vital-theme';
import { useExpenseStore } from '@/stores/expense-store';
import { useWarrantyStore } from '@/stores/warranty-store';
import { WarrantyItem } from '@/types/warranty';
import { STATUS_THEME, WARRANTY_CATEGORY_CONFIG } from './warranty-constants';

const C = Vital.colors;
const F = Vital.fonts;

interface WarrantyItemCardProps {
  item: WarrantyItem;
  onPress: (item: WarrantyItem) => void;
}

export function WarrantyItemCard({ item, onPress }: WarrantyItemCardProps) {
  const computeStatus = useWarrantyStore((s) => s.computeStatus);
  const isPrivacyMode = useExpenseStore((s) => s.isPrivacyMode);

  const { status, daysRemaining, progressPct, isExpiringSoon, isExpired } =
    computeStatus(item);

  const catConfig = WARRANTY_CATEGORY_CONFIG[item.category] || WARRANTY_CATEGORY_CONFIG.OTHER;
  const statusTheme = STATUS_THEME[status];

  const getCountdownLabel = () => {
    if (isExpired) {
      const daysAgo = Math.abs(daysRemaining);
      if (daysAgo < 30) return `Expired ${daysAgo}d ago`;
      const monthsAgo = Math.round(daysAgo / 30);
      return `Expired ${monthsAgo} ${monthsAgo === 1 ? 'month' : 'months'} ago`;
    }
    if (isExpiringSoon) {
      return `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} left ⚠️`;
    }
    if (daysRemaining < 60) {
      return `${daysRemaining} days left`;
    }
    const months = Math.round(daysRemaining / 30);
    if (months < 24) {
      return `${months} months left`;
    }
    const years = (daysRemaining / 365).toFixed(1);
    return `${years} yrs remaining`;
  };

  const hasClaims = item.claims && item.claims.length > 0;
  const totalClaimSaved = hasClaims
    ? item.claims.reduce((acc, c) => acc + (c.costCovered || 0), 0)
    : 0;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress(item);
      }}
      style={[styles.card, isExpiringSoon && styles.cardExpiring]}>
      {/* 1. TOP HEADER: CATEGORY ICON + BRAND/NAME + STATUS BADGE */}
      <View style={styles.headerRow}>
        <View style={styles.leftGroup}>
          <View style={[styles.iconSquircle, { backgroundColor: catConfig.bgColor }]}>
            <MaterialIcons name={catConfig.icon} size={18} color={catConfig.color} />
          </View>
          <View style={styles.titleCol}>
            <Text style={styles.productName} numberOfLines={1}>
              {item.productName}
            </Text>
            <Text style={styles.brandModel} numberOfLines={1}>
              {item.brand} {item.modelNumber ? `• ${item.modelNumber}` : ''}
            </Text>
          </View>
        </View>

        {/* STATUS BADGE */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusTheme.bg },
          ]}>
          <MaterialIcons name={statusTheme.icon} size={11} color={statusTheme.color} />
          <Text style={[styles.statusText, { color: statusTheme.color }]}>
            {statusTheme.label}
          </Text>
        </View>
      </View>

      {/* 2. META DATA ROW: PRICE, STORE, COUNTDOWN */}
      <View style={styles.metaRow}>
        <View style={styles.metaLeft}>
          <Text style={styles.priceText}>
            {isPrivacyMode ? '•••• ৳' : `৳ ${item.purchasePrice.toLocaleString('en-US')}`}
          </Text>
          {item.storeName && (
            <Text style={styles.storeText} numberOfLines={1}>
              via {item.storeName}
            </Text>
          )}
        </View>

        <View style={styles.countdownBox}>
          <Text
            style={[
              styles.countdownText,
              isExpiringSoon && styles.countdownTextExpiring,
              isExpired && styles.countdownTextExpired,
            ]}>
            {getCountdownLabel()}
          </Text>
          <Text style={styles.expiryDateText}>until {item.warrantyEndDate}</Text>
        </View>
      </View>

      {/* 3. PROGRESS BAR (WARRANTY LIFESPAN) */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progressPct}%`,
              backgroundColor: statusTheme.color,
            },
          ]}
        />
      </View>

      {/* 4. FOOTER: SERIAL NUMBER & CLAIMS TAG */}
      <View style={styles.footerRow}>
        {item.serialNumber ? (
          <View style={styles.serialBox}>
            <MaterialIcons name="qr-code" size={11} color={C.onSurfaceVariant} />
            <Text style={styles.serialText} numberOfLines={1}>
              SN: {item.serialNumber}
            </Text>
          </View>
        ) : (
          <View style={styles.serialBox}>
            <MaterialIcons name="verified-user" size={11} color={C.onSurfaceVariant} />
            <Text style={styles.serialText}>{item.warrantyDurationMonths} mo protection</Text>
          </View>
        )}

        {hasClaims && (
          <View style={styles.claimPill}>
            <MaterialIcons name="shield" size={10} color="#38BDF8" />
            <Text style={styles.claimPillText}>
              {item.claims.length} {item.claims.length === 1 ? 'Claim' : 'Claims'}
              {totalClaimSaved > 0 && !isPrivacyMode
                ? ` • ৳ ${(totalClaimSaved / 1000).toFixed(1)}k Saved`
                : ''}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#151A1D',
    borderRadius: 16,
    padding: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  cardExpiring: {
    backgroundColor: 'rgba(252, 196, 25, 0.05)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconSquircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCol: {
    flex: 1,
    gap: 1,
  },
  productName: {
    fontFamily: F.sansBold,
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  brandModel: {
    fontFamily: F.sans,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontFamily: F.sansBold,
    fontSize: 9,
    letterSpacing: 0.4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  metaLeft: {
    gap: 1,
  },
  priceText: {
    fontFamily: F.sansBold,
    fontSize: 14,
    color: '#20C997',
  },
  storeText: {
    fontFamily: F.sans,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  countdownBox: {
    alignItems: 'flex-end',
    gap: 1,
  },
  countdownText: {
    fontFamily: F.sansBold,
    fontSize: 12,
    color: '#20C997',
  },
  countdownTextExpiring: {
    color: '#FCC419',
  },
  countdownTextExpired: {
    color: '#FA5252',
  },
  expiryDateText: {
    fontFamily: F.sans,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    paddingTop: 2,
  },
  serialBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    flexShrink: 1,
  },
  serialText: {
    fontFamily: F.sansMedium,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  claimPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  claimPillText: {
    fontFamily: F.sansBold,
    fontSize: 9,
    color: '#38BDF8',
  },
});
