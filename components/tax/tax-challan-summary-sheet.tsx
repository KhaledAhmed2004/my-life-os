import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Vital } from '@/constants/vital-theme';
import { TaxCalculationResult } from '@/types/tax';

const C = Vital.colors;
const F = Vital.fonts;

interface TaxChallanSummarySheetProps {
  visible: boolean;
  taxResult: TaxCalculationResult;
  onClose: () => void;
}

export function TaxChallanSummarySheet({
  visible,
  taxResult,
  onClose,
}: TaxChallanSummarySheetProps) {
  const {
    grossAnnualSalary,
    salaryExemptAmount,
    taxableSalary,
    totalOtherTaxableIncome,
    totalTaxableIncome,
    taxFreeLimit,
    grossTaxLiability,
    actualInvestmentTotal,
    taxRebateAmount,
    minimumTax,
    netTaxPayable,
    monthlyTdsRecommended,
    effectiveTaxRate,
  } = taxResult;

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
              <View style={styles.iconBox}>
                <MaterialIcons name="receipt-long" size={20} color="#D4A017" />
              </View>
              <View>
                <Text style={styles.title}>Tax Assessment Summary</Text>
                <Text style={styles.subtitle}>
                  Bangladesh IT-11GA Statement Preview
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
            {/* Hero Net Tax Box */}
            <View style={styles.heroBox}>
              <Text style={styles.heroLabel}>TOTAL NET TAX PAYABLE (প্রদেয় কর)</Text>
              <View style={styles.amountRow}>
                <Text style={styles.takaSymbol}>৳</Text>
                <Text style={styles.heroAmountText}>
                  {netTaxPayable.toLocaleString()}
                </Text>
              </View>
              <Text style={styles.heroSub}>
                Effective Tax Rate: {effectiveTaxRate}% • Monthly TDS: ৳{monthlyTdsRecommended.toLocaleString()}/mo
              </Text>
            </View>

            {/* Income Breakdown Table */}
            <View style={styles.tableCard}>
              <Text style={styles.tableTitle}>PART A: INCOME ASSESSMENT</Text>

              <View style={styles.tableRow}>
                <Text style={styles.rowLabel}>1. Gross Salary & Allowances</Text>
                <Text style={styles.rowValue}>৳{grossAnnualSalary.toLocaleString()}</Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={styles.rowLabel}>2. Less: Salary Exemption (1/3rd)</Text>
                <Text style={[styles.rowValue, { color: '#20C997' }]}>
                  -৳{salaryExemptAmount.toLocaleString()}
                </Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={styles.rowLabel}>3. Taxable Salary Income</Text>
                <Text style={styles.rowValue}>৳{taxableSalary.toLocaleString()}</Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={styles.rowLabel}>4. Other Taxable Incomes</Text>
                <Text style={styles.rowValue}>৳{totalOtherTaxableIncome.toLocaleString()}</Text>
              </View>

              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={styles.totalRowLabel}>TOTAL TAXABLE INCOME</Text>
                <Text style={styles.totalRowValue}>৳{totalTaxableIncome.toLocaleString()}</Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={styles.rowLabel}>Tax-Free Threshold Applicable</Text>
                <Text style={styles.rowValue}>৳{taxFreeLimit.toLocaleString()}</Text>
              </View>
            </View>

            {/* Tax & Rebate Table */}
            <View style={styles.tableCard}>
              <Text style={styles.tableTitle}>PART B: TAX LIABILITY & REBATE</Text>

              <View style={styles.tableRow}>
                <Text style={styles.rowLabel}>5. Gross Income Tax Liability</Text>
                <Text style={styles.rowValue}>৳{grossTaxLiability.toLocaleString()}</Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={styles.rowLabel}>
                  6. Less: 15% Investment Rebate (on ৳{actualInvestmentTotal.toLocaleString()})
                </Text>
                <Text style={[styles.rowValue, { color: '#20C997' }]}>
                  -৳{taxRebateAmount.toLocaleString()}
                </Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={styles.rowLabel}>7. Minimum Tax Benchmark</Text>
                <Text style={styles.rowValue}>৳{minimumTax.toLocaleString()}</Text>
              </View>

              <View style={[styles.tableRow, styles.totalRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.totalRowLabel, { color: '#D4A017' }]}>
                  8. NET PAYABLE TAX
                </Text>
                <Text style={[styles.totalRowValue, { color: '#D4A017' }]}>
                  ৳{netTaxPayable.toLocaleString()}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              style={styles.doneBtn}>
              <Text style={styles.doneBtnText}>Close Assessment</Text>
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
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 160, 23, 0.15)',
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
  closeBtn: {
    padding: 6,
  },
  scrollBody: {
    padding: 16,
    gap: 14,
  },
  heroBox: {
    backgroundColor: '#181F23',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 2,
  },
  heroLabel: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#D4A017',
    letterSpacing: 0.6,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  takaSymbol: {
    fontFamily: F.bold,
    fontSize: 22,
    color: '#D4A017',
  },
  heroAmountText: {
    fontFamily: F.bold,
    fontSize: 32,
    color: '#FFFFFF',
  },
  heroSub: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  tableCard: {
    backgroundColor: '#181F23',
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  tableTitle: {
    fontFamily: F.bold,
    fontSize: 10,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  rowLabel: {
    fontFamily: F.regular,
    fontSize: 12,
    color: C.onSurface,
    flex: 1,
  },
  rowValue: {
    fontFamily: F.medium,
    fontSize: 12,
    color: C.onSurface,
  },
  totalRow: {
    backgroundColor: '#13191C',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    marginVertical: 4,
    borderBottomWidth: 0,
  },
  totalRowLabel: {
    fontFamily: F.bold,
    fontSize: 11,
    color: '#20C997',
  },
  totalRowValue: {
    fontFamily: F.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  doneBtn: {
    backgroundColor: '#181F23',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  doneBtnText: {
    fontFamily: F.bold,
    fontSize: 13,
    color: C.onSurface,
  },
});
