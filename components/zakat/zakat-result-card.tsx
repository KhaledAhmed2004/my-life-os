import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { RollingNumber } from '@/components/ui/rolling-number';
import { ZAKAT_COLORS } from '@/components/zakat/zakat-constants';
import { Vital } from '@/constants/vital-theme';
import { useZakatStore } from '@/stores/zakat-store';
import { ZakatResult } from '@/types/zakat';

const C = Vital.colors;
const F = Vital.fonts;

interface ZakatResultCardProps {
  result: ZakatResult;
}

export function ZakatResultCard({ result }: ZakatResultCardProps) {
  const { hawlCompleted, setHawlCompleted } = useZakatStore();

  const {
    totalZakatableAssets,
    totalDeductions,
    netZakatableWealth,
    isNisabReached,
    zakatDue,
  } = result;

  return (
    <View style={styles.card}>
      {/* 1. MATH BREAKDOWN ROW */}
      <View style={styles.breakdownRow}>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>TOTAL ASSETS</Text>
          <Text style={styles.assetsValue}>
            ৳{totalZakatableAssets.toLocaleString()}
          </Text>
        </View>

        <Text style={styles.operatorSign}>−</Text>

        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>DEDUCTIONS</Text>
          <Text style={styles.deductionsValue}>
            ৳{totalDeductions.toLocaleString()}
          </Text>
        </View>

        <Text style={styles.operatorSign}>=</Text>

        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>NET WEALTH</Text>
          <Text style={styles.netWealthValue}>
            ৳{netZakatableWealth.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* 2. HAWL (1 LUNAR YEAR) CHECKBOX */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          void Haptics.selectionAsync().catch(() => {});
          setHawlCompleted(!hawlCompleted);
        }}
        style={[
          styles.hawlBanner,
          hawlCompleted && styles.hawlBannerActive,
        ]}>
        <MaterialIcons
          name={hawlCompleted ? 'check-circle' : 'radio-button-unchecked'}
          size={18}
          color={hawlCompleted ? ZAKAT_COLORS.gold : C.onSurfaceVariant}
        />
        <View style={styles.hawlTextGroup}>
          <Text style={styles.hawlTitle}>1 Lunar Year (Hawl) Completed</Text>
          <Text style={styles.hawlSub}>
            Wealth has been in your possession for 1 full Islamic Hijri year
          </Text>
        </View>
      </TouchableOpacity>

      {/* 3. HERO GOLDEN RESULT BOX */}
      <View
        style={[
          styles.heroResultBox,
          isNisabReached && hawlCompleted
            ? styles.heroResultBoxActive
            : styles.heroResultBoxBelow,
        ]}>
        <View style={styles.heroResultTop}>
          <Text style={styles.heroResultLabel}>
            {isNisabReached && hawlCompleted
              ? 'OBLIGATORY ZAKAT DUE (2.5%)'
              : !isNisabReached
                ? 'NO ZAKAT DUE'
                : 'ZAKAT PENDING (HAWL REQUIRED)'}
          </Text>

          <View
            style={[
              styles.rateBadge,
              isNisabReached && hawlCompleted && styles.rateBadgeActive,
            ]}>
            <Text style={styles.rateBadgeText}>2.5% (1/40th)</Text>
          </View>
        </View>

        <View style={styles.amountDisplayRow}>
          <Text style={styles.currencySymbol}>৳</Text>
          <RollingNumber
            value={zakatDue}
            style={styles.zakatDueRollingNumber}
          />
        </View>

        <Text style={styles.heroSubText}>
          {isNisabReached && hawlCompleted
            ? `To be distributed among eligible beneficiaries (As-Sadaqat / 8 categories)`
            : !isNisabReached
              ? `Your net wealth is below the Nisab threshold. Voluntary charity (Sadaqah) is always encouraged.`
              : `Zakat becomes payable once the wealth has been held for a full lunar year (354 days).`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: ZAKAT_COLORS.cardBg,
    borderRadius: 20,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: ZAKAT_COLORS.tileBg,
    borderRadius: 14,
    padding: 12,
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  breakdownLabel: {
    fontFamily: F.bold,
    fontSize: 8,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  assetsValue: {
    fontFamily: F.bold,
    fontSize: 12,
    color: ZAKAT_COLORS.emerald,
  },
  deductionsValue: {
    fontFamily: F.bold,
    fontSize: 12,
    color: ZAKAT_COLORS.coral,
  },
  netWealthValue: {
    fontFamily: F.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  operatorSign: {
    fontFamily: F.bold,
    fontSize: 14,
    color: C.onSurfaceVariant,
    marginHorizontal: 2,
  },
  hawlBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ZAKAT_COLORS.tileBg,
    borderRadius: 12,
    padding: 10,
    gap: 10,
  },
  hawlBannerActive: {
    backgroundColor: ZAKAT_COLORS.goldBackground,
  },
  hawlTextGroup: {
    flex: 1,
    gap: 1,
  },
  hawlTitle: {
    fontFamily: F.bold,
    fontSize: 11,
    color: C.onSurface,
  },
  hawlSub: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  heroResultBox: {
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  heroResultBoxActive: {
    backgroundColor: ZAKAT_COLORS.goldBackground,
  },
  heroResultBoxBelow: {
    backgroundColor: ZAKAT_COLORS.tileBg,
  },
  heroResultTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroResultLabel: {
    fontFamily: F.bold,
    fontSize: 10,
    color: ZAKAT_COLORS.gold,
    letterSpacing: 0.8,
  },
  rateBadge: {
    backgroundColor: ZAKAT_COLORS.tileInner,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rateBadgeActive: {
    backgroundColor: ZAKAT_COLORS.gold,
  },
  rateBadgeText: {
    fontFamily: F.bold,
    fontSize: 9,
    color: '#0D1113',
  },
  amountDisplayRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  currencySymbol: {
    fontFamily: F.bold,
    fontSize: 22,
    color: ZAKAT_COLORS.gold,
  },
  zakatDueRollingNumber: {
    fontFamily: F.bold,
    fontSize: 32,
    color: '#FFFFFF',
  },
  heroSubText: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
    lineHeight: 15,
  },
});
