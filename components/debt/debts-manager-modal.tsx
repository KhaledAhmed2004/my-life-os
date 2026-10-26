import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { DebtItemCard } from '@/components/debt/debt-item-card';
import { Vital } from '@/constants/vital-theme';
import { useDebtStore } from '@/stores/debt-store';
import { DebtItem, DebtType } from '@/types/debt';

const C = Vital.colors;
const F = Vital.fonts;

interface DebtsManagerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDebt: (debt: DebtItem) => void;
  onOpenAddDebt: (defaultType?: DebtType) => void;
  onQuickRecordPayment: (debt: DebtItem) => void;
}

export function DebtsManagerModal({
  visible,
  onClose,
  onSelectDebt,
  onOpenAddDebt,
  onQuickRecordPayment,
}: DebtsManagerModalProps) {
  const debts = useDebtStore((s) => s.debts);
  const getStats = useDebtStore((s) => s.getStats);
  const stats = useMemo(() => getStats(), [getStats, debts]);

  const [filter, setFilter] = useState<'ALL' | 'LENT' | 'BORROWED' | 'SETTLED'>('ALL');
  const [search, setSearch] = useState('');

  const filteredDebts = useMemo(() => {
    return debts.filter((d) => {
      let matchFilter = true;
      if (filter === 'LENT') matchFilter = d.type === 'I_LENT' && d.status !== 'SETTLED';
      else if (filter === 'BORROWED') matchFilter = d.type === 'I_BORROWED' && d.status !== 'SETTLED';
      else if (filter === 'SETTLED') matchFilter = d.status === 'SETTLED';

      const matchSearch =
        search.trim() === '' ||
        d.personName.toLowerCase().includes(search.toLowerCase()) ||
        (d.notes && d.notes.toLowerCase().includes(search.toLowerCase())) ||
        (d.phone && d.phone.includes(search));

      return matchFilter && matchSearch;
    });
  }, [debts, filter, search]);

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
              <View style={styles.iconSquare}>
                <MaterialIcons name="swap-horiz" size={20} color="#51CF66" />
              </View>
              <View>
                <Text style={styles.title}>Debt & Udhaar Manager</Text>
                <Text style={styles.subtitle}>
                  Personal borrow & lend ledger
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.closeBtn}>
              <MaterialIcons name="close" size={20} color={C.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}>
            {/* NET POSITION HERO */}
            <View style={styles.netHeroBox}>
              <View>
                <Text style={styles.netHeroLabel}>OVERALL NET POSITION</Text>
                <Text
                  style={[
                    styles.netHeroVal,
                    { color: stats.netBalance >= 0 ? '#20C997' : '#FF6B6B' },
                  ]}>
                  {stats.netBalance >= 0 ? '+' : '-'}৳{Math.abs(stats.netBalance).toLocaleString()}
                </Text>
              </View>
              <View style={styles.netHeroBreakdown}>
                <Text style={styles.netSubText}>
                  Owed to you: <Text style={{ color: '#20C997', fontFamily: F.bold }}>৳{stats.totalLentPending.toLocaleString()}</Text>
                </Text>
                <Text style={styles.netSubText}>
                  You owe: <Text style={{ color: '#FF6B6B', fontFamily: F.bold }}>৳{stats.totalBorrowedPending.toLocaleString()}</Text>
                </Text>
              </View>
            </View>

            {/* SEARCH & FILTER TABS */}
            <View style={styles.filterSection}>
              <View style={styles.searchBox}>
                <MaterialIcons name="search" size={16} color={C.onSurfaceVariant} />
                <TextInput
                  style={styles.searchInput}
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search by name or note..."
                  placeholderTextColor="#5C6E79"
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <MaterialIcons name="close" size={16} color={C.onSurfaceVariant} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.filterChipsRow}>
                {(['ALL', 'LENT', 'BORROWED', 'SETTLED'] as const).map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    activeOpacity={0.7}
                    onPress={() => {
                      void Haptics.selectionAsync().catch(() => {});
                      setFilter(tab);
                    }}
                    style={[
                      styles.filterChip,
                      filter === tab && styles.filterChipActive,
                    ]}>
                    <Text
                      style={[
                        styles.filterChipText,
                        filter === tab && styles.filterChipTextActive,
                      ]}>
                      {tab === 'ALL'
                        ? 'All'
                        : tab === 'LENT'
                        ? 'I Lent'
                        : tab === 'BORROWED'
                        ? 'I Borrowed'
                        : 'Settled'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* LIST */}
            {filteredDebts.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="person-outline" size={36} color={C.onSurfaceVariant} />
                <Text style={styles.emptyTitle}>No records found</Text>
                <Text style={styles.emptySubtitle}>
                  Record money lent to friends or money borrowed.
                </Text>
              </View>
            ) : (
              <View style={styles.listContainer}>
                {filteredDebts.map((debt) => (
                  <DebtItemCard
                    key={debt.id}
                    debt={debt}
                    onPress={onSelectDebt}
                    onQuickRecordPayment={onQuickRecordPayment}
                  />
                ))}
              </View>
            )}
          </ScrollView>

          {/* FOOTER */}
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => onOpenAddDebt()}
              style={styles.addBtn}>
              <MaterialIcons name="add" size={18} color="#0D1113" />
              <Text style={styles.addBtnText}>Record Money Udhaar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#13191C',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconSquare: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(81, 207, 102, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: F.bold,
    fontSize: 16,
    color: C.onSurface,
  },
  subtitle: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1B2226',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  netHeroBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#181F23',
    borderRadius: 16,
    padding: 14,
  },
  netHeroLabel: {
    fontFamily: F.bold,
    fontSize: 9,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  netHeroVal: {
    fontFamily: F.bold,
    fontSize: 20,
    marginTop: 2,
  },
  netHeroBreakdown: {
    gap: 2,
    alignItems: 'flex-end',
  },
  netSubText: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  filterSection: {
    gap: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181F23',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: F.medium,
    fontSize: 13,
    color: '#FFFFFF',
    padding: 0,
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterChip: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#181F23',
    paddingVertical: 7,
    borderRadius: 8,
  },
  filterChipActive: {
    backgroundColor: '#51CF66',
  },
  filterChipText: {
    fontFamily: F.medium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  filterChipTextActive: {
    fontFamily: F.bold,
    color: '#0D1113',
  },
  listContainer: {
    gap: 10,
  },
  emptyState: {
    backgroundColor: '#181F23',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontFamily: F.bold,
    fontSize: 14,
    color: C.onSurface,
  },
  emptySubtitle: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#51CF66',
    borderRadius: 12,
    paddingVertical: 13,
    gap: 6,
  },
  addBtnText: {
    fontFamily: F.bold,
    fontSize: 13,
    color: '#0D1113',
  },
});
