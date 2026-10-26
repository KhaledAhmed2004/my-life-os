import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ZAKAT_COLORS } from '@/components/zakat/zakat-constants';
import { Vital } from '@/constants/vital-theme';
import { useZakatStore } from '@/stores/zakat-store';

const C = Vital.colors;
const F = Vital.fonts;

interface ZakatAutoAssetsSectionProps {
  savingsBalance: number;
  receivableDebts: number;
}

export function ZakatAutoAssetsSection({
  savingsBalance,
  receivableDebts,
}: ZakatAutoAssetsSectionProps) {
  const {
    includeSavingsVaults,
    includeDebtsReceivable,
    setIncludeStoreItem,
  } = useZakatStore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="sync" size={16} color={ZAKAT_COLORS.emerald} />
          <Text style={styles.headerTitle}>AUTO-SYNCED ASSETS</Text>
        </View>
        <Text style={styles.headerSubtitle}>From Vaults & Debt Ledger</Text>
      </View>

      <View style={styles.itemsList}>
        {/* 1. SAVINGS VAULTS */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            void Haptics.selectionAsync().catch(() => {});
            setIncludeStoreItem('includeSavingsVaults', !includeSavingsVaults);
          }}
          style={[
            styles.itemCard,
            !includeSavingsVaults && styles.itemCardDisabled,
          ]}>
          <View style={styles.itemLeft}>
            <MaterialIcons
              name={includeSavingsVaults ? 'check-box' : 'check-box-outline-blank'}
              size={18}
              color={includeSavingsVaults ? ZAKAT_COLORS.emerald : C.onSurfaceVariant}
            />
            <View style={styles.itemIconCircle}>
              <MaterialIcons name="savings" size={16} color="#339AF0" />
            </View>
            <View>
              <Text style={styles.itemTitle}>Savings Goals & Vaults</Text>
              <Text style={styles.itemSubtitle}>Target savings & emergency funds</Text>
            </View>
          </View>

          <View style={styles.itemRight}>
            <Text
              style={[
                styles.itemAmount,
                !includeSavingsVaults && styles.itemAmountDisabled,
              ]}>
              ৳{savingsBalance.toLocaleString()}
            </Text>
            <View style={styles.syncBadge}>
              <Text style={styles.syncBadgeText}>LIVE</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 2. MONEY RECEIVABLE (LENT) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            void Haptics.selectionAsync().catch(() => {});
            setIncludeStoreItem('includeDebtsReceivable', !includeDebtsReceivable);
          }}
          style={[
            styles.itemCard,
            !includeDebtsReceivable && styles.itemCardDisabled,
          ]}>
          <View style={styles.itemLeft}>
            <MaterialIcons
              name={includeDebtsReceivable ? 'check-box' : 'check-box-outline-blank'}
              size={18}
              color={includeDebtsReceivable ? ZAKAT_COLORS.emerald : C.onSurfaceVariant}
            />
            <View style={styles.itemIconCircle}>
              <MaterialIcons name="call-made" size={16} color="#51CF66" />
            </View>
            <View>
              <Text style={styles.itemTitle}>Money Lent (Udhaar Receivable)</Text>
              <Text style={styles.itemSubtitle}>Recoverable loans given to others</Text>
            </View>
          </View>

          <View style={styles.itemRight}>
            <Text
              style={[
                styles.itemAmount,
                !includeDebtsReceivable && styles.itemAmountDisabled,
              ]}>
              ৳{receivableDebts.toLocaleString()}
            </Text>
            <View style={styles.syncBadge}>
              <Text style={styles.syncBadgeText}>LIVE</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: ZAKAT_COLORS.tileBg,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontFamily: F.bold,
    fontSize: 10,
    color: ZAKAT_COLORS.emerald,
    letterSpacing: 0.7,
  },
  headerSubtitle: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  itemsList: {
    gap: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: ZAKAT_COLORS.tileInner,
    borderRadius: 12,
    padding: 10,
  },
  itemCardDisabled: {
    opacity: 0.5,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  itemIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#13191C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontFamily: F.bold,
    fontSize: 11,
    color: C.onSurface,
  },
  itemSubtitle: {
    fontFamily: F.regular,
    fontSize: 9,
    color: C.onSurfaceVariant,
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  itemAmount: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  itemAmountDisabled: {
    color: C.onSurfaceVariant,
  },
  syncBadge: {
    backgroundColor: ZAKAT_COLORS.emeraldLight,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  syncBadgeText: {
    fontFamily: F.bold,
    fontSize: 8,
    color: ZAKAT_COLORS.emerald,
    letterSpacing: 0.5,
  },
});
