import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EXPENSE_CATEGORIES, getCategoryVectorIcon } from '@/constants/expense-categories';
import { Vital } from '@/constants/vital-theme';
import {
  BudgetPreset,
  CATEGORY_BUCKET_MAP,
  DEFAULT_CATEGORY_BUDGETS,
  useExpenseStore,
} from '@/stores/expense-store';

const C = Vital.colors;
const F = Vital.fonts;

interface BudgetPlannerModalProps {
  visible: boolean;
  onClose: () => void;
}

export function BudgetPlannerModal({ visible, onClose }: BudgetPlannerModalProps) {
  const insets = useSafeAreaInsets();
  const categoryBudgets = useExpenseStore((s) => s.categoryBudgets);
  const monthlyBudget = useExpenseStore((s) => s.monthlyBudget);
  const updateMonthlyBudget = useExpenseStore((s) => s.updateMonthlyBudget);
  const setAllCategoryBudgets = useExpenseStore((s) => s.setAllCategoryBudgets);
  const applyBudgetPreset = useExpenseStore((s) => s.applyBudgetPreset);

  const [masterBudgetInput, setMasterBudgetInput] = useState<string>(String(monthlyBudget || 50000));
  const [localBudgets, setLocalBudgets] = useState<Record<string, number>>(
    categoryBudgets || DEFAULT_CATEGORY_BUDGETS
  );

  useEffect(() => {
    if (visible) {
      setLocalBudgets(categoryBudgets || DEFAULT_CATEGORY_BUDGETS);
      setMasterBudgetInput(String(monthlyBudget || 50000));
    }
  }, [visible, categoryBudgets, monthlyBudget]);

  const parsedMaster = parseFloat(masterBudgetInput) || monthlyBudget || 50000;
  const totalAllocated = Object.values(localBudgets).reduce((sum, val) => sum + (val || 0), 0);
  const unallocated = parsedMaster - totalAllocated;
  const isOverAllocated = unallocated < 0;

  const handleUpdateAmount = (catId: string, amount: number) => {
    setLocalBudgets((prev) => ({
      ...prev,
      [catId]: Math.max(0, amount),
    }));
  };

  const handleStepAmount = (catId: string, delta: number) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const current = localBudgets[catId] ?? DEFAULT_CATEGORY_BUDGETS[catId] ?? 3000;
    handleUpdateAmount(catId, Math.max(0, current + delta));
  };

  const handleApplyPreset = (preset: BudgetPreset) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    void applyBudgetPreset(preset);
  };

  const handleAutoBalance = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const flexibleCats = EXPENSE_CATEGORIES.filter(
      (c) => (CATEGORY_BUCKET_MAP[c.id] || 'FLEXIBLE') === 'FLEXIBLE'
    );
    const fixedCats = EXPENSE_CATEGORIES.filter(
      (c) => (CATEGORY_BUCKET_MAP[c.id] || 'FLEXIBLE') === 'FIXED'
    );
    const fixedTotal = fixedCats.reduce((sum, c) => sum + (localBudgets[c.id] || DEFAULT_CATEGORY_BUDGETS[c.id] || 0), 0);
    const remainingForFlex = Math.max(0, parsedMaster - fixedTotal);

    if (flexibleCats.length > 0 && remainingForFlex > 0) {
      const share = Math.floor(remainingForFlex / flexibleCats.length / 500) * 500;
      const updated = { ...localBudgets };
      flexibleCats.forEach((c) => {
        updated[c.id] = Math.max(500, share);
      });
      setLocalBudgets(updated);
    }
  };

  const handleSave = async () => {
    if (isOverAllocated) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    if (parsedMaster !== monthlyBudget) {
      await updateMonthlyBudget(parsedMaster);
    }
    await setAllCategoryBudgets(localBudgets);
    onClose();
  };

  const fixedCategories = EXPENSE_CATEGORIES.filter(
    (c) => (CATEGORY_BUCKET_MAP[c.id] || 'FLEXIBLE') === 'FIXED'
  );
  const flexibleCategories = EXPENSE_CATEGORIES.filter(
    (c) => (CATEGORY_BUCKET_MAP[c.id] || 'FLEXIBLE') === 'FLEXIBLE'
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.avoidingContainer}>
          <View style={styles.sheetContainer}>
            {/* HANDLE */}
            <View style={styles.handleBar} />

            {/* FIXED HEADER */}
            <View style={styles.headerRow}>
              <View style={styles.headerTitleBox}>
                <Text style={styles.sheetTitle}>Budget & Envelope Studio</Text>
                <Text style={styles.sheetSubtitle}>
                  Set master monthly limit & calibrate envelope allocations
                </Text>
              </View>

              <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={10}>
                <MaterialIcons name="close" size={20} color={C.onSurface} />
              </TouchableOpacity>
            </View>

            {/* SCROLLABLE CONTENT */}
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}>
              {/* MASTER BUDGET INPUT CARD */}
              <View style={styles.masterBudgetCard}>
                <Text style={styles.masterBudgetLabel}>MASTER MONTHLY BUDGET TARGET</Text>
                <View style={styles.masterInputRow}>
                  <Text style={styles.masterCurrencyPrefix}>৳</Text>
                  <TextInput
                    style={styles.masterInputField}
                    keyboardType="numeric"
                    value={masterBudgetInput}
                    onChangeText={setMasterBudgetInput}
                    placeholder="50000"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />
                </View>
              </View>

              {/* LIVE ALLOCATION GAUGE CARD */}
              <View style={styles.gaugeCard}>
                <View style={styles.gaugeHeader}>
                  <Text style={styles.gaugeLabel}>TOTAL ALLOCATED</Text>
                  <Text style={styles.gaugeValues}>
                    ৳ {totalAllocated.toLocaleString('en-US')} / ৳ {parsedMaster.toLocaleString('en-US')}
                  </Text>
                </View>

                {/* GAUGE PROGRESS BAR */}
                <View style={styles.gaugeTrack}>
                  <View
                    style={[
                      styles.gaugeFill,
                      {
                        width: `${Math.min(100, (totalAllocated / parsedMaster) * 100)}%`,
                        backgroundColor: isOverAllocated ? '#FA5252' : '#C8F135',
                      },
                    ]}
                  />
                </View>

                {/* BUFFER PILL */}
                <View style={styles.bufferRow}>
                  <View
                    style={[
                      styles.bufferBadge,
                      isOverAllocated ? styles.bufferBadgeRed : styles.bufferBadgeGreen,
                    ]}>
                    <MaterialIcons
                      name={isOverAllocated ? 'warning' : 'check-circle'}
                      size={14}
                      color={isOverAllocated ? '#FA5252' : '#C8F135'}
                    />
                    <Text
                      style={[
                        styles.bufferText,
                        isOverAllocated ? styles.bufferTextRed : styles.bufferTextGreen,
                      ]}>
                      {isOverAllocated
                        ? `Over-allocated by ৳ ${Math.abs(unallocated).toLocaleString('en-US')} (Save locked)`
                        : `৳ ${unallocated.toLocaleString('en-US')} Unallocated Buffer ✨`}
                    </Text>
                  </View>

                  {!isOverAllocated && unallocated > 0 && (
                    <TouchableOpacity onPress={handleAutoBalance} style={styles.autoBalanceBtn}>
                      <MaterialIcons name="auto-fix-high" size={13} color="#C8F135" />
                      <Text style={styles.autoBalanceText}>Auto-Distribute</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* STRATEGY PRESETS */}
              <Text style={styles.sectionHeader}>BUDGET STRATEGY PRESETS</Text>
              <ScrollView
                horizontal
                nestedScrollEnabled={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.presetsRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleApplyPreset('50_30_20')}
                  style={styles.presetBtn}>
                  <View style={[styles.presetIconBox, { backgroundColor: 'rgba(32, 201, 151, 0.15)' }]}>
                    <MaterialIcons name="pie-chart" size={15} color="#20C997" />
                  </View>
                  <Text style={styles.presetTitle}>50/30/20 Rule</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleApplyPreset('FITNESS')}
                  style={styles.presetBtn}>
                  <View style={[styles.presetIconBox, { backgroundColor: 'rgba(200, 241, 53, 0.15)' }]}>
                    <MaterialIcons name="fitness-center" size={15} color="#C8F135" />
                  </View>
                  <Text style={styles.presetTitle}>Fitness Heavy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleApplyPreset('FRUGAL')}
                  style={styles.presetBtn}>
                  <View style={[styles.presetIconBox, { backgroundColor: 'rgba(252, 196, 25, 0.15)' }]}>
                    <MaterialIcons name="shield" size={15} color="#FCC419" />
                  </View>
                  <Text style={styles.presetTitle}>Frugal Saver</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleApplyPreset('AUTO_FIT')}
                  style={styles.presetBtn}>
                  <View style={[styles.presetIconBox, { backgroundColor: 'rgba(167, 139, 250, 0.15)' }]}>
                    <MaterialIcons name="auto-awesome" size={15} color="#A78BFA" />
                  </View>
                  <Text style={styles.presetTitle}>Balanced Living</Text>
                </TouchableOpacity>
              </ScrollView>

              {/* BUCKET 1: FIXED COMMITMENTS */}
              <View style={styles.bucketSectionHeader}>
                <View style={styles.bucketTitleRow}>
                  <MaterialIcons name="lock" size={14} color="#748FFC" />
                  <Text style={styles.bucketSectionTitle}>BUCKET 1: FIXED BILLS & RENT</Text>
                </View>
                <Text style={styles.bucketSectionSubtitle}>Must-pay contractual obligations</Text>
              </View>

              <View style={styles.categoriesList}>
                {fixedCategories.map((cat) => renderCategoryCard(cat))}
              </View>

              {/* BUCKET 2: FLEXIBLE DAILY ENVELOPES */}
              <View style={[styles.bucketSectionHeader, { marginTop: 18 }]}>
                <View style={styles.bucketTitleRow}>
                  <MaterialIcons name="local-gas-station" size={14} color="#20C997" />
                  <Text style={styles.bucketSectionTitle}>BUCKET 2: DAILY FLEXIBLE LIVING</Text>
                </View>
                <Text style={styles.bucketSectionSubtitle}>Food, Commute, Fun & Lifestyle</Text>
              </View>

              <View style={styles.categoriesList}>
                {flexibleCategories.map((cat) => renderCategoryCard(cat))}
              </View>
            </ScrollView>

            {/* PINNED BOTTOM SAVE FOOTER */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={isOverAllocated}
                onPress={handleSave}
                style={[styles.saveActionBtn, isOverAllocated && styles.saveActionBtnDisabled]}>
                <MaterialIcons name="check" size={20} color={isOverAllocated ? C.onSurfaceVariant : '#101416'} />
                <Text style={[styles.saveActionText, isOverAllocated && styles.saveActionTextDisabled]}>
                  {isOverAllocated ? 'Fix Over-Allocation to Save' : 'Save & Apply Envelopes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );

  function renderCategoryCard(cat: (typeof EXPENSE_CATEGORIES)[0]) {
    const currentLimit = localBudgets[cat.id] ?? DEFAULT_CATEGORY_BUDGETS[cat.id] ?? 3000;
    const pctShare = parsedMaster > 0 ? (currentLimit / parsedMaster) * 100 : 0;
    const iconName = getCategoryVectorIcon(cat.id);

    return (
      <View key={cat.id} style={styles.catCard}>
        {/* TOP ROW */}
        <View style={styles.catCardHeader}>
          <View style={styles.catNameRow}>
            <View
              style={[
                styles.catIconBox,
                {
                  backgroundColor: `${cat.color}1A`,
                  borderColor: `${cat.color}35`,
                  borderWidth: 1,
                },
              ]}>
              <MaterialIcons name={iconName as any} size={18} color={cat.color} />
            </View>
            <View>
              <Text style={styles.catNameText}>{cat.name}</Text>
              <Text style={styles.catShareText}>{pctShare.toFixed(0)}% of master budget</Text>
            </View>
          </View>

          {/* NUMERIC AMOUNT INPUT */}
          <View style={styles.amountInputWrap}>
            <Text style={styles.currencyPrefix}>৳</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              value={String(currentLimit)}
              onChangeText={(val) => {
                const parsed = parseInt(val.replace(/[^0-9]/g, ''), 10);
                handleUpdateAmount(cat.id, isNaN(parsed) ? 0 : parsed);
              }}
            />
          </View>
        </View>

        {/* QUICK STEPPERS */}
        <View style={styles.steppersRow}>
          <TouchableOpacity onPress={() => handleStepAmount(cat.id, -1000)} style={styles.stepBtn}>
            <Text style={styles.stepBtnText}>-1k</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleStepAmount(cat.id, -500)} style={styles.stepBtn}>
            <Text style={styles.stepBtnText}>-500</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleStepAmount(cat.id, 500)} style={styles.stepBtn}>
            <Text style={styles.stepBtnText}>+500</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleStepAmount(cat.id, 1000)} style={styles.stepBtn}>
            <Text style={styles.stepBtnText}>+1k</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  avoidingContainer: {
    width: '100%',
    height: '92%',
  },
  sheetContainer: {
    flex: 1,
    backgroundColor: '#161A1D',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  scrollView: {
    flex: 1,
  },
  handleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'center',
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  headerTitleBox: {
    gap: 2,
    flex: 1,
  },
  sheetTitle: {
    fontFamily: F.sansBold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  sheetSubtitle: {
    fontFamily: F.sans,
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  masterBudgetCard: {
    backgroundColor: 'rgba(200, 241, 53, 0.06)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(200, 241, 53, 0.2)',
    gap: 6,
  },
  masterBudgetLabel: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: '#C8F135',
    letterSpacing: 0.8,
  },
  masterInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  masterCurrencyPrefix: {
    fontFamily: F.sansBold,
    fontSize: 22,
    color: '#C8F135',
  },
  masterInputField: {
    fontFamily: F.sansBold,
    fontSize: 22,
    color: '#FFFFFF',
    flex: 1,
  },
  gaugeCard: {
    backgroundColor: C.surfaceContainer,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: C.glassBorder,
    gap: 10,
  },
  gaugeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gaugeLabel: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: C.onSurfaceVariant,
    letterSpacing: 0.7,
  },
  gaugeValues: {
    fontFamily: F.sansBold,
    fontSize: 13,
    color: C.onSurface,
  },
  gaugeTrack: {
    height: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 4,
  },
  bufferRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bufferBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flex: 1,
  },
  bufferBadgeGreen: {
    backgroundColor: 'rgba(200, 241, 53, 0.1)',
  },
  bufferBadgeRed: {
    backgroundColor: 'rgba(250, 82, 82, 0.12)',
  },
  bufferText: {
    fontFamily: F.sansMedium,
    fontSize: 12,
  },
  bufferTextGreen: {
    color: '#C8F135',
  },
  bufferTextRed: {
    color: '#FA5252',
  },
  autoBalanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(200, 241, 53, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 6,
  },
  autoBalanceText: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: '#C8F135',
  },
  sectionHeader: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: C.onSurfaceVariant,
    letterSpacing: 0.8,
    marginTop: 6,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  presetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  presetIconBox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetTitle: {
    fontFamily: F.sansSemiBold,
    fontSize: 12,
    color: C.onSurface,
  },
  bucketSectionHeader: {
    gap: 2,
    marginTop: 8,
  },
  bucketTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bucketSectionTitle: {
    fontFamily: F.sansBold,
    fontSize: 12,
    color: C.onSurface,
    letterSpacing: 0.7,
  },
  bucketSectionSubtitle: {
    fontFamily: F.sans,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  categoriesList: {
    gap: 10,
  },
  catCard: {
    backgroundColor: C.surfaceContainer,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: C.glassBorder,
    gap: 8,
  },
  catCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  catIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catIconText: {
    fontSize: 17,
  },
  catNameText: {
    fontFamily: F.sansBold,
    fontSize: 13,
    color: C.onSurface,
  },
  catShareText: {
    fontFamily: F.sans,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  amountInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  currencyPrefix: {
    fontFamily: F.sansBold,
    fontSize: 13,
    color: '#C8F135',
  },
  amountInput: {
    fontFamily: F.sansBold,
    fontSize: 14,
    color: '#FFFFFF',
    minWidth: 50,
    textAlign: 'right',
  },
  steppersRow: {
    flexDirection: 'row',
    gap: 6,
  },
  stepBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  stepBtnText: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#161A1D',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  saveActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#C8F135',
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#C8F135',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveActionBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    shadowOpacity: 0,
  },
  saveActionText: {
    fontFamily: F.sansBold,
    fontSize: 14,
    color: '#101416',
  },
  saveActionTextDisabled: {
    color: C.onSurfaceVariant,
  },
});
