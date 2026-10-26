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

import {
  GOLD_NISAB_GRAMS,
  GRAMS_PER_BHORI,
  SILVER_NISAB_GRAMS,
  ZAKAT_COLORS,
} from '@/components/zakat/zakat-constants';
import { Vital } from '@/constants/vital-theme';
import { useZakatStore } from '@/stores/zakat-store';
import { ZakatNisabStandard } from '@/types/zakat';

const C = Vital.colors;
const F = Vital.fonts;

type UnitMode = 'GRAM' | 'BHORI';

const GOLD_GRAM_PRESETS = [9800, 10500, 10800, 11200];
const SILVER_GRAM_PRESETS = [150, 180, 210, 240];

export function ZakatGoldPriceEditor() {
  const {
    goldPricePerGram,
    silverPricePerGram,
    nisabStandard,
    setGoldPricePerGram,
    setSilverPricePerGram,
    setNisabStandard,
  } = useZakatStore();

  const [unitMode, setUnitMode] = useState<UnitMode>('GRAM');
  const isGold = nisabStandard === 'GOLD';

  const currentPricePerGram = isGold ? goldPricePerGram : silverPricePerGram;
  const currentPricePerBhori = Math.round(currentPricePerGram * GRAMS_PER_BHORI);

  const displayedPriceText =
    unitMode === 'GRAM'
      ? currentPricePerGram.toString()
      : currentPricePerBhori.toString();

  const calculatedNisabValue = useMemo(() => {
    return isGold
      ? Math.round(GOLD_NISAB_GRAMS * goldPricePerGram)
      : Math.round(SILVER_NISAB_GRAMS * silverPricePerGram);
  }, [isGold, goldPricePerGram, silverPricePerGram]);

  const handlePriceChange = (text: string) => {
    const numeric = parseFloat(text.replace(/[^0-9]/g, '')) || 0;
    if (unitMode === 'GRAM') {
      if (isGold) setGoldPricePerGram(numeric);
      else setSilverPricePerGram(numeric);
    } else {
      const perGram = Math.round(numeric / GRAMS_PER_BHORI);
      if (isGold) setGoldPricePerGram(perGram);
      else setSilverPricePerGram(perGram);
    }
  };

  const handleStandardToggle = (std: ZakatNisabStandard) => {
    setNisabStandard(std);
  };

  return (
    <View style={styles.container}>
      {/* Header with Standard Switcher */}
      <View style={styles.topRow}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="tune" size={16} color={ZAKAT_COLORS.gold} />
          <Text style={styles.headerTitle}>NISAB BENCHMARK & RATES</Text>
        </View>

        <View style={styles.standardSwitcher}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleStandardToggle('GOLD')}
            style={[
              styles.standardBtn,
              isGold && styles.standardBtnActive,
            ]}>
            <Text
              style={[
                styles.standardBtnText,
                isGold && styles.standardBtnTextActive,
              ]}>
              Gold (7.5 Bhori)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleStandardToggle('SILVER')}
            style={[
              styles.standardBtn,
              !isGold && styles.standardBtnActive,
            ]}>
            <Text
              style={[
                styles.standardBtnText,
                !isGold && styles.standardBtnTextActive,
              ]}>
              Silver (52.5 Bhori)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Input Row with Unit Switcher */}
      <View style={styles.priceInputBox}>
        <View style={styles.priceLeft}>
          <Text style={styles.inputLabel}>
            {isGold ? 'Gold' : 'Silver'} Market Price per{' '}
            {unitMode === 'GRAM' ? 'Gram' : 'Bhori (11.66g)'}
          </Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.takaSymbol}>৳</Text>
            <TextInput
              style={styles.priceInput}
              keyboardType="number-pad"
              value={displayedPriceText}
              onChangeText={handlePriceChange}
              placeholder="0"
              placeholderTextColor="#5C6E79"
            />
          </View>
        </View>

        {/* Unit Toggle */}
        <View style={styles.unitToggleGroup}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              void Haptics.selectionAsync().catch(() => {});
              setUnitMode('GRAM');
            }}
            style={[
              styles.unitBtn,
              unitMode === 'GRAM' && styles.unitBtnActive,
            ]}>
            <Text
              style={[
                styles.unitBtnText,
                unitMode === 'GRAM' && styles.unitBtnTextActive,
              ]}>
              / gram
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              void Haptics.selectionAsync().catch(() => {});
              setUnitMode('BHORI');
            }}
            style={[
              styles.unitBtn,
              unitMode === 'BHORI' && styles.unitBtnActive,
            ]}>
            <Text
              style={[
                styles.unitBtnText,
                unitMode === 'BHORI' && styles.unitBtnTextActive,
              ]}>
              / bhori
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Preset Chips */}
      <View style={styles.presetsRow}>
        {(isGold ? GOLD_GRAM_PRESETS : SILVER_GRAM_PRESETS).map((p) => {
          const isSelected = isGold
            ? goldPricePerGram === p
            : silverPricePerGram === p;
          const displayLabel =
            unitMode === 'GRAM'
              ? `৳${p.toLocaleString()}/g`
              : `৳${Math.round(p * GRAMS_PER_BHORI).toLocaleString()}/bhori`;

          return (
            <TouchableOpacity
              key={p}
              activeOpacity={0.75}
              onPress={() => {
                void Haptics.selectionAsync().catch(() => {});
                if (isGold) setGoldPricePerGram(p);
                else setSilverPricePerGram(p);
              }}
              style={[
                styles.presetChip,
                isSelected && styles.presetChipActive,
              ]}>
              <Text
                style={[
                  styles.presetChipText,
                  isSelected && styles.presetChipTextActive,
                ]}>
                {displayLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Calculated Nisab Threshold Summary Banner */}
      <View style={styles.nisabSummaryBanner}>
        <Text style={styles.nisabFormulaText}>
          {isGold ? '87.48 grams (7.5 Bhori)' : '612.36 grams (52.5 Bhori)'} × ৳
          {currentPricePerGram.toLocaleString()}/g
        </Text>
        <Text style={styles.nisabResultText}>
          Nisab = ৳{calculatedNisabValue.toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: ZAKAT_COLORS.tileBg,
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  topRow: {
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
    color: ZAKAT_COLORS.gold,
    letterSpacing: 0.7,
  },
  standardSwitcher: {
    flexDirection: 'row',
    backgroundColor: ZAKAT_COLORS.tileInner,
    borderRadius: 8,
    padding: 2,
  },
  standardBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  standardBtnActive: {
    backgroundColor: ZAKAT_COLORS.gold,
  },
  standardBtnText: {
    fontFamily: F.medium,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  standardBtnTextActive: {
    fontFamily: F.bold,
    color: '#0D1113',
  },
  priceInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: ZAKAT_COLORS.tileInner,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  priceLeft: {
    flex: 1,
    gap: 2,
  },
  inputLabel: {
    fontFamily: F.medium,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  takaSymbol: {
    fontFamily: F.bold,
    fontSize: 16,
    color: ZAKAT_COLORS.gold,
  },
  priceInput: {
    flex: 1,
    fontFamily: F.bold,
    fontSize: 18,
    color: '#FFFFFF',
    padding: 0,
  },
  unitToggleGroup: {
    flexDirection: 'column',
    backgroundColor: '#13191C',
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  unitBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignItems: 'center',
  },
  unitBtnActive: {
    backgroundColor: ZAKAT_COLORS.gold,
  },
  unitBtnText: {
    fontFamily: F.medium,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  unitBtnTextActive: {
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
    backgroundColor: ZAKAT_COLORS.tileInner,
    paddingVertical: 6,
    borderRadius: 8,
  },
  presetChipActive: {
    backgroundColor: ZAKAT_COLORS.gold,
  },
  presetChipText: {
    fontFamily: F.medium,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  presetChipTextActive: {
    fontFamily: F.bold,
    color: '#0D1113',
  },
  nisabSummaryBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: ZAKAT_COLORS.goldBackground,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  nisabFormulaText: {
    fontFamily: F.regular,
    fontSize: 10,
    color: ZAKAT_COLORS.goldLight,
  },
  nisabResultText: {
    fontFamily: F.bold,
    fontSize: 11,
    color: ZAKAT_COLORS.gold,
  },
});
