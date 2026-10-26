import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { RollingNumber } from '@/components/ui/rolling-number';
import { Vital } from '@/constants/vital-theme';
import { useExpenseStore } from '@/stores/expense-store';
import { useWarrantyStore } from '@/stores/warranty-store';

const C = Vital.colors;
const F = Vital.fonts;

interface WarrantyHeroBentoProps {
  onAddPress: () => void;
  onFilterPress?: (filter: 'ALL' | 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED') => void;
}

export function WarrantyHeroBento({ onAddPress, onFilterPress }: WarrantyHeroBentoProps) {
  const getStats = useWarrantyStore((s) => s.getStats);
  const getExpiringSoonItems = useWarrantyStore((s) => s.getExpiringSoonItems);
  const isPrivacyMode = useExpenseStore((s) => s.isPrivacyMode);

  const stats = getStats();
  const expiringItems = getExpiringSoonItems(30);

  return (
    <View style={styles.card}>
      {/* 1. TOP BAR: TITLE + ADD ACTION */}
      <View style={styles.topBar}>
        <View style={styles.titleRow}>
          <View style={styles.pulseDot} />
          <Text style={styles.sectionLabel}>WARRANTY & RECEIPT VAULT</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.82}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            onAddPress();
          }}
          style={styles.addBtn}>
          <MaterialIcons name="add" size={15} color="#101416" />
          <Text style={styles.addBtnText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      {/* 2. PROTECTED VALUE HERO DISPLAY */}
      <View style={styles.heroSection}>
        <Text style={styles.heroLabel}>Total Asset Value Under Warranty</Text>
        {isPrivacyMode ? (
          <Text style={styles.heroHiddenText}>•••••••• ৳</Text>
        ) : (
          <View style={styles.heroValueRow}>
            <RollingNumber
              value={stats.totalProtectedValue}
              prefix="৳ "
              style={styles.heroAmount}
            />
            <View style={styles.itemsCountPill}>
              <Text style={styles.itemsCountText}>
                {stats.totalItems} {stats.totalItems === 1 ? 'item' : 'items'}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* 3. BENTO TRIPLE STATS ROW */}
      <View style={styles.bentoRow}>
        {/* ACTIVE TILE */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            onFilterPress?.('ACTIVE');
          }}
          style={styles.bentoTileActive}>
          <View style={styles.bentoTileHeader}>
            <View style={styles.iconSquircleActive}>
              <MaterialIcons name="verified" size={13} color="#20C997" />
            </View>
            <Text style={styles.bentoNumberActive}>{stats.activeCount}</Text>
          </View>
          <Text style={styles.bentoLabel}>ACTIVE</Text>
        </TouchableOpacity>

        {/* EXPIRING SOON TILE */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            onFilterPress?.('EXPIRING_SOON');
          }}
          style={[
            styles.bentoTileExpiring,
            stats.expiringSoonCount > 0 && styles.bentoTileExpiringAlert,
          ]}>
          <View style={styles.bentoTileHeader}>
            <View style={styles.iconSquircleExpiring}>
              <MaterialIcons name="timer" size={13} color="#FCC419" />
            </View>
            <Text style={styles.bentoNumberExpiring}>{stats.expiringSoonCount}</Text>
          </View>
          <Text style={styles.bentoLabel}>EXPIRING SOON</Text>
        </TouchableOpacity>

        {/* CLAIMS RECOVERED TILE */}
        <View style={styles.bentoTileClaims}>
          <View style={styles.bentoTileHeader}>
            <View style={styles.iconSquircleClaims}>
              <MaterialIcons name="security" size={13} color="#38BDF8" />
            </View>
            <Text style={styles.bentoNumberClaims}>
              {isPrivacyMode ? '••••' : `৳ ${(stats.totalClaimsSaved / 1000).toFixed(1)}k`}
            </Text>
          </View>
          <Text style={styles.bentoLabel}>CLAIMS SAVED</Text>
        </View>
      </View>

      {/* 4. EXPIRY ALERT BANNER IF ITEMS EXPIRING SOON */}
      {expiringItems.length > 0 && (
        <View style={styles.alertBanner}>
          <MaterialIcons name="warning-amber" size={16} color="#FCC419" />
          <View style={{ flex: 1, gap: 1 }}>
            <Text style={styles.alertTitle}>
              {expiringItems.length} {expiringItems.length === 1 ? 'warranty is' : 'warranties are'} expiring within 30 days
            </Text>
            <Text style={styles.alertSubtitle} numberOfLines={1}>
              {expiringItems.map((i) => i.productName).join(', ')}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#13191C',
    borderRadius: 20,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 5,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF922B',
  },
  sectionLabel: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: C.onSurfaceVariant,
    letterSpacing: 0.8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF922B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9,
  },
  addBtnText: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: '#101416',
  },
  heroSection: {
    gap: 3,
  },
  heroLabel: {
    fontFamily: F.sansMedium,
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  heroValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroAmount: {
    fontFamily: F.sansBold,
    fontSize: 26,
    color: '#FFFFFF',
    letterSpacing: -0.6,
  },
  heroHiddenText: {
    fontFamily: F.sansBold,
    fontSize: 24,
    color: C.onSurface,
  },
  itemsCountPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
  },
  itemsCountText: {
    fontFamily: F.sansMedium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bentoTileActive: {
    flex: 1,
    backgroundColor: 'rgba(32, 201, 151, 0.06)',
    borderRadius: 12,
    padding: 9,
    gap: 4,
  },
  bentoTileExpiring: {
    flex: 1,
    backgroundColor: 'rgba(252, 196, 25, 0.06)',
    borderRadius: 12,
    padding: 9,
    gap: 4,
  },
  bentoTileExpiringAlert: {
    backgroundColor: 'rgba(252, 196, 25, 0.12)',
  },
  bentoTileClaims: {
    flex: 1,
    backgroundColor: 'rgba(56, 189, 248, 0.06)',
    borderRadius: 12,
    padding: 9,
    gap: 4,
  },
  bentoTileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconSquircleActive: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(32, 201, 151, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSquircleExpiring: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(252, 196, 25, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSquircleClaims: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoNumberActive: {
    fontFamily: F.sansBold,
    fontSize: 16,
    color: '#20C997',
  },
  bentoNumberExpiring: {
    fontFamily: F.sansBold,
    fontSize: 16,
    color: '#FCC419',
  },
  bentoNumberClaims: {
    fontFamily: F.sansBold,
    fontSize: 14,
    color: '#38BDF8',
  },
  bentoLabel: {
    fontFamily: F.sansBold,
    fontSize: 9,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(252, 196, 25, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  alertTitle: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: '#FCC419',
  },
  alertSubtitle: {
    fontFamily: F.sans,
    fontSize: 10,
    color: 'rgba(252, 196, 25, 0.8)',
  },
});
