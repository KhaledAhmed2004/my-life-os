import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  REGION_OPTIONS,
  TAXPAYER_OPTIONS,
} from '@/components/tax/tax-constants';
import { TaxChallanSummarySheet } from '@/components/tax/tax-challan-summary-sheet';
import { TaxRebateOptimizerCard } from '@/components/tax/tax-rebate-optimizer-card';
import { TaxSlabProgressBar } from '@/components/tax/tax-slab-progress-bar';
import { useTaxStore } from '@/stores/tax-store';
import { Vital } from '@/constants/vital-theme';
import { TaxpayerCategory, TaxRegion } from '@/types/tax';

const C = Vital.colors;
const F = Vital.fonts;

type StudioTab = 'CALCULATOR' | 'INCOMES' | 'INVESTMENTS' | 'PROFILE';

interface TaxCalculatorModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenInvestments?: () => void;
}

export function TaxCalculatorModal({
  visible,
  onClose,
  onOpenInvestments,
}: TaxCalculatorModalProps) {
  const profile = useTaxStore((s) => s.profile);
  const updateProfile = useTaxStore((s) => s.updateProfile);
  const updateIncomes = useTaxStore((s) => s.updateIncomes);
  const updateInvestments = useTaxStore((s) => s.updateInvestments);
  const calculateTax = useTaxStore((s) => s.calculateTax);

  const [activeTab, setActiveTab] = useState<StudioTab>('CALCULATOR');
  const [challanVisible, setChallanVisible] = useState(false);

  const taxResult = useMemo(() => calculateTax(), [calculateTax, profile]);

  // Income Input Local State
  const [basicSalaryStr, setBasicSalaryStr] = useState(
    profile.incomes.monthlyBasicSalary.toString()
  );
  const [houseRentStr, setHouseRentStr] = useState(
    profile.incomes.monthlyHouseRent.toString()
  );
  const [medicalStr, setMedicalStr] = useState(
    profile.incomes.monthlyMedicalAllowance.toString()
  );
  const [conveyanceStr, setConveyanceStr] = useState(
    profile.incomes.monthlyConveyance.toString()
  );
  const [bonusStr, setBonusStr] = useState(
    profile.incomes.festivalBonuses.toString()
  );
  const [businessStr, setBusinessStr] = useState(
    profile.incomes.businessFreelanceAnnual.toString()
  );
  const [interestStr, setInterestStr] = useState(
    profile.incomes.bankInterestAnnual.toString()
  );

  // Investment Input Local State
  const [dpsStr, setDpsStr] = useState(profile.investments.dpsAnnual.toString());
  const [sanchayStr, setSanchayStr] = useState(
    profile.investments.sanchayPatraAnnual.toString()
  );
  const [stocksStr, setStocksStr] = useState(
    profile.investments.stockMarketAnnual.toString()
  );
  const [insuranceStr, setInsuranceStr] = useState(
    profile.investments.lifeInsurancePremium.toString()
  );
  const [gpfStr, setGpfStr] = useState(
    profile.investments.providentFundGpf.toString()
  );

  const handleSaveIncomes = async () => {
    await updateIncomes({
      monthlyBasicSalary: parseFloat(basicSalaryStr) || 0,
      monthlyHouseRent: parseFloat(houseRentStr) || 0,
      monthlyMedicalAllowance: parseFloat(medicalStr) || 0,
      monthlyConveyance: parseFloat(conveyanceStr) || 0,
      festivalBonuses: parseFloat(bonusStr) || 0,
      businessFreelanceAnnual: parseFloat(businessStr) || 0,
      bankInterestAnnual: parseFloat(interestStr) || 0,
    });
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setActiveTab('CALCULATOR');
  };

  const handleSaveInvestments = async () => {
    await updateInvestments({
      dpsAnnual: parseFloat(dpsStr) || 0,
      sanchayPatraAnnual: parseFloat(sanchayStr) || 0,
      stockMarketAnnual: parseFloat(stocksStr) || 0,
      lifeInsurancePremium: parseFloat(insuranceStr) || 0,
      providentFundGpf: parseFloat(gpfStr) || 0,
    });
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setActiveTab('CALCULATOR');
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
                <MaterialIcons name="account-balance" size={20} color="#D4A017" />
              </View>
              <View>
                <Text style={styles.title}>Bangladesh Income Tax</Text>
                <Text style={styles.subtitle}>
                  Finance Act 2024-25 • 15% Rebate Engine
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

          {/* Sub-tab Switcher */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              onPress={() => {
                void Haptics.selectionAsync().catch(() => {});
                setActiveTab('CALCULATOR');
              }}
              style={[
                styles.tabBtn,
                activeTab === 'CALCULATOR' && styles.tabBtnActive,
              ]}>
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === 'CALCULATOR' && styles.tabBtnTextActive,
                ]}>
                Summary
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                void Haptics.selectionAsync().catch(() => {});
                setActiveTab('INCOMES');
              }}
              style={[
                styles.tabBtn,
                activeTab === 'INCOMES' && styles.tabBtnActive,
              ]}>
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === 'INCOMES' && styles.tabBtnTextActive,
                ]}>
                Salary & Income
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                void Haptics.selectionAsync().catch(() => {});
                setActiveTab('INVESTMENTS');
              }}
              style={[
                styles.tabBtn,
                activeTab === 'INVESTMENTS' && styles.tabBtnActive,
              ]}>
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === 'INVESTMENTS' && styles.tabBtnTextActive,
                ]}>
                Rebate Vault
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                void Haptics.selectionAsync().catch(() => {});
                setActiveTab('PROFILE');
              }}
              style={[
                styles.tabBtn,
                activeTab === 'PROFILE' && styles.tabBtnActive,
              ]}>
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === 'PROFILE' && styles.tabBtnTextActive,
                ]}>
                Slabs & Rules
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}>
            {activeTab === 'CALCULATOR' && (
              <View style={styles.tabSection}>
                {/* 1. HERO NET TAX VALUATION */}
                <View style={styles.heroBox}>
                  <View style={styles.heroTop}>
                    <Text style={styles.heroLabel}>ESTIMATED ANNUAL TAX PAYABLE</Text>
                    <TouchableOpacity
                      onPress={() => setChallanVisible(true)}
                      style={styles.challanBtn}>
                      <MaterialIcons name="visibility" size={12} color="#D4A017" />
                      <Text style={styles.challanBtnText}>IT-11GA Form</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.amountDisplayRow}>
                    <Text style={styles.takaSign}>৳</Text>
                    <Text style={styles.heroAmountText}>
                      {taxResult.netTaxPayable.toLocaleString()}
                    </Text>
                  </View>

                  {/* Dual Sub-Tiles */}
                  <View style={styles.heroTilesRow}>
                    <View style={styles.heroMiniTile}>
                      <Text style={styles.miniLabel}>MONTHLY SALARY TDS</Text>
                      <Text style={styles.miniVal}>
                        ৳{taxResult.monthlyTdsRecommended.toLocaleString()}/mo
                      </Text>
                    </View>

                    <View style={styles.heroMiniTile}>
                      <Text style={styles.miniLabel}>EFFECTIVE TAX RATE</Text>
                      <Text style={[styles.miniVal, { color: '#38BDF8' }]}>
                        {taxResult.effectiveTaxRate}%
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 2. REBATE OPTIMIZER CARD */}
                <TaxRebateOptimizerCard
                  taxResult={taxResult}
                  onOpenInvestments={onOpenInvestments}
                />

                {/* 3. PROGRESSIVE SLAB VISUAL PROGRESS BAR */}
                <TaxSlabProgressBar
                  slabs={taxResult.slabs}
                  totalTaxableIncome={taxResult.totalTaxableIncome}
                />

                {/* 4. KEY SUMMARY QUICK TILES */}
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryTile}>
                    <Text style={styles.summaryKey}>Gross Salary</Text>
                    <Text style={styles.summaryVal}>
                      ৳{taxResult.grossAnnualSalary.toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.summaryTile}>
                    <Text style={styles.summaryKey}>1/3rd Salary Exemption</Text>
                    <Text style={[styles.summaryVal, { color: '#20C997' }]}>
                      -৳{taxResult.salaryExemptAmount.toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.summaryTile}>
                    <Text style={styles.summaryKey}>Tax-Free Threshold</Text>
                    <Text style={styles.summaryVal}>
                      ৳{taxResult.taxFreeLimit.toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.summaryTile}>
                    <Text style={styles.summaryKey}>Minimum Tax Floor</Text>
                    <Text style={styles.summaryVal}>
                      ৳{taxResult.minimumTax.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'INCOMES' && (
              <View style={styles.tabSection}>
                <Text style={styles.formTitle}>MONTHLY SALARY BREAKDOWN</Text>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Basic Salary (৳/month)</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    placeholder="60000"
                    placeholderTextColor={C.onSurfaceVariant}
                    value={basicSalaryStr}
                    onChangeText={setBasicSalaryStr}
                  />
                </View>

                <View style={styles.fieldRow}>
                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>House Rent (৳/mo)</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      placeholder="25000"
                      placeholderTextColor={C.onSurfaceVariant}
                      value={houseRentStr}
                      onChangeText={setHouseRentStr}
                    />
                  </View>

                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>Medical (৳/mo)</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      placeholder="5000"
                      placeholderTextColor={C.onSurfaceVariant}
                      value={medicalStr}
                      onChangeText={setMedicalStr}
                    />
                  </View>
                </View>

                <View style={styles.fieldRow}>
                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>Conveyance (৳/mo)</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      placeholder="5000"
                      placeholderTextColor={C.onSurfaceVariant}
                      value={conveyanceStr}
                      onChangeText={setConveyanceStr}
                    />
                  </View>

                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>Yearly Bonuses (৳)</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      placeholder="120000"
                      placeholderTextColor={C.onSurfaceVariant}
                      value={bonusStr}
                      onChangeText={setBonusStr}
                    />
                  </View>
                </View>

                <Text style={[styles.formTitle, { marginTop: 10 }]}>
                  OTHER TAXABLE INCOMES (ANNUAL)
                </Text>

                <View style={styles.fieldRow}>
                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>Business / Freelance (৳)</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={C.onSurfaceVariant}
                      value={businessStr}
                      onChangeText={setBusinessStr}
                    />
                  </View>

                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>Bank Profit / Interest (৳)</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      placeholder="15000"
                      placeholderTextColor={C.onSurfaceVariant}
                      value={interestStr}
                      onChangeText={setInterestStr}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleSaveIncomes}
                  style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>Update Income Profile</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeTab === 'INVESTMENTS' && (
              <View style={styles.tabSection}>
                <Text style={styles.formTitle}>
                  ELIGIBLE REBATE INVESTMENTS (৩য় তফসিল)
                </Text>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    DPS (Deposit Pension Scheme) — Max ৳১,২০,০০০/yr
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    placeholder="120000"
                    placeholderTextColor={C.onSurfaceVariant}
                    value={dpsStr}
                    onChangeText={setDpsStr}
                  />
                </View>

                <View style={styles.fieldRow}>
                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>Sanchay Patra (৳)</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      placeholder="200000"
                      placeholderTextColor={C.onSurfaceVariant}
                      value={sanchayStr}
                      onChangeText={setSanchayStr}
                    />
                  </View>

                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>Stock Market (DSE) (৳)</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      placeholder="50000"
                      placeholderTextColor={C.onSurfaceVariant}
                      value={stocksStr}
                      onChangeText={setStocksStr}
                    />
                  </View>
                </View>

                <View style={styles.fieldRow}>
                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>Life Insurance Premium (৳)</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      placeholder="30000"
                      placeholderTextColor={C.onSurfaceVariant}
                      value={insuranceStr}
                      onChangeText={setInsuranceStr}
                    />
                  </View>

                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>GPF / Provident Fund (৳)</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      placeholder="60000"
                      placeholderTextColor={C.onSurfaceVariant}
                      value={gpfStr}
                      onChangeText={setGpfStr}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleSaveInvestments}
                  style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>Save Rebate Inputs</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeTab === 'PROFILE' && (
              <View style={styles.tabSection}>
                <Text style={styles.formTitle}>TAXPAYER CATEGORY (করমুক্ত সীমা)</Text>

                <View style={styles.optionsList}>
                  {TAXPAYER_OPTIONS.map((opt) => {
                    const isSelected = profile.taxpayerCategory === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        activeOpacity={0.8}
                        onPress={() => updateProfile({ taxpayerCategory: opt.id })}
                        style={[
                          styles.optionCard,
                          isSelected && styles.optionCardActive,
                        ]}>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.optionTitle,
                              isSelected && styles.optionTitleActive,
                            ]}>
                            {opt.label}
                          </Text>
                          <Text style={styles.optionSub}>{opt.sub}</Text>
                        </View>
                        <View style={styles.limitTag}>
                          <Text style={styles.limitTagText}>{opt.limitText}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.switchRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.switchTitle}>
                      Parent of Child with Disability
                    </Text>
                    <Text style={styles.switchSub}>
                      Grants extra ৳৫০,০০০ tax-free limit
                    </Text>
                  </View>
                  <Switch
                    value={profile.hasDisabledChild}
                    onValueChange={(val) => updateProfile({ hasDisabledChild: val })}
                    trackColor={{ false: '#263035', true: '#20C997' }}
                  />
                </View>

                <Text style={[styles.formTitle, { marginTop: 12 }]}>
                  TAX REGION (ন্যূনতম কর এলাকা)
                </Text>

                <View style={styles.optionsList}>
                  {REGION_OPTIONS.map((reg) => {
                    const isSelected = profile.region === reg.id;
                    return (
                      <TouchableOpacity
                        key={reg.id}
                        activeOpacity={0.8}
                        onPress={() => updateProfile({ region: reg.id })}
                        style={[
                          styles.optionCard,
                          isSelected && styles.optionCardActive,
                        ]}>
                        <Text
                          style={[
                            styles.optionTitle,
                            { flex: 1 },
                            isSelected && styles.optionTitleActive,
                          ]}>
                          {reg.label}
                        </Text>
                        <Text style={styles.minTaxTag}>{reg.minTax}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* IT-11GA Form Preview Sheet */}
      <TaxChallanSummarySheet
        visible={challanVisible}
        taxResult={taxResult}
        onClose={() => setChallanVisible(false)}
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
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#181F23',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#D4A017',
  },
  tabBtnText: {
    fontFamily: F.medium,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  tabBtnTextActive: {
    fontFamily: F.bold,
    color: '#101416',
  },
  scrollBody: {
    padding: 16,
  },
  tabSection: {
    gap: 12,
  },
  heroBox: {
    backgroundColor: '#181F23',
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLabel: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#D4A017',
    letterSpacing: 0.6,
  },
  challanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212, 160, 23, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  challanBtnText: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#D4A017',
  },
  amountDisplayRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  takaSign: {
    fontFamily: F.bold,
    fontSize: 22,
    color: '#D4A017',
  },
  heroAmountText: {
    fontFamily: F.bold,
    fontSize: 32,
    color: '#FFFFFF',
  },
  heroTilesRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  heroMiniTile: {
    flex: 1,
    backgroundColor: '#13191C',
    borderRadius: 10,
    padding: 10,
    gap: 2,
  },
  miniLabel: {
    fontFamily: F.bold,
    fontSize: 8,
    color: C.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  miniVal: {
    fontFamily: F.bold,
    fontSize: 13,
    color: '#20C997',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryTile: {
    width: '48%',
    backgroundColor: '#181F23',
    borderRadius: 12,
    padding: 10,
    gap: 2,
  },
  summaryKey: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  summaryVal: {
    fontFamily: F.bold,
    fontSize: 12,
    color: C.onSurface,
  },
  formTitle: {
    fontFamily: F.bold,
    fontSize: 10,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  fieldGroup: {
    gap: 4,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fieldLabel: {
    fontFamily: F.medium,
    fontSize: 11,
    color: C.onSurface,
  },
  textInput: {
    backgroundColor: '#181F23',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: F.medium,
    fontSize: 13,
    color: '#FFFFFF',
  },
  saveBtn: {
    backgroundColor: '#D4A017',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    fontFamily: F.bold,
    fontSize: 13,
    color: '#101416',
  },
  optionsList: {
    gap: 8,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181F23',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionCardActive: {
    backgroundColor: 'rgba(212, 160, 23, 0.12)',
    borderColor: '#D4A017',
  },
  optionTitle: {
    fontFamily: F.medium,
    fontSize: 12,
    color: C.onSurface,
  },
  optionTitleActive: {
    fontFamily: F.bold,
    color: '#D4A017',
  },
  optionSub: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  limitTag: {
    backgroundColor: '#13191C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  limitTagText: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#20C997',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181F23',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  switchTitle: {
    fontFamily: F.bold,
    fontSize: 12,
    color: C.onSurface,
  },
  switchSub: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  minTaxTag: {
    fontFamily: F.bold,
    fontSize: 11,
    color: '#FF922B',
  },
});
