import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  BANKS_METADATA,
  RADIUS_PRESETS,
} from '@/components/atm/atm-constants';
import { AtmBoothCard } from '@/components/atm/atm-booth-card';
import { AtmFilterSheet } from '@/components/atm/atm-filter-sheet';
import { AtmMapView } from '@/components/atm/atm-map-view';
import { AtmReportStatusModal } from '@/components/atm/atm-report-status-modal';
import { useAtmStore } from '@/stores/atm-store';
import { Vital } from '@/constants/vital-theme';
import { AtmLocation, BankCode } from '@/types/atm';

const C = Vital.colors;
const F = Vital.fonts;

type ViewMode = 'LIST' | 'MAP';

interface AtmRadarModalProps {
  visible: boolean;
  onClose: () => void;
}

const POPULAR_BANKS: { code: BankCode | 'ALL'; label: string }[] = [
  { code: 'ALL', label: 'All Banks' },
  { code: 'DBBL', label: 'DBBL' },
  { code: 'BRAC', label: 'BRAC' },
  { code: 'CITY', label: 'City Bank' },
  { code: 'IBBL', label: 'Islami Bank' },
  { code: 'EBL', label: 'EBL' },
  { code: 'BKASH_PRIORITY', label: 'bKash' },
];

export function AtmRadarModal({ visible, onClose }: AtmRadarModalProps) {
  const atms = useAtmStore((s) => s.atms);
  const userLocation = useAtmStore((s) => s.userLocation);
  const isLoadingLocation = useAtmStore((s) => s.isLoadingLocation);
  const requestUserLocation = useAtmStore((s) => s.requestUserLocation);
  const filters = useAtmStore((s) => s.filters);
  const setFilters = useAtmStore((s) => s.setFilters);
  const getFilteredAtms = useAtmStore((s) => s.getFilteredAtms);
  const selectedAtmId = useAtmStore((s) => s.selectedAtmId);
  const setSelectedAtmId = useAtmStore((s) => s.setSelectedAtmId);

  const [viewMode, setViewMode] = useState<ViewMode>('LIST');
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [statusModalAtm, setStatusModalAtm] = useState<AtmLocation | null>(null);

  const filteredAtms = useMemo(() => getFilteredAtms(), [getFilteredAtms, atms, filters, userLocation]);

  const selectedAtm = useMemo(
    () => filteredAtms.find((a) => a.id === selectedAtmId) || filteredAtms[0] || null,
    [filteredAtms, selectedAtmId]
  );

  const handleQuickBank = (code: BankCode | 'ALL') => {
    void Haptics.selectionAsync().catch(() => {});
    if (code === 'ALL') {
      setFilters({ selectedBanks: [] });
    } else {
      setFilters({ selectedBanks: [code] });
    }
  };

  const handleQuickRadius = (radiusKm: number) => {
    void Haptics.selectionAsync().catch(() => {});
    setFilters({ maxDistanceKm: radiusKm });
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
                <MaterialIcons name="local-atm" size={20} color="#20C997" />
              </View>
              <View>
                <Text style={styles.title}>Nearby ATM Radar</Text>
                <Text style={styles.subtitle}>
                  {filteredAtms.length} Booths Found • GPS Live Distance
                </Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  void requestUserLocation();
                }}
                style={styles.gpsBtn}>
                {isLoadingLocation ? (
                  <ActivityIndicator size="small" color="#38BDF8" />
                ) : (
                  <MaterialIcons name="gps-fixed" size={18} color="#38BDF8" />
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <MaterialIcons name="close" size={20} color={C.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar & View Mode Switcher */}
          <View style={styles.searchRow}>
            <View style={styles.searchBar}>
              <MaterialIcons name="search" size={18} color={C.onSurfaceVariant} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search area, bank or booth..."
                placeholderTextColor={C.onSurfaceVariant}
                value={filters.searchQuery}
                onChangeText={(text) => setFilters({ searchQuery: text })}
              />
              {filters.searchQuery ? (
                <TouchableOpacity onPress={() => setFilters({ searchQuery: '' })}>
                  <MaterialIcons name="cancel" size={16} color={C.onSurfaceVariant} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* View Mode Toggle Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                void Haptics.selectionAsync().catch(() => {});
                setViewMode((prev) => (prev === 'LIST' ? 'MAP' : 'LIST'));
              }}
              style={styles.modeToggleBtn}>
              <MaterialIcons
                name={viewMode === 'LIST' ? 'map' : 'view-list'}
                size={18}
                color="#38BDF8"
              />
              <Text style={styles.modeToggleText}>
                {viewMode === 'LIST' ? 'Map' : 'List'}
              </Text>
            </TouchableOpacity>

            {/* Filter Sheet Launcher */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setFilterSheetVisible(true);
              }}
              style={styles.filterBtn}>
              <MaterialIcons name="tune" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Quick Bank Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}>
            {POPULAR_BANKS.map((b) => {
              const isSelected =
                b.code === 'ALL'
                  ? filters.selectedBanks.length === 0
                  : filters.selectedBanks.includes(b.code);

              return (
                <TouchableOpacity
                  key={b.code}
                  activeOpacity={0.8}
                  onPress={() => handleQuickBank(b.code)}
                  style={[
                    styles.bankChip,
                    isSelected && styles.bankChipActive,
                  ]}>
                  <Text
                    style={[
                      styles.bankChipText,
                      isSelected && styles.bankChipTextActive,
                    ]}>
                    {b.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Quick Radius Row */}
          <View style={styles.radiusBar}>
            <Text style={styles.radiusLabel}>RADIUS:</Text>
            {RADIUS_PRESETS.map((p) => {
              const isSelected = filters.maxDistanceKm === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => handleQuickRadius(p.id)}
                  style={[
                    styles.radiusBtn,
                    isSelected && styles.radiusBtnActive,
                  ]}>
                  <Text
                    style={[
                      styles.radiusBtnText,
                      isSelected && styles.radiusBtnTextActive,
                    ]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Content Area: Map View vs List View */}
          {viewMode === 'MAP' ? (
            <View style={styles.mapContainer}>
              <AtmMapView
                atms={filteredAtms}
                userLocation={userLocation}
                selectedAtmId={selectedAtmId}
                onSelectAtm={(atm) => setSelectedAtmId(atm.id)}
              />

              {/* Selected Card Floating Below Map */}
              {selectedAtm && (
                <View style={styles.floatingCardWrapper}>
                  <AtmBoothCard
                    atm={selectedAtm}
                    isSelected
                    onReportStatus={(atm) => setStatusModalAtm(atm)}
                  />
                </View>
              )}
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}>
              {filteredAtms.length === 0 ? (
                <View style={styles.emptyBox}>
                  <MaterialIcons name="search-off" size={36} color={C.onSurfaceVariant} />
                  <Text style={styles.emptyTitle}>No ATM Booths Found</Text>
                  <Text style={styles.emptySub}>
                    Try changing your distance radius or bank filters.
                  </Text>
                </View>
              ) : (
                filteredAtms.map((atm) => (
                  <AtmBoothCard
                    key={atm.id}
                    atm={atm}
                    onReportStatus={(item) => setStatusModalAtm(item)}
                  />
                ))
              )}
            </ScrollView>
          )}
        </View>
      </View>

      {/* Sub Modals */}
      <AtmFilterSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
      />

      <AtmReportStatusModal
        visible={statusModalAtm !== null}
        atm={statusModalAtm}
        onClose={() => setStatusModalAtm(null)}
      />
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
    height: '92%',
    paddingBottom: 16,
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
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(32, 201, 151, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: F.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  subtitle: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gpsBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    padding: 6,
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181F23',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: F.medium,
    fontSize: 12,
    color: '#FFFFFF',
    padding: 0,
  },
  modeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  modeToggleText: {
    fontFamily: F.bold,
    fontSize: 11,
    color: '#38BDF8',
  },
  filterBtn: {
    backgroundColor: '#181F23',
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  bankChip: {
    backgroundColor: '#181F23',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bankChipActive: {
    backgroundColor: '#20C997',
  },
  bankChipText: {
    fontFamily: F.medium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  bankChipTextActive: {
    fontFamily: F.bold,
    color: '#101416',
  },
  radiusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 6,
  },
  radiusLabel: {
    fontFamily: F.bold,
    fontSize: 9,
    color: C.onSurfaceVariant,
    letterSpacing: 0.5,
    marginRight: 2,
  },
  radiusBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#181F23',
  },
  radiusBtnActive: {
    backgroundColor: '#38BDF8',
  },
  radiusBtnText: {
    fontFamily: F.medium,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  radiusBtnTextActive: {
    fontFamily: F.bold,
    color: '#101416',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  mapContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 12,
  },
  floatingCardWrapper: {
    marginTop: -8,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 6,
  },
  emptyTitle: {
    fontFamily: F.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  emptySub: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
    textAlign: 'center',
  },
});
