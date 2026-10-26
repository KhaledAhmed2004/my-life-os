import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import React, { useMemo } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { formatDistance, useAtmStore } from '@/stores/atm-store';
import { Vital } from '@/constants/vital-theme';

const C = Vital.colors;
const F = Vital.fonts;

interface AtmRadarSummaryCardProps {
  onOpenAtmRadar: () => void;
}

export function AtmRadarSummaryCard({
  onOpenAtmRadar,
}: AtmRadarSummaryCardProps) {
  const atms = useAtmStore((s) => s.atms);
  const userLocation = useAtmStore((s) => s.userLocation);
  const getFilteredAtms = useAtmStore((s) => s.getFilteredAtms);
  const getNearestAtm = useAtmStore((s) => s.getNearestAtm);

  const nearestAtm = useMemo(() => getNearestAtm(), [getNearestAtm, atms, userLocation]);
  const allFiltered = useMemo(() => getFilteredAtms(), [getFilteredAtms, atms, userLocation]);

  const nearby1kmCount = useMemo(
    () => allFiltered.filter((a) => (a.distanceMeters || 0) <= 1000).length,
    [allFiltered]
  );

  const crmCount = useMemo(
    () => allFiltered.filter((a) => a.capabilities.includes('CASH_DEPOSIT_CRM')).length,
    [allFiltered]
  );

  const handleDirections = (e: any) => {
    e.stopPropagation();
    if (!nearestAtm) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    const lat = nearestAtm.latitude;
    const lon = nearestAtm.longitude;
    const label = encodeURIComponent(nearestAtm.name);

    let url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
    if (Platform.OS === 'ios') {
      url = `maps:0,0?q=${label}@${lat},${lon}`;
    }
    void Linking.openURL(url).catch(() => {
      void Linking.openURL(`https://maps.google.com/?q=${lat},${lon}`);
    });
  };

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onOpenAtmRadar();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handlePress}
      style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="local-atm" size={18} color="#20C997" />
          </View>
          <View>
            <Text style={styles.title}>NEARBY ATM & CASH RADAR</Text>
            <Text style={styles.subtitle}>
              Live GPS Distance • CRM Cash Deposit Finder
            </Text>
          </View>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {nearby1kmCount > 0 ? `${nearby1kmCount} in 1 km` : `${allFiltered.length} Booths`}
          </Text>
        </View>
      </View>

      {/* Nearest ATM Showcase */}
      {nearestAtm ? (
        <View style={styles.nearestHero}>
          <View style={styles.nearestTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nearestLabel}>NEAREST FAST CASH BOOTH</Text>
              <Text style={styles.nearestName} numberOfLines={1}>
                {nearestAtm.name}
              </Text>
              <Text style={styles.nearestAddress} numberOfLines={1}>
                {nearestAtm.address}
              </Text>
            </View>

            <View style={styles.distanceBadge}>
              <MaterialIcons name="near-me" size={12} color="#20C997" />
              <Text style={styles.distanceText}>
                {formatDistance(nearestAtm.distanceMeters)}
              </Text>
            </View>
          </View>

          {/* Action Row */}
          <View style={styles.nearestActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleDirections}
              style={styles.directionsBtn}>
              <MaterialIcons name="directions" size={14} color="#101416" />
              <Text style={styles.directionsBtnText}>Directions to Nearest</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* Bento Sub-Metrics */}
      <View style={styles.bentoRow}>
        <View style={styles.bentoItem}>
          <Text style={styles.bentoLabel}>CRM DEPOSIT MACHINES</Text>
          <Text style={[styles.bentoVal, { color: '#D4A017' }]}>
            {crmCount} Available
          </Text>
          <Text style={styles.bentoSub}>টাকা জমা দেওয়ার বুথ</Text>
        </View>

        <View style={styles.bentoItem}>
          <Text style={styles.bentoLabel}>BANKS COVERED</Text>
          <Text style={[styles.bentoVal, { color: '#38BDF8' }]}>
            DBBL, BRAC, City +
          </Text>
          <Text style={styles.bentoSub}>Major BD Banks</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footerRow}>
        <View style={styles.footerTip}>
          <MaterialIcons name="map" size={14} color="#20C997" />
          <Text style={styles.footerTipText} numberOfLines={1}>
            Interactive Dark Map with 1-tap Google Navigation
          </Text>
        </View>

        <View style={styles.chevronRow}>
          <Text style={styles.manageText}>ATM Studio</Text>
          <MaterialIcons name="chevron-right" size={16} color="#20C997" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#13191C',
    borderRadius: 20,
    padding: 16,
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
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(32, 201, 151, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  subtitle: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  badge: {
    backgroundColor: 'rgba(32, 201, 151, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#20C997',
  },
  nearestHero: {
    backgroundColor: '#181F23',
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  nearestTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  nearestLabel: {
    fontFamily: F.bold,
    fontSize: 8,
    color: '#20C997',
    letterSpacing: 0.5,
  },
  nearestName: {
    fontFamily: F.bold,
    fontSize: 13,
    color: '#FFFFFF',
    marginTop: 2,
  },
  nearestAddress: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
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
  nearestActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
    paddingTop: 8,
  },
  directionsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#20C997',
    paddingVertical: 8,
    borderRadius: 8,
  },
  directionsBtnText: {
    fontFamily: F.bold,
    fontSize: 11,
    color: '#101416',
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  bentoItem: {
    flex: 1,
    backgroundColor: '#181F23',
    borderRadius: 12,
    padding: 10,
    gap: 2,
  },
  bentoLabel: {
    fontFamily: F.bold,
    fontSize: 9,
    color: C.onSurfaceVariant,
    letterSpacing: 0.4,
  },
  bentoVal: {
    fontFamily: F.bold,
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 2,
  },
  bentoSub: {
    fontFamily: F.regular,
    fontSize: 9,
    color: C.onSurfaceVariant,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  footerTip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  footerTipText: {
    fontFamily: F.medium,
    fontSize: 10,
    color: C.onSurfaceVariant,
    flex: 1,
  },
  chevronRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  manageText: {
    fontFamily: F.bold,
    fontSize: 11,
    color: '#20C997',
  },
});
