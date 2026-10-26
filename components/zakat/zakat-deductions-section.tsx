import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import {
  ZAKAT_CATEGORIES_META,
  ZAKAT_COLORS,
} from '@/components/zakat/zakat-constants';
import { Vital } from '@/constants/vital-theme';
import { useZakatStore } from '@/stores/zakat-store';
import { ZakatManualItem } from '@/types/zakat';

const C = Vital.colors;
const F = Vital.fonts;

interface ZakatDeductionsSectionProps {
  activeLoans: number;
  payableDebts: number;
  onOpenAddItem: (isDeduction: boolean) => void;
  onEditItem: (item: ZakatManualItem) => void;
}

export function ZakatDeductionsSection({
  activeLoans,
  payableDebts,
  onOpenAddItem,
  onEditItem,
}: ZakatDeductionsSectionProps) {
  const {
    includeActiveLoans,
    includeDebtsPayable,
    setIncludeStoreItem,
    manualItems,
    toggleManualItem,
    deleteManualItem,
  } = useZakatStore();

  const manualDeductions = manualItems.filter((i) => i.isDeduction);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="remove-circle-outline" size={16} color={ZAKAT_COLORS.coral} />
          <Text style={styles.headerTitle}>DEDUCTIBLE LIABILITIES & DEBTS</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            onOpenAddItem(true);
          }}
          style={styles.addBtn}>
          <MaterialIcons name="add" size={14} color={ZAKAT_COLORS.coral} />
          <Text style={styles.addBtnText}>Add Liability</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.itemsList}>
        {/* 1. AUTO ACTIVE LOANS */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            void Haptics.selectionAsync().catch(() => {});
            setIncludeStoreItem('includeActiveLoans', !includeActiveLoans);
          }}
          style={[
            styles.itemCard,
            !includeActiveLoans && styles.itemCardDisabled,
          ]}>
          <View style={styles.itemLeft}>
            <MaterialIcons
              name={includeActiveLoans ? 'check-box' : 'check-box-outline-blank'}
              size={18}
              color={includeActiveLoans ? ZAKAT_COLORS.coral : C.onSurfaceVariant}
            />
            <View style={styles.itemIconCircle}>
              <MaterialIcons name="receipt-long" size={15} color={ZAKAT_COLORS.coral} />
            </View>
            <View>
              <Text style={styles.itemTitle}>Active Loan Outstanding</Text>
              <Text style={styles.itemSubtitle}>Bank loans and EMI principal due</Text>
            </View>
          </View>

          <View style={styles.itemRight}>
            <Text
              style={[
                styles.itemAmount,
                !includeActiveLoans && styles.itemAmountDisabled,
              ]}>
              ৳{activeLoans.toLocaleString()}
            </Text>
            <View style={styles.syncBadge}>
              <Text style={styles.syncBadgeText}>LIVE</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 2. AUTO BORROWED DEBTS */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            void Haptics.selectionAsync().catch(() => {});
            setIncludeStoreItem('includeDebtsPayable', !includeDebtsPayable);
          }}
          style={[
            styles.itemCard,
            !includeDebtsPayable && styles.itemCardDisabled,
          ]}>
          <View style={styles.itemLeft}>
            <MaterialIcons
              name={includeDebtsPayable ? 'check-box' : 'check-box-outline-blank'}
              size={18}
              color={includeDebtsPayable ? ZAKAT_COLORS.coral : C.onSurfaceVariant}
            />
            <View style={styles.itemIconCircle}>
              <MaterialIcons name="call-received" size={15} color="#FF6B6B" />
            </View>
            <View>
              <Text style={styles.itemTitle}>Money Borrowed (Udhaar Payable)</Text>
              <Text style={styles.itemSubtitle}>Debts owed to friends or family</Text>
            </View>
          </View>

          <View style={styles.itemRight}>
            <Text
              style={[
                styles.itemAmount,
                !includeDebtsPayable && styles.itemAmountDisabled,
              ]}>
              ৳{payableDebts.toLocaleString()}
            </Text>
            <View style={styles.syncBadge}>
              <Text style={styles.syncBadgeText}>LIVE</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 3. MANUAL DEDUCTIONS */}
        {manualDeductions.map((item) => {
          const meta = ZAKAT_CATEGORIES_META[item.category] || {
            icon: 'remove-circle',
            color: ZAKAT_COLORS.coral,
          };

          return (
            <View
              key={item.id}
              style={[
                styles.itemCard,
                !item.isEnabled && styles.itemCardDisabled,
              ]}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => void toggleManualItem(item.id)}
                style={styles.checkBtn}>
                <MaterialIcons
                  name={item.isEnabled ? 'check-box' : 'check-box-outline-blank'}
                  size={18}
                  color={item.isEnabled ? ZAKAT_COLORS.coral : C.onSurfaceVariant}
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => onEditItem(item)}
                style={styles.itemMain}>
                <View style={styles.itemIconCircle}>
                  <MaterialIcons
                    name={meta.icon as any}
                    size={15}
                    color={meta.color}
                  />
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemTitle}>{item.name}</Text>
                  {item.note ? (
                    <Text style={styles.itemSubtitle}>{item.note}</Text>
                  ) : null}
                </View>
              </TouchableOpacity>

              <View style={styles.itemRight}>
                <Text
                  style={[
                    styles.itemAmount,
                    !item.isEnabled && styles.itemAmountDisabled,
                  ]}>
                  ৳{item.amount.toLocaleString()}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => void deleteManualItem(item.id)}
                  style={styles.deleteBtn}>
                  <MaterialIcons name="delete-outline" size={14} color={C.onSurfaceVariant} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: ZAKAT_COLORS.tileBg,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  header: {
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
    color: ZAKAT_COLORS.coral,
    letterSpacing: 0.7,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ZAKAT_COLORS.coralLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 2,
  },
  addBtnText: {
    fontFamily: F.bold,
    fontSize: 10,
    color: ZAKAT_COLORS.coral,
  },
  itemsList: {
    gap: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ZAKAT_COLORS.tileInner,
    borderRadius: 12,
    padding: 10,
    gap: 8,
  },
  itemCardDisabled: {
    opacity: 0.5,
  },
  checkBtn: {
    padding: 2,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  itemMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#13191C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDetails: {
    flex: 1,
    gap: 1,
  },
  itemTitle: {
    fontFamily: F.bold,
    fontSize: 11,
    color: C.onSurface,
  },
  itemSubtitle: {
    fontFamily: F.regular,
    fontSize: 9,
    color: C.onSurfaceVariant,
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  itemAmount: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  itemAmountDisabled: {
    color: C.onSurfaceVariant,
  },
  syncBadge: {
    backgroundColor: ZAKAT_COLORS.coralLight,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  syncBadgeText: {
    fontFamily: F.bold,
    fontSize: 8,
    color: ZAKAT_COLORS.coral,
    letterSpacing: 0.5,
  },
  deleteBtn: {
    padding: 2,
  },
});
