import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Vital } from '@/constants/vital-theme';
import { WarrantyCategory } from '@/types/warranty';
import { WARRANTY_CATEGORY_CONFIG } from './warranty-constants';

const C = Vital.colors;
const F = Vital.fonts;

export type WarrantyFilterType = 'ALL' | 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'WITH_CLAIMS';
export type WarrantySortOption = 'EXPIRY_ASC' | 'PURCHASE_DESC' | 'PRICE_DESC';

interface WarrantyFilterRowProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: WarrantyFilterType;
  onStatusFilterChange: (filter: WarrantyFilterType) => void;
  categoryFilter: WarrantyCategory | 'ALL';
  onCategoryFilterChange: (cat: WarrantyCategory | 'ALL') => void;
  sortOption: WarrantySortOption;
  onSortOptionChange: (sort: WarrantySortOption) => void;
  activeCounts: {
    all: number;
    active: number;
    expiring: number;
    expired: number;
    withClaims: number;
  };
}

export function WarrantyFilterRow({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  sortOption,
  onSortOptionChange,
  activeCounts,
}: WarrantyFilterRowProps) {
  const statusTabs: { id: WarrantyFilterType; label: string; count: number; color?: string }[] = [
    { id: 'ALL', label: 'All', count: activeCounts.all },
    { id: 'ACTIVE', label: 'Active', count: activeCounts.active, color: '#20C997' },
    { id: 'EXPIRING_SOON', label: 'Expiring', count: activeCounts.expiring, color: '#FCC419' },
    { id: 'EXPIRED', label: 'Expired', count: activeCounts.expired, color: '#FA5252' },
    { id: 'WITH_CLAIMS', label: 'Claims', count: activeCounts.withClaims, color: '#38BDF8' },
  ];

  const categories: (WarrantyCategory | 'ALL')[] = [
    'ALL',
    'ELECTRONICS',
    'APPLIANCES',
    'GADGETS',
    'VEHICLES',
    'FURNITURE',
    'OTHER',
  ];

  const cycleSort = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (sortOption === 'EXPIRY_ASC') onSortOptionChange('PURCHASE_DESC');
    else if (sortOption === 'PURCHASE_DESC') onSortOptionChange('PRICE_DESC');
    else onSortOptionChange('EXPIRY_ASC');
  };

  const getSortLabel = () => {
    switch (sortOption) {
      case 'EXPIRY_ASC':
        return 'Expiry Date';
      case 'PURCHASE_DESC':
        return 'Newest First';
      case 'PRICE_DESC':
        return 'Highest Price';
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. SEARCH BAR & SORT TOGGLE */}
      <View style={styles.searchSortRow}>
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={18} color={C.onSurfaceVariant} />
          <TextInput
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Search products, brands, models..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            style={styles.searchInput}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => onSearchChange('')}
              hitSlop={8}
              style={styles.clearBtn}>
              <MaterialIcons name="close" size={14} color={C.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={cycleSort}
          style={styles.sortBtn}>
          <MaterialIcons name="sort" size={15} color="#FF922B" />
          <Text style={styles.sortBtnText}>{getSortLabel()}</Text>
        </TouchableOpacity>
      </View>

      {/* 2. STATUS FILTER PILLS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statusChipsRow}>
        {statusTabs.map((tab) => {
          const isSelected = statusFilter === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.8}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                onStatusFilterChange(tab.id);
              }}
              style={[
                styles.statusChip,
                isSelected && styles.statusChipSelected,
              ]}>
              {tab.color && (
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isSelected ? '#101416' : tab.color },
                  ]}
                />
              )}
              <Text
                style={[
                  styles.statusChipText,
                  isSelected && styles.statusChipTextSelected,
                ]}>
                {tab.label}
              </Text>
              <View
                style={[
                  styles.countBadge,
                  isSelected && styles.countBadgeSelected,
                ]}>
                <Text
                  style={[
                    styles.countBadgeText,
                    isSelected && styles.countBadgeTextSelected,
                  ]}>
                  {tab.count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 3. CATEGORY FILTER PILLS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryChipsRow}>
        {categories.map((cat) => {
          const isSelected = categoryFilter === cat;
          const config = cat === 'ALL' ? null : WARRANTY_CATEGORY_CONFIG[cat];
          return (
            <TouchableOpacity
              key={cat}
              activeOpacity={0.8}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                onCategoryFilterChange(cat);
              }}
              style={[
                styles.categoryChip,
                isSelected && styles.categoryChipSelected,
              ]}>
              {config && (
                <MaterialIcons
                  name={config.icon}
                  size={12}
                  color={isSelected ? '#101416' : config.color}
                />
              )}
              <Text
                style={[
                  styles.categoryChipText,
                  isSelected && styles.categoryChipTextSelected,
                ]}>
                {cat === 'ALL' ? 'All Categories' : config?.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  searchSortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B1E',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 38,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontFamily: F.sans,
    fontSize: 12,
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 2,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 146, 43, 0.12)',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38,
  },
  sortBtnText: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: '#FF922B',
  },
  statusChipsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
  },
  statusChipSelected: {
    backgroundColor: '#FF922B',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusChipText: {
    fontFamily: F.sansMedium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  statusChipTextSelected: {
    fontFamily: F.sansBold,
    color: '#101416',
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
  },
  countBadgeSelected: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  countBadgeText: {
    fontFamily: F.sansBold,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  countBadgeTextSelected: {
    color: '#101416',
  },
  categoryChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
  },
  categoryChipSelected: {
    backgroundColor: '#FFFFFF',
  },
  categoryChipText: {
    fontFamily: F.sansMedium,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  categoryChipTextSelected: {
    fontFamily: F.sansBold,
    color: '#101416',
  },
});
