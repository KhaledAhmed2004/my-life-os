import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  BANKS_METADATA,
  CAPABILITY_METADATA,
} from '@/components/atm/atm-constants';
import { formatDistance } from '@/stores/atm-store';
import { Vital } from '@/constants/vital-theme';
import { AtmLocation } from '@/types/atm';

const C = Vital.colors;
const F = Vital.fonts;

interface AtmBoothCardProps {
  atm: AtmLocation;
  isSelected?: boolean;
  onSelect?: () => void;
  onReportStatus?: (atm: AtmLocation) => void;
}

export function AtmBoothCard({
  atm,
  isSelected,
  onSelect,
  onReportStatus,
}: AtmBoothCardProps) {
  const bankMeta = BANKS_METADATA[atm.bank] || BANKS_METADATA.DBBL;
  const isCrm = atm.capabilities.includes('CASH_DEPOSIT_CRM');

  const handleDirections = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const lat = atm.latitude;
    const lon = atm.longitude;
    const label = encodeURIComponent(atm.name);

    let url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
    if (Platform.OS === 'ios') {
      url = `maps:0,0?q=${label}@${lat},${lon}`;
    }
    void Linking.openURL(url).catch(() => {
      void Linking.openURL(`https://maps.google.com/?q=${lat},${lon}`);
    });
  };

  const handleCall = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const phone = atm.helplinePhone || bankMeta.helpline;
    if (phone) {
      void Linking.openURL(`tel:${phone}`);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onSelect}
      style={[
        styles.card,
        isSelected && { borderColor: bankMeta.color, borderWidth: 1.5 },
      ]}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.bankIconCircle,
              { backgroundColor: bankMeta.bgColor },
            ]}>
            <MaterialIcons
              name={bankMeta.icon}
              size={18}
              color={bankMeta.color}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.bankName}>{bankMeta.shortName}</Text>
            <Text style={styles.boothName} numberOfLines={1}>
              {atm.name}
            </Text>
          </View>
        </View>

        {/* Distance Badge */}
        <View style={styles.distanceBadge}>
          <MaterialIcons name="near-me" size={12} color="#20C997" />
          <Text style={styles.distanceText}>
            {formatDistance(atm.distanceMeters)}
          </Text>
        </View>
      </View>

      {/* Address */}
      <View style={styles.addressRow}>
        <MaterialIcons name="place" size={14} color={C.onSurfaceVariant} />
        <Text style={styles.addressText} numberOfLines={2}>
          {atm.address}, {atm.area}
        </Text>
      </View>

      {/* Capabilities Tags */}
      <View style={styles.tagsRow}>
        {isCrm && (
          <View style={styles.crmTag}>
            <MaterialIcons name="savings" size={12} color="#D4A017" />
            <Text style={styles.crmTagText}>টাকা জমা (CRM Deposit)</Text>
          </View>
        )}

        {atm.capabilities.includes('FAST_TRACK') && (
          <View style={styles.fastTrackTag}>
            <MaterialIcons name="bolt" size={12} color="#38BDF8" />
            <Text style={styles.fastTrackText}>FastTrack Hub</Text>
          </View>
        )}

        {atm.capabilities.includes('OPEN_24_7') && (
          <View style={styles.openTag}>
            <MaterialIcons name="schedule" size={12} color="#20C997" />
            <Text style={styles.openTagText}>24/7 Open</Text>
          </View>
        )}

        <View style={styles.boothCountTag}>
          <Text style={styles.boothCountText}>{atm.boothCount} Machines</Text>
        </View>
      </View>

      {/* Cash Status Row */}
      <View style={styles.statusRow}>
        <View style={styles.statusIndicator}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  atm.cashStatus === 'CASH_AVAILABLE'
                    ? '#20C997'
                    : atm.cashStatus === 'OUT_OF_CASH'
                    ? '#FF6B6B'
                    : '#FF922B',
              },
            ]}
          />
          <Text style={styles.statusText}>
            {atm.cashStatus === 'CASH_AVAILABLE'
              ? 'Cash Available'
              : atm.cashStatus === 'OUT_OF_CASH'
              ? 'No Cash / Out of Order'
              : 'Low Cash Reported'}
          </Text>
        </View>

        {onReportStatus && (
          <TouchableOpacity
            onPress={() => onReportStatus(atm)}
            style={styles.reportBtn}>
            <MaterialIcons name="flag" size={12} color={C.onSurfaceVariant} />
            <Text style={styles.reportBtnText}>Update</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Action Buttons Footer */}
      <View style={styles.actionsFooter}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleDirections}
          style={styles.directionsBtn}>
          <MaterialIcons name="directions" size={16} color="#101416" />
          <Text style={styles.directionsBtnText}>Get Directions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleCall}
          style={styles.callBtn}>
          <MaterialIcons name="phone" size={16} color="#FFFFFF" />
          <Text style={styles.callBtnText}>Helpline ({atm.helplinePhone || bankMeta.helpline})</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#181F23',
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: 'transparent',
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
  bankIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankName: {
    fontFamily: F.bold,
    fontSize: 10,
    color: C.onSurfaceVariant,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  boothName: {
    fontFamily: F.bold,
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 1,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(32, 201, 151, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  distanceText: {
    fontFamily: F.bold,
    fontSize: 11,
    color: '#20C997',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  addressText: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
    flex: 1,
    lineHeight: 15,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  crmTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212, 160, 23, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  crmTagText: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#D4A017',
  },
  fastTrackTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  fastTrackText: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#38BDF8',
  },
  openTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(32, 201, 151, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  openTagText: {
    fontFamily: F.medium,
    fontSize: 10,
    color: '#20C997',
  },
  boothCountTag: {
    backgroundColor: '#13191C',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  boothCountText: {
    fontFamily: F.medium,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontFamily: F.medium,
    fontSize: 11,
    color: C.onSurface,
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  reportBtnText: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  actionsFooter: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  directionsBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#20C997',
    paddingVertical: 10,
    borderRadius: 10,
  },
  directionsBtnText: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#101416',
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#13191C',
    paddingVertical: 10,
    borderRadius: 10,
  },
  callBtnText: {
    fontFamily: F.medium,
    fontSize: 11,
    color: C.onSurface,
  },
});
