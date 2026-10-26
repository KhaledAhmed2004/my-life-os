import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ZakatAddItemModal } from '@/components/zakat/zakat-add-item-modal';
import { ZakatAutoAssetsSection } from '@/components/zakat/zakat-auto-assets-section';
import { ZAKAT_COLORS } from '@/components/zakat/zakat-constants';
import { ZakatDeductionsSection } from '@/components/zakat/zakat-deductions-section';
import { ZakatGoldPriceEditor } from '@/components/zakat/zakat-gold-price-editor';
import { ZakatManualAssetsSection } from '@/components/zakat/zakat-manual-assets-section';
import { ZakatNisabStatusBar } from '@/components/zakat/zakat-nisab-status-bar';
import { ZakatResultCard } from '@/components/zakat/zakat-result-card';
import { Vital } from '@/constants/vital-theme';
import { useDebtStore } from '@/stores/debt-store';
import { useLoanStore } from '@/stores/loan-store';
import { useSavingsStore } from '@/stores/savings-store';
import { useZakatStore } from '@/stores/zakat-store';
import { ZakatManualItem } from '@/types/zakat';

const C = Vital.colors;
const F = Vital.fonts;

interface ZakatCalculatorModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ZakatCalculatorModal({
  visible,
  onClose,
}: ZakatCalculatorModalProps) {
  const calculateZakat = useZakatStore((s) => s.calculateZakat);
  const resetToDefaults = useZakatStore((s) => s.resetToDefaults);

  // Store data hooks
  const savingsGoals = useSavingsStore((s) => s.goals);
  const getDebtStats = useDebtStore((s) => s.getStats);
  const getLoanStats = useLoanStore((s) => s.getStats);

  // Modal item add/edit state
  const [addItemModalVisible, setAddItemModalVisible] = useState(false);
  const [isDeductionModalMode, setIsDeductionModalMode] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<ZakatManualItem | null>(null);

  // Aggregated data
  const savingsBalance = useMemo(() => {
    return savingsGoals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  }, [savingsGoals]);

  const debtStats = useMemo(() => {
    return getDebtStats();
  }, [getDebtStats]);

  const loanStats = useMemo(() => {
    return getLoanStats();
  }, [getLoanStats]);

  // Live calculation result
  const zakatResult = useMemo(() => {
    return calculateZakat({
      savingsBalance,
      receivableDebts: debtStats.totalLentPending,
      activeLoans: loanStats.totalOutstanding,
      payableDebts: debtStats.totalBorrowedPending,
    });
  }, [calculateZakat, savingsBalance, debtStats, loanStats]);

  const handleOpenAdd = (isDeduction: boolean) => {
    setItemToEdit(null);
    setIsDeductionModalMode(isDeduction);
    setAddItemModalVisible(true);
  };

  const handleOpenEdit = (item: ZakatManualItem) => {
    setItemToEdit(item);
    setIsDeductionModalMode(item.isDeduction);
    setAddItemModalVisible(true);
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
                <MaterialIcons name="auto-awesome" size={20} color={ZAKAT_COLORS.gold} />
              </View>
              <View>
                <Text style={styles.title}>Zakat & Nisab Calculator</Text>
                <Text style={styles.subtitle}>
                  Multi-asset aggregation & 2.5% Islamic charity engine
                </Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => void resetToDefaults()}
                style={styles.resetBtn}>
                <MaterialIcons name="refresh" size={16} color={C.onSurfaceVariant} />
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
            {/* 1. HERO RESULT CARD */}
            <ZakatResultCard result={zakatResult} />

            {/* 2. NISAB STATUS BAR */}
            <ZakatNisabStatusBar result={zakatResult} />

            {/* 3. GOLD / SILVER RATES & BENCHMARK EDITOR */}
            <ZakatGoldPriceEditor />

            {/* 4. AUTO-SYNCED ASSETS (SAVINGS & RECEIVABLES) */}
            <ZakatAutoAssetsSection
              savingsBalance={savingsBalance}
              receivableDebts={debtStats.totalLentPending}
            />

            {/* 5. MANUAL ASSETS & JEWELRY */}
            <ZakatManualAssetsSection
              onOpenAddItem={handleOpenAdd}
              onEditItem={handleOpenEdit}
            />

            {/* 6. DEDUCTIONS & LIABILITIES */}
            <ZakatDeductionsSection
              activeLoans={loanStats.totalOutstanding}
              payableDebts={debtStats.totalBorrowedPending}
              onOpenAddItem={handleOpenAdd}
              onEditItem={handleOpenEdit}
            />
          </ScrollView>

          {/* Add / Edit Sub-modal */}
          <ZakatAddItemModal
            visible={addItemModalVisible}
            isDeductionInitial={isDeductionModalMode}
            itemToEdit={itemToEdit}
            onClose={() => {
              setAddItemModalVisible(false);
              setItemToEdit(null);
            }}
          />
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
    backgroundColor: '#0D1113',
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
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: ZAKAT_COLORS.goldGlow,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resetBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#181F23',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#181F23',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
});
