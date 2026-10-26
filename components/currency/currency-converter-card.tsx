import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { SUPPORTED_CURRENCIES } from '@/components/currency/currency-constants';
import { RollingNumber } from '@/components/ui/rolling-number';
import { Vital } from '@/constants/vital-theme';
import { useCurrencyStore } from '@/stores/currency-store';
import { CurrencyCode } from '@/types/currency';

const C = Vital.colors;
const F = Vital.fonts;

const ALL_CURRENCY_CODES: CurrencyCode[] = [
  'USD',
  'EUR',
  'GBP',
  'SAR',
  'AED',
  'MYR',
  'CAD',
  'AUD',
  'SGD',
  'INR',
  'JPY',
  'BDT',
];

const PRESET_AMOUNTS = [50, 100, 500, 1000, 2500];

interface CurrencyConverterCardProps {
  onOpenFullModal?: () => void;
}

export function CurrencyConverterCard({ onOpenFullModal }: CurrencyConverterCardProps) {
  const {
    rates,
    lastUpdated,
    isLoading,
    isOffline,
    selectedFrom,
    selectedTo,
    amount,
    includeIncentive,
    fetchRates,
    setFromCurrency,
    setToCurrency,
    swapCurrencies,
    setAmount,
    toggleIncentive,
    convert,
  } = useCurrencyStore();

  const [fromPickerOpen, setFromPickerOpen] = useState(false);
  const [toPickerOpen, setToPickerOpen] = useState(false);

  const numAmount = useMemo(() => {
    const val = parseFloat(amount);
    return isNaN(val) ? 0 : Math.max(0, val);
  }, [amount]);

  const conversion = useMemo(() => {
    return convert(numAmount, selectedFrom, selectedTo, includeIncentive);
  }, [convert, numAmount, selectedFrom, selectedTo, includeIncentive, rates]);

  const fromInfo = SUPPORTED_CURRENCIES[selectedFrom];
  const toInfo = SUPPORTED_CURRENCIES[selectedTo];

  const timeAgoText = useMemo(() => {
    const diffMin = Math.max(1, Math.round((Date.now() - lastUpdated) / 60000));
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.round(diffMin / 60);
    return `${diffHours}h ago`;
  }, [lastUpdated]);

  return (
    <View style={styles.card}>
      {/* 1. TOP HEADER */}
      <View style={styles.topRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="currency-exchange" size={18} color="#FF922B" />
          </View>
          <View>
            <Text style={styles.headerTitle}>CURRENCY & REMITTANCE</Text>
            <Text style={styles.headerSubtitle}>
              Live rates • {isOffline ? 'Offline Mode' : `Updated ${timeAgoText}`}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            void fetchRates(true);
          }}
          disabled={isLoading}
          style={styles.refreshBtn}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#FF922B" />
          ) : (
            <MaterialIcons name="refresh" size={16} color={C.onSurfaceVariant} />
          )}
        </TouchableOpacity>
      </View>

      {/* 2. DUAL CURRENCY CONVERTER ROW */}
      <View style={styles.converterInputsSection}>
        {/* FROM ROW */}
        <View style={styles.currencyRowBox}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              void Haptics.selectionAsync().catch(() => {});
              setFromPickerOpen(!fromPickerOpen);
              setToPickerOpen(false);
            }}
            style={styles.currencySelectorBtn}>
            <Text style={styles.flagEmoji}>{fromInfo.flag}</Text>
            <Text style={styles.currencyCodeText}>{fromInfo.code}</Text>
            <MaterialIcons
              name={fromPickerOpen ? 'arrow-drop-up' : 'arrow-drop-down'}
              size={18}
              color={C.onSurfaceVariant}
            />
          </TouchableOpacity>

          <TextInput
            style={styles.amountInput}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            placeholderTextColor="#5C6E79"
          />
        </View>

        {/* FROM DROPDOWN PICKER */}
        {fromPickerOpen && (
          <View style={styles.pickerGrid}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.pillsScrollRow}>
                {ALL_CURRENCY_CODES.map((code) => {
                  const item = SUPPORTED_CURRENCIES[code];
                  const isSel = selectedFrom === code;
                  return (
                    <TouchableOpacity
                      key={code}
                      activeOpacity={0.75}
                      onPress={() => {
                        setFromCurrency(code);
                        setFromPickerOpen(false);
                      }}
                      style={[
                        styles.pickerPill,
                        isSel && styles.pickerPillActive,
                      ]}>
                      <Text style={styles.pickerPillFlag}>{item.flag}</Text>
                      <Text
                        style={[
                          styles.pickerPillCode,
                          isSel && styles.pickerPillCodeActive,
                        ]}>
                        {item.code}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}

        {/* SWAP BUTTON */}
        <View style={styles.swapDivider}>
          <View style={styles.swapLine} />
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={swapCurrencies}
            style={styles.swapCircleBtn}>
            <MaterialIcons name="swap-vert" size={18} color="#0D1113" />
          </TouchableOpacity>
          <View style={styles.swapLine} />
        </View>

        {/* TO ROW */}
        <View style={styles.currencyRowBox}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              void Haptics.selectionAsync().catch(() => {});
              setToPickerOpen(!toPickerOpen);
              setFromPickerOpen(false);
            }}
            style={styles.currencySelectorBtn}>
            <Text style={styles.flagEmoji}>{toInfo.flag}</Text>
            <Text style={styles.currencyCodeText}>{toInfo.code}</Text>
            <MaterialIcons
              name={toPickerOpen ? 'arrow-drop-up' : 'arrow-drop-down'}
              size={18}
              color={C.onSurfaceVariant}
            />
          </TouchableOpacity>

          <View style={styles.resultAmountWrapper}>
            <Text style={styles.resultCurrencySymbol}>{toInfo.symbol}</Text>
            <RollingNumber
              value={Math.round(conversion.toAmount * 100) / 100}
              style={styles.resultRollingText}
            />
          </View>
        </View>

        {/* TO DROPDOWN PICKER */}
        {toPickerOpen && (
          <View style={styles.pickerGrid}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.pillsScrollRow}>
                {ALL_CURRENCY_CODES.map((code) => {
                  const item = SUPPORTED_CURRENCIES[code];
                  const isSel = selectedTo === code;
                  return (
                    <TouchableOpacity
                      key={code}
                      activeOpacity={0.75}
                      onPress={() => {
                        setToCurrency(code);
                        setToPickerOpen(false);
                      }}
                      style={[
                        styles.pickerPill,
                        isSel && styles.pickerPillActive,
                      ]}>
                      <Text style={styles.pickerPillFlag}>{item.flag}</Text>
                      <Text
                        style={[
                          styles.pickerPillCode,
                          isSel && styles.pickerPillCodeActive,
                        ]}>
                        {item.code}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      {/* 3. QUICK AMOUNT PRESETS */}
      <View style={styles.presetsRow}>
        {PRESET_AMOUNTS.map((amt) => (
          <TouchableOpacity
            key={amt}
            activeOpacity={0.7}
            onPress={() => {
              void Haptics.selectionAsync().catch(() => {});
              setAmount(amt.toString());
            }}
            style={[
              styles.presetChip,
              numAmount === amt && styles.presetChipActive,
            ]}>
            <Text
              style={[
                styles.presetChipText,
                numAmount === amt && styles.presetChipTextActive,
              ]}>
              {fromInfo.symbol}{amt.toLocaleString()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 4. BANGLADESH GOVT 2.5% REMITTANCE INCENTIVE TOGGLE */}
      {selectedTo === 'BDT' && selectedFrom !== 'BDT' && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={toggleIncentive}
          style={[
            styles.incentiveBanner,
            includeIncentive && styles.incentiveBannerActive,
          ]}>
          <View style={styles.incentiveLeft}>
            <MaterialIcons
              name={includeIncentive ? 'check-box' : 'check-box-outline-blank'}
              size={18}
              color={includeIncentive ? '#20C997' : C.onSurfaceVariant}
            />
            <View>
              <Text style={styles.incentiveTitle}>+2.5% Govt Remittance Incentive</Text>
              <Text style={styles.incentiveSub}>
                Bangladesh Bank legal banking channel cash bonus
              </Text>
            </View>
          </View>

          {includeIncentive && (
            <Text style={styles.incentiveBonusText}>
              +৳{conversion.remittanceIncentiveBonus?.toLocaleString()}
            </Text>
          )}
        </TouchableOpacity>
      )}

      {/* 5. RATE FORMULA FOOTER */}
      <View style={styles.footerRateRow}>
        <Text style={styles.footerRateText}>
          1 {selectedFrom} = {conversion.rate.toFixed(4)} {selectedTo}
        </Text>
        <Text style={styles.footerRateSub}>
          1 {selectedTo} = {conversion.inverseRate.toFixed(4)} {selectedFrom}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#13191C',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
  topRow: {
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
    backgroundColor: 'rgba(255, 146, 43, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: F.bold,
    fontSize: 11,
    color: '#FF922B',
    letterSpacing: 0.8,
  },
  headerSubtitle: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  refreshBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#181F23',
    alignItems: 'center',
    justifyContent: 'center',
  },
  converterInputsSection: {
    gap: 6,
  },
  currencyRowBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#181F23',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 52,
  },
  currencySelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#20282D',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  flagEmoji: {
    fontSize: 16,
  },
  currencyCodeText: {
    fontFamily: F.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  amountInput: {
    flex: 1,
    fontFamily: F.bold,
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'right',
    padding: 0,
    marginLeft: 10,
  },
  resultAmountWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  resultCurrencySymbol: {
    fontFamily: F.bold,
    fontSize: 15,
    color: '#FF922B',
  },
  resultRollingText: {
    fontFamily: F.bold,
    fontSize: 20,
    color: '#FFFFFF',
  },
  swapDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: -4,
    zIndex: 2,
  },
  swapLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#20282D',
  },
  swapCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF922B',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  pickerGrid: {
    backgroundColor: '#181F23',
    borderRadius: 12,
    padding: 8,
    marginTop: 2,
  },
  pillsScrollRow: {
    flexDirection: 'row',
    gap: 6,
  },
  pickerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#20282D',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  pickerPillActive: {
    backgroundColor: '#FF922B',
  },
  pickerPillFlag: {
    fontSize: 12,
  },
  pickerPillCode: {
    fontFamily: F.medium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  pickerPillCodeActive: {
    fontFamily: F.bold,
    color: '#0D1113',
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  presetChip: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#181F23',
    paddingVertical: 7,
    borderRadius: 8,
  },
  presetChipActive: {
    backgroundColor: '#FF922B',
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
  incentiveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#181F23',
    borderRadius: 12,
    padding: 10,
  },
  incentiveBannerActive: {
    backgroundColor: 'rgba(32, 201, 151, 0.12)',
  },
  incentiveLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  incentiveTitle: {
    fontFamily: F.bold,
    fontSize: 11,
    color: C.onSurface,
  },
  incentiveSub: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  incentiveBonusText: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#20C997',
  },
  footerRateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  footerRateText: {
    fontFamily: F.medium,
    fontSize: 11,
    color: '#FF922B',
  },
  footerRateSub: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
});
