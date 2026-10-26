import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { INVESTMENT_CATEGORY_META } from '@/components/investment/investment-constants';
import { InvestmentItemCard } from '@/components/investment/investment-item-card';
import { InvestmentMaturityTimeline } from '@/components/investment/investment-maturity-timeline';
import { InvestmentPortfolioHero } from '@/components/investment/investment-portfolio-hero';
import { SanchayPatraRateReference } from '@/components/investment/sanchay-patra-rate-reference';
import { useInvestmentStore } from '@/stores/investment-store';
import { Vital } from '@/constants/vital-theme';
import { InvestmentCategory, InvestmentItem } from '@/types/investment';

const C = Vital.colors;
const F = Vital.fonts;

type FilterTab = 'ALL' | InvestmentCategory;

interface InvestmentManagerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectItem: (item: InvestmentItem) => void;
  onOpenAddModal: () => void;
}

export function InvestmentManagerModal({
  visible,
  onClose,
  onSelectItem,
  onOpenAddModal,
}: InvestmentManagerModalProps) {
  const investments = useInvestmentStore((s) => s.investments);
  const getStats = useInvestmentStore((s) => s.getStats);
  const stats = useMemo(() => getStats(), [getStats, investments]);

  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [search, setSearch] = useState('');

  const filteredItems = useMemo(() => {
    return investments.filter((item) => {
      let matchCat = true;
      if (activeTab !== 'ALL') {
        matchCat = item.category === activeTab;
      }

      let matchSearch = true;
      if (search.trim()) {
        const q = search.toLowerCase();
        const mName = item.name.toLowerCase().includes(q);
        const mInst = item.institution?.toLowerCase().includes(q) ?? false;
        const mTicker = item.tickerSymbol?.toLowerCase().includes(q) ?? false;
        const mNotes = item.notes?.toLowerCase().includes(q) ?? false;
        matchSearch = mName || mInst || mTicker || mNotes;
      }

      return matchCat && matchSearch;
    });
  }, [investments, activeTab, search]);

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
                <MaterialIcons name="insights" size={20} color="#20C997" />
              </View>
              <View>
                <Text style={styles.title}>Investment Portfolio</Text>
                <Text style={styles.subtitle}>
                  DPS, FDR, সঞ্চয়পত্র & Stock Vault
                </Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  onOpenAddModal();
                }}
                style={styles.addIconBtn}>
                <MaterialIcons name="add" size={20} color="#101416" />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onClose}
                style={styles.closeBtn}>
                <MaterialIcons name="close" size={20} color={C.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}>
            {/* 1. PORTFOLIO HERO BENTO */}
            <InvestmentPortfolioHero stats={stats} />

            {/* 2. MATURITY TIMELINE (UPCOMING HORIZON) */}
            <InvestmentMaturityTimeline
              items={investments}
              onSelectItem={onSelectItem}
            />

            {/* 3. BANGLADESH SANCHAY PATRA RATE REFERENCE */}
            <SanchayPatraRateReference />

            {/* 4. SEARCH & CATEGORY FILTER TABS */}
            <View style={styles.filterSection}>
              {/* Search Bar */}
              <View style={styles.searchBar}>
                <MaterialIcons name="search" size={18} color={C.onSurfaceVariant} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search holdings, DSE stocks, bank..."
                  placeholderTextColor={C.onSurfaceVariant}
                  value={search}
                  onChangeText={setSearch}
                />
                {search.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearch('')}
                    style={styles.clearSearchBtn}>
                    <MaterialIcons name="cancel" size={16} color={C.onSurfaceVariant} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Segmented Category Filter Tabs */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabsScroll}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    void Haptics.selectionAsync().catch(() => {});
                    setActiveTab('ALL');
                  }}
                  style={[
                    styles.tabPill,
                    activeTab === 'ALL' && styles.tabPillActive,
                  ]}>
                  <Text
                    style={[
                      styles.tabPillText,
                      activeTab === 'ALL' && styles.tabPillTextActive,
                    ]}>
                    ALL ({investments.length})
                  </Text>
                </TouchableOpacity>

                {(
                  [
                    'SANCHAY_PATRA',
                    'DPS',
                    'FIXED_DEPOSIT',
                    'STOCKS',
                    'MUTUAL_FUND',
                    'CRYPTO',
                    'OTHER',
                  ] as InvestmentCategory[]
                ).map((cat) => {
                  const meta = INVESTMENT_CATEGORY_META[cat];
                  const count = investments.filter((i) => i.category === cat).length;
                  if (count === 0 && activeTab !== cat) return null;
                  const isSelected = activeTab === cat;

                  return (
                    <TouchableOpacity
                      key={cat}
                      activeOpacity={0.8}
                      onPress={() => {
                        void Haptics.selectionAsync().catch(() => {});
                        setActiveTab(cat);
                      }}
                      style={[
                        styles.tabPill,
                        isSelected && {
                          backgroundColor: meta.bgColor,
                          borderColor: meta.color,
                        },
                      ]}>
                      <MaterialIcons
                        name={meta.icon}
                        size={12}
                        color={isSelected ? meta.color : C.onSurfaceVariant}
                      />
                      <Text
                        style={[
                          styles.tabPillText,
                          isSelected && { color: meta.color, fontFamily: F.bold },
                        ]}>
                        {meta.label.split(' ')[0]} ({count})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* 5. HOLDINGS LIST */}
            <View style={styles.listSection}>
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>
                  HOLDINGS ({filteredItems.length})
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onOpenAddModal}
                  style={styles.addLink}>
                  <MaterialIcons name="add" size={14} color="#20C997" />
                  <Text style={styles.addLinkText}>Add Investment</Text>
                </TouchableOpacity>
              </View>

              {filteredItems.length === 0 ? (
                <View style={styles.emptyCard}>
                  <MaterialIcons name="account-balance-wallet" size={36} color={C.onSurfaceVariant} />
                  <Text style={styles.emptyTitle}>No holdings found</Text>
                  <Text style={styles.emptySub}>
                    {search
                      ? 'Try adjusting your search terms'
                      : 'Add your first DPS, FDR, Sanchay Patra or Stock holding.'}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={onOpenAddModal}
                    style={styles.emptyAddBtn}>
                    <Text style={styles.emptyAddBtnText}>+ Add New Holding</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.itemsList}>
                  {filteredItems.map((item) => (
                    <InvestmentItemCard
                      key={item.id}
                      item={item}
                      onPress={() => onSelectItem(item)}
                    />
                  ))}
                </View>
              )}
            </View>
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
    height: '92%',
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
    gap: 12,
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
  addIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#20C997',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    padding: 6,
  },
  scrollBody: {
    padding: 16,
    gap: 14,
  },
  filterSection: {
    gap: 10,
  },
  searchBar: {
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
    fontSize: 13,
    color: '#FFFFFF',
  },
  clearSearchBtn: {
    padding: 4,
  },
  tabsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  tabPill: {
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
  tabPillActive: {
    backgroundColor: 'rgba(32, 201, 151, 0.15)',
    borderColor: '#20C997',
  },
  tabPillText: {
    fontFamily: F.medium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  tabPillTextActive: {
    fontFamily: F.bold,
    color: '#20C997',
  },
  listSection: {
    gap: 10,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listTitle: {
    fontFamily: F.bold,
    fontSize: 10,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  addLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  addLinkText: {
    fontFamily: F.bold,
    fontSize: 11,
    color: '#20C997',
  },
  itemsList: {
    gap: 10,
  },
  emptyCard: {
    backgroundColor: '#181F23',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontFamily: F.bold,
    fontSize: 14,
    color: C.onSurface,
    marginTop: 4,
  },
  emptySub: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
    textAlign: 'center',
  },
  emptyAddBtn: {
    backgroundColor: 'rgba(32, 201, 151, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  emptyAddBtnText: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#20C997',
  },
});
