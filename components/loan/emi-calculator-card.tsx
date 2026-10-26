import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { RollingNumber } from '@/components/ui/rolling-number';
import { Vital } from '@/constants/vital-theme';
import { calculateEMI } from '@/stores/loan-store';

const C = Vital.colors;
const F = Vital.fonts;

interface EmiCalculatorCardProps {
  onSaveAsLoan?: (data: {
    principal: number;
    interestRate: number;
    tenureMonths: number;
  }) => void;
  onClose?: () => void;
}

const PRINCIPAL_PRESETS = [100000, 300000, 500000, 1000000, 2000000];
const RATE_PRESETS = [0, 8.5, 9.5, 11.0, 14.0];
const TENURE_PRESETS = [6, 12, 24, 36, 48, 60];

export function EmiCalculatorCard({ onSaveAsLoan, onClose }: EmiCalculatorCardProps) {
  const [principalText, setPrincipalText] = useState('500000');
  const [rateText, setRateText] = useState('9.5');
  const [tenureMonths, setTenureMonths] = useState(36);

  const principal = useMemo(() => {
    const val = parseFloat(principalText.replace(/,/g, ''));
    return isNaN(val) ? 0 : Math.max(0, val);
  }, [principalText]);

  const interestRate = useMemo(() => {
    const val = parseFloat(rateText);
    return isNaN(val) ? 0 : Math.max(0, val);
  }, [rateText]);

  const calculation = useMemo(() => {
    return calculateEMI(principal, interestRate, tenureMonths);
  }, [principal, interestRate, tenureMonths]);

  return (
    <View style={styles.card}>
      {/* 1. HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="calculate" size={20} color="#38BDF8" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Interactive EMI Calculator</Text>
            <Text style={styles.headerSubtitle}>Real-time loan payment & interest simulator</Text>
          </View>
        </View>

        {onClose && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onClose}
            style={styles.closeBtn}>
            <MaterialIcons name="close" size={18} color={C.onSurfaceVariant} />
          </TouchableOpacity>
        )}
      </View>

      {/* 2. HERO RESULT BENTO */}
      <View style={styles.heroResultBox}>
        <View style={styles.heroEmiRow}>
          <View>
            <Text style={styles.emiLabel}>MONTHLY EMI</Text>
            <View style={styles.amountRow}>
              <Text style={styles.currencySymbol}>৳</Text>
              <RollingNumber
                value={Math.round(calculation.monthlyEmi)}
                style={styles.emiValue}
              />
            </View>
          </View>
          <View style={styles.tenureBadge}>
            <MaterialIcons name="schedule" size={13} color="#38BDF8" />
            <Text style={styles.tenureBadgeText}>
              {tenureMonths >= 12
                ? `${tenureMonths / 12 >= 1 ? `${tenureMonths / 12} Yrs` : `${tenureMonths} Mo`}`
                : `${tenureMonths} Months`}
            </Text>
          </View>
        </View>

        {/* Progress Ratio Bar: Principal vs Interest */}
        <View style={styles.ratioContainer}>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.principalBar,
                { width: `${Math.max(5, Math.min(95, calculation.principalPercentage))}%` },
              ]}
            />
            <View
              style={[
                styles.interestBar,
                { width: `${Math.max(5, Math.min(95, calculation.interestPercentage))}%` },
              ]}
            />
          </View>

          <View style={styles.ratioLabelsRow}>
            <View style={styles.ratioItem}>
              <View style={[styles.dot, { backgroundColor: '#38BDF8' }]} />
              <Text style={styles.ratioText}>
                Principal: ৳{principal.toLocaleString()} ({calculation.principalPercentage}%)
              </Text>
            </View>
            <View style={styles.ratioItem}>
              <View style={[styles.dot, { backgroundColor: '#FF6B6B' }]} />
              <Text style={styles.ratioText}>
                Interest: ৳{Math.round(calculation.totalInterest).toLocaleString()} ({calculation.interestPercentage}%)
              </Text>
            </View>
          </View>
        </View>

        {/* Total Payable row */}
        <View style={styles.totalPayableRow}>
          <Text style={styles.totalPayableLabel}>Total Amount Payable:</Text>
          <Text style={styles.totalPayableValue}>
            ৳{Math.round(calculation.totalPayment).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* 3. INPUT CONTROLS */}
      <View style={styles.controlsSection}>
        {/* Principal Input */}
        <View style={styles.controlGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.controlLabel}>Loan Amount (Principal)</Text>
            <Text style={styles.currentValText}>৳{principal.toLocaleString()}</Text>
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputPrefix}>৳</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={principalText}
              onChangeText={(text) => setPrincipalText(text.replace(/[^0-9]/g, ''))}
              placeholder="0"
              placeholderTextColor="#5C6E79"
            />
          </View>
          <View style={styles.presetsRow}>
            {PRINCIPAL_PRESETS.map((p) => (
              <TouchableOpacity
                key={p}
                activeOpacity={0.7}
                onPress={() => {
                  void Haptics.selectionAsync().catch(() => {});
                  setPrincipalText(p.toString());
                }}
                style={[
                  styles.presetChip,
                  principal === p && styles.presetChipActive,
                ]}>
                <Text
                  style={[
                    styles.presetChipText,
                    principal === p && styles.presetChipTextActive,
                  ]}>
                  {p >= 100000 ? `${p / 100000}L` : `${p / 1000}K`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Interest Rate Input */}
        <View style={styles.controlGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.controlLabel}>Annual Interest Rate (%)</Text>
            <Text style={styles.currentValText}>{interestRate}% p.a.</Text>
          </View>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              keyboardType="decimal-pad"
              value={rateText}
              onChangeText={setRateText}
              placeholder="0.0"
              placeholderTextColor="#5C6E79"
            />
            <Text style={styles.inputSuffix}>%</Text>
          </View>
          <View style={styles.presetsRow}>
            {RATE_PRESETS.map((r) => (
              <TouchableOpacity
                key={r}
                activeOpacity={0.7}
                onPress={() => {
                  void Haptics.selectionAsync().catch(() => {});
                  setRateText(r.toString());
                }}
                style={[
                  styles.presetChip,
                  interestRate === r && styles.presetChipActive,
                ]}>
                <Text
                  style={[
                    styles.presetChipText,
                    interestRate === r && styles.presetChipTextActive,
                  ]}>
                  {r === 0 ? '0% (No-Cost)' : `${r}%`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tenure Months Presets */}
        <View style={styles.controlGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.controlLabel}>Loan Tenure (Duration)</Text>
            <Text style={styles.currentValText}>{tenureMonths} Months</Text>
          </View>
          <View style={styles.presetsRow}>
            {TENURE_PRESETS.map((m) => (
              <TouchableOpacity
                key={m}
                activeOpacity={0.7}
                onPress={() => {
                  void Haptics.selectionAsync().catch(() => {});
                  setTenureMonths(m);
                }}
                style={[
                  styles.presetChip,
                  styles.tenureChip,
                  tenureMonths === m && styles.presetChipActive,
                ]}>
                <Text
                  style={[
                    styles.presetChipText,
                    tenureMonths === m && styles.presetChipTextActive,
                  ]}>
                  {m >= 12 ? `${m / 12}Y (${m}m)` : `${m}m`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* 4. ACTIONS */}
      {onSaveAsLoan && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            onSaveAsLoan({
              principal,
              interestRate,
              tenureMonths,
            });
          }}
          style={styles.saveBtn}>
          <MaterialIcons name="add-circle-outline" size={18} color="#0D1113" />
          <Text style={styles.saveBtnText}>Track This As Active Loan</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#13191C',
    borderRadius: 20,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 5,
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
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: F.bold,
    fontSize: 15,
    color: C.onSurface,
  },
  headerSubtitle: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1C2226',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroResultBox: {
    backgroundColor: '#192024',
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  heroEmiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  emiLabel: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#38BDF8',
    letterSpacing: 0.8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 2,
  },
  currencySymbol: {
    fontFamily: F.bold,
    fontSize: 18,
    color: '#38BDF8',
  },
  emiValue: {
    fontFamily: F.bold,
    fontSize: 26,
    color: '#FFFFFF',
  },
  tenureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tenureBadgeText: {
    fontFamily: F.medium,
    fontSize: 11,
    color: '#38BDF8',
  },
  ratioContainer: {
    gap: 6,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#263137',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  principalBar: {
    height: '100%',
    backgroundColor: '#38BDF8',
  },
  interestBar: {
    height: '100%',
    backgroundColor: '#FF6B6B',
  },
  ratioLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  ratioText: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  totalPayableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopColor: '#263137',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  totalPayableLabel: {
    fontFamily: F.regular,
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  totalPayableValue: {
    fontFamily: F.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  controlsSection: {
    gap: 12,
  },
  controlGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlLabel: {
    fontFamily: F.medium,
    fontSize: 12,
    color: C.onSurface,
  },
  currentValText: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#38BDF8',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2126',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    gap: 6,
  },
  inputPrefix: {
    fontFamily: F.bold,
    fontSize: 15,
    color: C.onSurfaceVariant,
  },
  inputSuffix: {
    fontFamily: F.bold,
    fontSize: 14,
    color: C.onSurfaceVariant,
  },
  textInput: {
    flex: 1,
    fontFamily: F.bold,
    fontSize: 15,
    color: '#FFFFFF',
    padding: 0,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetChip: {
    backgroundColor: '#1C2429',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tenureChip: {
    flex: 1,
    alignItems: 'center',
    minWidth: 50,
  },
  presetChipActive: {
    backgroundColor: '#38BDF8',
  },
  presetChipText: {
    fontFamily: F.medium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  presetChipTextActive: {
    fontFamily: F.bold,
    color: '#0D1113',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#38BDF8',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
    marginTop: 4,
  },
  saveBtnText: {
    fontFamily: F.bold,
    fontSize: 13,
    color: '#0D1113',
  },
});
