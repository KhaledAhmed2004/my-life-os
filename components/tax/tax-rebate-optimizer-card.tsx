import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTaxStore } from '@/stores/tax-store';
import { Vital } from '@/constants/vital-theme';
import { TaxCalculationResult } from '@/types/tax';

const C = Vital.colors;
const F = Vital.fonts;

interface TaxRebateOptimizerCardProps {
  taxResult: TaxCalculationResult;
  onOpenInvestments?: () => void;
}

export function TaxRebateOptimizerCard({
  taxResult,
  onOpenInvestments,
}: TaxRebateOptimizerCardProps) {
  const syncWithInvestmentVault = useTaxStore((s) => s.syncWithInvestmentVault);

  const {
    actualInvestmentTotal,
    allowableInvestmentCeiling,
    taxRebateAmount,
    maxPossibleRebate,
    optimalInvestmentGap,
  } = taxResult;

  const extraSavingsPossible = Math.round(optimalInvestmentGap * 0.15);
  const isMaxedOut = optimalInvestmentGap <= 0 || taxRebateAmount >= taxResult.grossTaxLiability;

  const handleSync = () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    syncWithInvestmentVault();
  };

  return (
    <View style={styles.card}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="savings" size={16} color="#D4A017" />
          </View>
          <View>
            <Text style={styles.headerTitle}>15% INVESTMENT TAX REBATE</Text>
            <Text style={styles.headerSub}>
              DPS, Sanchay Patra, Stocks & GPF exemption (৩য় তফসিল)
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSync}
          style={styles.syncBtn}>
          <MaterialIcons name="sync" size={12} color="#D4A017" />
          <Text style={styles.syncBtnText}>Sync Vault</Text>
        </TouchableOpacity>
      </View>

      {/* Rebate Numbers Bento */}
      <View style={styles.bentoRow}>
        <View style={styles.bentoTile}>
          <Text style={styles.bentoLabel}>TOTAL INVESTMENTS</Text>
          <Text style={styles.bentoAmount}>
            ৳{actualInvestmentTotal.toLocaleString()}
          </Text>
          <Text style={styles.bentoSub}>
            Ceiling: ৳{allowableInvestmentCeiling.toLocaleString()}
          </Text>
        </View>

        <View style={[styles.bentoTile, styles.bentoTileRebate]}>
          <Text style={[styles.bentoLabel, { color: '#20C997' }]}>TAX SAVED (15% REBATE)</Text>
          <Text style={[styles.bentoAmount, { color: '#20C997' }]}>
            -৳{taxRebateAmount.toLocaleString()}
          </Text>
          <Text style={styles.bentoSub}>
            Max Possible: ৳{maxPossibleRebate.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Optimization Advisor Tip Box */}
      <View
        style={[
          styles.tipBox,
          isMaxedOut ? styles.tipBoxSuccess : styles.tipBoxAction,
        ]}>
        <MaterialIcons
          name={isMaxedOut ? 'check-circle' : 'lightbulb'}
          size={18}
          color={isMaxedOut ? '#20C997' : '#FCC419'}
        />
        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={[
              styles.tipTitle,
              { color: isMaxedOut ? '#20C997' : '#FCC419' },
            ]}>
            {isMaxedOut ? 'TAX REBATE OPTIMIZED' : 'CLAIM EXTRA TAX SAVINGS'}
          </Text>
          <Text style={styles.tipText}>
            {isMaxedOut
              ? 'You have fully maximized your eligible investment tax rebate ceiling for this financial year.'
              : `Invest ৳${optimalInvestmentGap.toLocaleString()} more in DPS or Sanchay Patra to save an extra ৳${extraSavingsPossible.toLocaleString()} directly from your tax bill!`}
          </Text>
        </View>
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
  headerRow: {
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
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(212, 160, 23, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#D4A017',
    letterSpacing: 0.6,
  },
  headerSub: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212, 160, 23, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  syncBtnText: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#D4A017',
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  bentoTile: {
    flex: 1,
    backgroundColor: '#13191C',
    borderRadius: 12,
    padding: 10,
    gap: 2,
  },
  bentoTileRebate: {
    borderWidth: 1,
    borderColor: 'rgba(32, 201, 151, 0.2)',
  },
  bentoLabel: {
    fontFamily: F.bold,
    fontSize: 9,
    color: C.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  bentoAmount: {
    fontFamily: F.bold,
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 2,
  },
  bentoSub: {
    fontFamily: F.regular,
    fontSize: 9,
    color: C.onSurfaceVariant,
  },
  tipBox: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 10,
    gap: 8,
    alignItems: 'flex-start',
  },
  tipBoxAction: {
    backgroundColor: 'rgba(252, 196, 25, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(252, 196, 25, 0.2)',
  },
  tipBoxSuccess: {
    backgroundColor: 'rgba(32, 201, 151, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(32, 201, 151, 0.2)',
  },
  tipTitle: {
    fontFamily: F.bold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  tipText: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurface,
    lineHeight: 15,
  },
});
