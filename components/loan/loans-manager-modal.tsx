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

import { EmiCalculatorCard } from '@/components/loan/emi-calculator-card';
import { LoanItemCard } from '@/components/loan/loan-item-card';
import { Vital } from '@/constants/vital-theme';
import { useLoanStore } from '@/stores/loan-store';
import { LoanItem, LoanStatus } from '@/types/loan';

const C = Vital.colors;
const F = Vital.fonts;

interface LoansManagerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLoan: (loan: LoanItem) => void;
  onOpenAddLoan: (initialValues?: { principal?: number; interestRate?: number; tenureMonths?: number }) => void;
  onQuickPayEmi: (loan: LoanItem) => void;
}

export function LoansManagerModal({
  visible,
  onClose,
  onSelectLoan,
  onOpenAddLoan,
  onQuickPayEmi,
}: LoansManagerModalProps) {
  const loans = useLoanStore((s) => s.loans);
  const [filter, setFilter] = useState<'ALL' | LoanStatus>('ALL');
  const [search, setSearch] = useState('');
  const [showCalculator, setShowCalculator] = useState(false);

  const filteredLoans = useMemo(() => {
    return loans.filter((l) => {
      const matchFilter = filter === 'ALL' || l.status === filter;
      const matchSearch =
        search.trim() === '' ||
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.lender.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [loans, filter, search]);

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
                <MaterialIcons name="account-balance" size={20} color="#38BDF8" />
              </View>
              <View>
                <Text style={styles.title}>Loans & EMI Portfolio</Text>
                <Text style={styles.subtitle}>
                  Manage active obligations & calculations
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
            {/* TOGGLE CALCULATOR BUTTON */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                void Haptics.selectionAsync().catch(() => {});
                setShowCalculator(!showCalculator);
              }}
              style={styles.calcToggleBtn}>
              <View style={styles.calcToggleLeft}>
                <MaterialIcons name="calculate" size={18} color="#38BDF8" />
                <Text style={styles.calcToggleTitle}>
                  {showCalculator ? 'Hide EMI Calculator' : 'Open Interactive EMI Calculator'}
                </Text>
              </View>
              <MaterialIcons
                name={showCalculator ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                size={20}
                color={C.onSurfaceVariant}
              />
            </TouchableOpacity>

            {/* EMBEDDED CALCULATOR */}
            {showCalculator && (
              <EmiCalculatorCard
                onSaveAsLoan={(data) => {
                  setShowCalculator(false);
                  onOpenAddLoan(data);
                }}
              />
            )}

            {/* SEARCH & FILTERS */}
            <View style={styles.filterSection}>
              <View style={styles.searchBox}>
                <MaterialIcons name="search" size={16} color={C.onSurfaceVariant} />
                <TextInput
                  style={styles.searchInput}
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search loans or bank..."
                  placeholderTextColor="#5C6E79"
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <MaterialIcons name="close" size={16} color={C.onSurfaceVariant} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.statusChipsRow}>
                {(['ALL', 'ACTIVE', 'PAID_OFF'] as const).map((tab) => (
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
                      {tab === 'ALL' ? 'All Loans' : tab === 'ACTIVE' ? 'Active' : 'Paid Off'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* LOANS LIST */}
            {filteredLoans.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="receipt-long" size={36} color={C.onSurfaceVariant} />
                <Text style={styles.emptyTitle}>No loans found</Text>
                <Text style={styles.emptySubtitle}>
                  Add a loan or installment to track your monthly payments.
                </Text>
              </View>
            ) : (
              <View style={styles.listContainer}>
                {filteredLoans.map((loan) => (
                  <LoanItemCard
                    key={loan.id}
                    loan={loan}
                    onPress={onSelectLoan}
                    onQuickPayEmi={onQuickPayEmi}
                  />
                ))}
              </View>
            )}
          </ScrollView>

          {/* BOTTOM FLOATING ADD BUTTON */}
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => onOpenAddLoan()}
              style={styles.addLoanBtn}>
              <MaterialIcons name="add" size={18} color="#0D1113" />
              <Text style={styles.addLoanBtnText}>Add New Loan / EMI</Text>
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
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
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
  calcToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#181F23',
    padding: 12,
    borderRadius: 14,
  },
  calcToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calcToggleTitle: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#38BDF8',
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
  statusChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#181F23',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  filterChipActive: {
    backgroundColor: '#38BDF8',
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
  addLoanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#38BDF8',
    borderRadius: 12,
    paddingVertical: 13,
    gap: 6,
  },
  addLoanBtnText: {
    fontFamily: F.bold,
    fontSize: 13,
    color: '#0D1113',
  },
});
