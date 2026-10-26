import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  BANKS_METADATA,
  RADIUS_PRESETS,
} from '@/components/atm/atm-constants';
import { useAtmStore } from '@/stores/atm-store';
import { Vital } from '@/constants/vital-theme';
import { BankCode } from '@/types/atm';

const C = Vital.colors;
const F = Vital.fonts;

const ALL_BANKS: BankCode[] = [
  'DBBL',
  'BRAC',
  'CITY',
  'IBBL',
  'EBL',
  'SCB',
  'UCB',
  'SONALI',
  'BKASH_PRIORITY',
];

interface AtmFilterSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function AtmFilterSheet({ visible, onClose }: AtmFilterSheetProps) {
  const filters = useAtmStore((s) => s.filters);
  const setFilters = useAtmStore((s) => s.setFilters);
  const resetFilters = useAtmStore((s) => s.resetFilters);

  const toggleBank = (bank: BankCode) => {
    void Haptics.selectionAsync().catch(() => {});
    const exists = filters.selectedBanks.includes(bank);
    let updated: BankCode[];
    if (exists) {
      updated = filters.selectedBanks.filter((b) => b !== bank);
    } else {
      updated = [...filters.selectedBanks, bank];
    }
    setFilters({ selectedBanks: updated });
  };

  const selectAllBanks = () => {
    void Haptics.selectionAsync().catch(() => {});
    setFilters({ selectedBanks: [] });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="tune" size={18} color="#38BDF8" />
              </View>
              <Text style={styles.title}>ATM & Bank Filters</Text>
            </View>

            <TouchableOpacity
              onPress={resetFilters}
              style={styles.resetBtn}>
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}>
            {/* 1. Distance Radius */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>DISTANCE RADIUS (দূরত্ব)</Text>
              <View style={styles.radiusRow}>
                {RADIUS_PRESETS.map((p) => {
                  const isSelected = filters.maxDistanceKm === p.id;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      activeOpacity={0.8}
                      onPress={() => {
                        void Haptics.selectionAsync().catch(() => {});
                        setFilters({ maxDistanceKm: p.id });
                      }}
                      style={[
                        styles.radiusChip,
                        isSelected && styles.radiusChipActive,
                      ]}>
                      <Text
                        style={[
                          styles.radiusChipText,
                          isSelected && styles.radiusChipTextActive,
                        ]}>
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 2. Capability Switches */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>BOOTH CAPABILITIES</Text>

              <View style={styles.switchRow}>
                <View style={styles.switchLeft}>
                  <MaterialIcons name="savings" size={18} color="#D4A017" />
                  <View>
                    <Text style={styles.switchTitle}>
                      CRM Cash Deposit Only (টাকা জমা)
                    </Text>
                    <Text style={styles.switchSub}>
                      Show booths with cash deposit machines
                    </Text>
                  </View>
                </View>

                <Switch
                  value={filters.onlyCrmDeposit}
                  onValueChange={(val) => setFilters({ onlyCrmDeposit: val })}
                  trackColor={{ false: '#263035', true: '#D4A017' }}
                />
              </View>

              <View style={styles.switchRow}>
                <View style={styles.switchLeft}>
                  <MaterialIcons name="bolt" size={18} color="#38BDF8" />
                  <View>
                    <Text style={styles.switchTitle}>
                      FastTrack Hubs Only
                    </Text>
                    <Text style={styles.switchSub}>
                      Multi-machine 24/7 customer service booths
                    </Text>
                  </View>
                </View>

                <Switch
                  value={filters.onlyFastTrack}
                  onValueChange={(val) => setFilters({ onlyFastTrack: val })}
                  trackColor={{ false: '#263035', true: '#38BDF8' }}
                />
              </View>
            </View>

            {/* 3. Bank Networks */}
            <View style={styles.section}>
              <View style={styles.bankHeaderRow}>
                <Text style={styles.sectionTitle}>SELECT BANKS</Text>
                <TouchableOpacity onPress={selectAllBanks}>
                  <Text style={styles.selectAllText}>
                    {filters.selectedBanks.length === 0 ? 'All Selected' : 'Show All'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.banksGrid}>
                {ALL_BANKS.map((b) => {
                  const meta = BANKS_METADATA[b];
                  const isSelected =
                    filters.selectedBanks.length === 0 ||
                    filters.selectedBanks.includes(b);

                  return (
                    <TouchableOpacity
                      key={b}
                      activeOpacity={0.8}
                      onPress={() => toggleBank(b)}
                      style={[
                        styles.bankChip,
                        isSelected && {
                          backgroundColor: meta.bgColor,
                          borderColor: meta.color,
                        },
                      ]}>
                      <MaterialIcons
                        name={meta.icon}
                        size={14}
                        color={isSelected ? meta.color : C.onSurfaceVariant}
                      />
                      <Text
                        style={[
                          styles.bankChipText,
                          isSelected && { color: '#FFFFFF', fontFamily: F.bold },
                        ]}>
                        {meta.shortName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Apply Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              style={styles.applyBtn}>
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#101416',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
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
  title: {
    fontFamily: F.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  resetBtn: {
    padding: 6,
  },
  resetBtnText: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#FF6B6B',
  },
  scrollBody: {
    padding: 16,
    gap: 16,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontFamily: F.bold,
    fontSize: 10,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  radiusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  radiusChip: {
    flex: 1,
    backgroundColor: '#181F23',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  radiusChipActive: {
    backgroundColor: '#38BDF8',
  },
  radiusChipText: {
    fontFamily: F.medium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  radiusChipTextActive: {
    fontFamily: F.bold,
    color: '#101416',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#181F23',
    padding: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 10,
  },
  switchTitle: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  switchSub: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  bankHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectAllText: {
    fontFamily: F.bold,
    fontSize: 11,
    color: '#38BDF8',
  },
  banksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bankChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#181F23',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  bankChipText: {
    fontFamily: F.medium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  applyBtn: {
    backgroundColor: '#38BDF8',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  applyBtnText: {
    fontFamily: F.bold,
    fontSize: 13,
    color: '#101416',
  },
});
