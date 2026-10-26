import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  INVESTMENT_CATEGORY_META,
} from '@/components/investment/investment-constants';
import {
  calculateDPSMaturity,
  calculateFDMaturity,
  calculateSanchayPatraMaturity,
  SANCHAY_PATRA_RATES,
  useInvestmentStore,
} from '@/stores/investment-store';
import { Vital } from '@/constants/vital-theme';
import {
  CompoundingFrequency,
  InvestmentCategory,
  InvestmentItem,
  SanchayPatraSubtype,
} from '@/types/investment';

const C = Vital.colors;
const F = Vital.fonts;

const CATEGORIES: InvestmentCategory[] = [
  'SANCHAY_PATRA',
  'DPS',
  'FIXED_DEPOSIT',
  'STOCKS',
  'MUTUAL_FUND',
  'CRYPTO',
  'OTHER',
];

interface AddInvestmentModalProps {
  visible: boolean;
  initialItem?: InvestmentItem | null;
  onClose: () => void;
}

export function AddInvestmentModal({
  visible,
  initialItem,
  onClose,
}: AddInvestmentModalProps) {
  const addInvestment = useInvestmentStore((s) => s.addInvestment);
  const updateInvestment = useInvestmentStore((s) => s.updateInvestment);

  const [category, setCategory] = useState<InvestmentCategory>('SANCHAY_PATRA');
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [notes, setNotes] = useState('');

  // Sanchay Patra
  const [sanchaySubtype, setSanchaySubtype] = useState<SanchayPatraSubtype>('PARIBAR');

  // Generic / FD
  const [purchaseAmountStr, setPurchaseAmountStr] = useState('');
  const [currentValueStr, setCurrentValueStr] = useState('');
  const [interestRateStr, setInterestRateStr] = useState('11.52');
  const [tenureMonthsStr, setTenureMonthsStr] = useState('60');
  const [compounding, setCompounding] = useState<CompoundingFrequency>('QUARTERLY');

  // DPS
  const [monthlyDepositStr, setMonthlyDepositStr] = useState('10000');

  // Stocks / Crypto
  const [tickerSymbol, setTickerSymbol] = useState('');
  const [quantityStr, setQuantityStr] = useState('');
  const [buyPriceStr, setBuyPriceStr] = useState('');
  const [currentPriceStr, setCurrentPriceStr] = useState('');

  // Sync initialItem if editing
  useEffect(() => {
    if (initialItem) {
      setCategory(initialItem.category);
      setName(initialItem.name);
      setInstitution(initialItem.institution || '');
      setNotes(initialItem.notes || '');
      setPurchaseAmountStr(initialItem.purchaseAmount.toString());
      setCurrentValueStr(initialItem.currentValue.toString());
      setInterestRateStr(initialItem.interestRate?.toString() || '');
      setTenureMonthsStr(initialItem.tenureMonths?.toString() || '');
      if (initialItem.sanchaySubtype) setSanchaySubtype(initialItem.sanchaySubtype);
      if (initialItem.compoundingFrequency) setCompounding(initialItem.compoundingFrequency);
      if (initialItem.monthlyDeposit) setMonthlyDepositStr(initialItem.monthlyDeposit.toString());
      if (initialItem.tickerSymbol) setTickerSymbol(initialItem.tickerSymbol);
      if (initialItem.quantity) setQuantityStr(initialItem.quantity.toString());
      if (initialItem.buyPrice) setBuyPriceStr(initialItem.buyPrice.toString());
      if (initialItem.currentPrice) setCurrentPriceStr(initialItem.currentPrice.toString());
    } else {
      // Default presets
      setCategory('SANCHAY_PATRA');
      setSanchaySubtype('PARIBAR');
      setName('পরিবার সঞ্চয়পত্র');
      setInstitution('National Savings Directorate');
      setPurchaseAmountStr('500000');
      setCurrentValueStr('500000');
      setInterestRateStr('11.52');
      setTenureMonthsStr('60');
      setMonthlyDepositStr('10000');
      setCompounding('QUARTERLY');
      setTickerSymbol('');
      setQuantityStr('');
      setBuyPriceStr('');
      setCurrentPriceStr('');
      setNotes('');
    }
  }, [initialItem, visible]);

  // When changing category, set smart defaults
  const handleCategoryChange = (cat: InvestmentCategory) => {
    void Haptics.selectionAsync().catch(() => {});
    setCategory(cat);

    if (cat === 'SANCHAY_PATRA') {
      setName(SANCHAY_PATRA_RATES[sanchaySubtype].label);
      setInstitution('National Savings Directorate');
      setInterestRateStr(SANCHAY_PATRA_RATES[sanchaySubtype].rate.toString());
      setTenureMonthsStr(SANCHAY_PATRA_RATES[sanchaySubtype].defaultMonths.toString());
    } else if (cat === 'DPS') {
      setName('Monthly DPS Scheme');
      setInstitution('BRAC Bank / City Bank');
      setInterestRateStr('8.5');
      setTenureMonthsStr('60');
    } else if (cat === 'FIXED_DEPOSIT') {
      setName('Fixed Deposit Receipt (FDR)');
      setInstitution('IDLC / DBBL');
      setInterestRateStr('9.5');
      setTenureMonthsStr('12');
    } else if (cat === 'STOCKS') {
      setName('Stock Holdings');
      setInstitution('Dhaka Stock Exchange (DSE)');
    } else if (cat === 'CRYPTO') {
      setName('Crypto Holding');
      setInstitution('Binance / Wallet');
    }
  };

  const handleSanchaySubtypeChange = (subtype: SanchayPatraSubtype) => {
    void Haptics.selectionAsync().catch(() => {});
    setSanchaySubtype(subtype);
    const meta = SANCHAY_PATRA_RATES[subtype];
    setName(meta.label);
    setInterestRateStr(meta.rate.toString());
    setTenureMonthsStr(meta.defaultMonths.toString());
  };

  // Live Live Projection Calculation
  const liveProjection = useMemo(() => {
    const principal = parseFloat(purchaseAmountStr) || 0;
    const rate = parseFloat(interestRateStr) || 0;
    const months = parseInt(tenureMonthsStr, 10) || 12;

    if (category === 'SANCHAY_PATRA') {
      return calculateSanchayPatraMaturity(sanchaySubtype, principal, months);
    }
    if (category === 'DPS') {
      const monthly = parseFloat(monthlyDepositStr) || 0;
      return calculateDPSMaturity(monthly, months, rate);
    }
    if (category === 'FIXED_DEPOSIT') {
      return calculateFDMaturity(principal, rate, months, compounding);
    }
    if (category === 'STOCKS' || category === 'CRYPTO') {
      const qty = parseFloat(quantityStr) || 1;
      const buyP = parseFloat(buyPriceStr) || 0;
      const curP = parseFloat(currentPriceStr) || buyP;
      const invested = buyP * qty;
      const current = curP * qty;
      const pnl = current - invested;
      return {
        maturityDate: Date.now(),
        maturityAmount: current,
        totalInterest: pnl,
        annualYield: invested > 0 ? (pnl / invested) * 100 : 0,
      };
    }

    return {
      maturityDate: Date.now() + months * 30.4375 * 24 * 60 * 60 * 1000,
      maturityAmount: parseFloat(currentValueStr) || principal,
      totalInterest: Math.max(0, (parseFloat(currentValueStr) || principal) - principal),
      annualYield: rate,
    };
  }, [
    category,
    sanchaySubtype,
    purchaseAmountStr,
    interestRateStr,
    tenureMonthsStr,
    monthlyDepositStr,
    compounding,
    quantityStr,
    buyPriceStr,
    currentPriceStr,
    currentValueStr,
  ]);

  const handleSave = async () => {
    const finalName = name.trim() || 'Investment Item';
    let purchaseAmount = parseFloat(purchaseAmountStr) || 0;
    let currentValue = parseFloat(currentValueStr) || purchaseAmount;
    const interestRate = parseFloat(interestRateStr) || undefined;
    const tenureMonths = parseInt(tenureMonthsStr, 10) || undefined;

    let monthlyDeposit: number | undefined;
    let qty: number | undefined;
    let buyP: number | undefined;
    let curP: number | undefined;

    if (category === 'DPS') {
      monthlyDeposit = parseFloat(monthlyDepositStr) || 0;
      purchaseAmount = monthlyDeposit * (tenureMonths || 60);
      currentValue = liveProjection.maturityAmount;
    } else if (category === 'SANCHAY_PATRA') {
      currentValue = purchaseAmount; // Face value stays stable, interest is paid out
    } else if (category === 'FIXED_DEPOSIT') {
      currentValue = purchaseAmount;
    } else if (category === 'STOCKS' || category === 'CRYPTO') {
      qty = parseFloat(quantityStr) || 1;
      buyP = parseFloat(buyPriceStr) || 0;
      curP = parseFloat(currentPriceStr) || buyP;
      purchaseAmount = buyP * qty;
      currentValue = curP * qty;
    }

    const itemPayload = {
      name: finalName,
      category,
      institution: institution.trim() || undefined,
      status: 'ACTIVE' as const,
      startDate: initialItem?.startDate || Date.now(),
      maturityDate: liveProjection.maturityDate,
      tenureMonths,
      purchaseAmount,
      currentValue,
      interestRate,
      monthlyDeposit,
      compoundingFrequency: category === 'FIXED_DEPOSIT' ? compounding : undefined,
      sanchaySubtype: category === 'SANCHAY_PATRA' ? sanchaySubtype : undefined,
      tickerSymbol: tickerSymbol.trim() || undefined,
      quantity: qty,
      buyPrice: buyP,
      currentPrice: curP,
      notes: notes.trim() || undefined,
    };

    if (initialItem) {
      await updateInvestment(initialItem.id, itemPayload);
    } else {
      await addInvestment(itemPayload);
    }

    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Top Bar */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <MaterialIcons
                  name={initialItem ? 'edit' : 'add-chart'}
                  size={20}
                  color="#20C997"
                />
              </View>
              <View>
                <Text style={styles.title}>
                  {initialItem ? 'Edit Investment' : 'Add New Investment'}
                </Text>
                <Text style={styles.subtitle}>
                  DPS, Fixed Deposit, সঞ্চয়পত্র or Stocks
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
            contentContainerStyle={styles.scrollContent}>
            {/* 1. CATEGORY PICKER */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>INVESTMENT ASSET CLASS</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}>
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  const meta = INVESTMENT_CATEGORY_META[cat];
                  return (
                    <TouchableOpacity
                      key={cat}
                      activeOpacity={0.8}
                      onPress={() => handleCategoryChange(cat)}
                      style={[
                        styles.catPill,
                        isSelected && {
                          backgroundColor: meta.bgColor,
                          borderColor: meta.color,
                        },
                      ]}>
                      <MaterialIcons
                        name={meta.icon}
                        size={14}
                        color={isSelected ? meta.color : C.onSurfaceVariant}
                      />
                      <Text
                        style={[
                          styles.catPillText,
                          isSelected && { color: meta.color, fontFamily: F.bold },
                        ]}>
                        {meta.label.split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* 2. SANCHAY PATRA SUBTYPE PICKER */}
            {category === 'SANCHAY_PATRA' && (
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>SANCHAY PATRA SCHEME</Text>
                <View style={styles.subtypeGrid}>
                  {(Object.keys(SANCHAY_PATRA_RATES) as SanchayPatraSubtype[]).map((st) => {
                    const isSelected = sanchaySubtype === st;
                    const meta = SANCHAY_PATRA_RATES[st];
                    return (
                      <TouchableOpacity
                        key={st}
                        activeOpacity={0.8}
                        onPress={() => handleSanchaySubtypeChange(st)}
                        style={[
                          styles.subtypeBtn,
                          isSelected && styles.subtypeBtnActive,
                        ]}>
                        <Text
                          style={[
                            styles.subtypeTitle,
                            isSelected && styles.subtypeTitleActive,
                          ]}>
                          {meta.label}
                        </Text>
                        <Text style={styles.subtypeRate}>
                          {meta.rate}% • {meta.defaultMonths / 12} Yrs
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* 3. BASIC INFO */}
            <View style={styles.inputGroup}>
              <View style={styles.inputField}>
                <Text style={styles.fieldLabel}>INVESTMENT NAME / TITLE</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. BRAC Bank 5Y DPS"
                  placeholderTextColor={C.onSurfaceVariant}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputField}>
                <Text style={styles.fieldLabel}>INSTITUTION / BROKER / BANK</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. IDLC Finance / National Savings"
                  placeholderTextColor={C.onSurfaceVariant}
                  value={institution}
                  onChangeText={setInstitution}
                />
              </View>
            </View>

            {/* 4. DYNAMIC AMOUNTS & TERMS */}
            {category === 'DPS' ? (
              <View style={styles.rowTwo}>
                <View style={[styles.inputField, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>MONTHLY DEPOSIT (৳)</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    placeholder="10000"
                    placeholderTextColor={C.onSurfaceVariant}
                    value={monthlyDepositStr}
                    onChangeText={setMonthlyDepositStr}
                  />
                </View>

                <View style={[styles.inputField, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>TENURE (MONTHS)</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    placeholder="60"
                    placeholderTextColor={C.onSurfaceVariant}
                    value={tenureMonthsStr}
                    onChangeText={setTenureMonthsStr}
                  />
                </View>
              </View>
            ) : category === 'STOCKS' || category === 'CRYPTO' ? (
              <View style={styles.inputGroup}>
                <View style={styles.rowTwo}>
                  <View style={[styles.inputField, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>TICKER / SYMBOL</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. GP / BTC"
                      placeholderTextColor={C.onSurfaceVariant}
                      value={tickerSymbol}
                      onChangeText={setTickerSymbol}
                    />
                  </View>

                  <View style={[styles.inputField, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>QUANTITY / SHARES</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      placeholder="100"
                      placeholderTextColor={C.onSurfaceVariant}
                      value={quantityStr}
                      onChangeText={setQuantityStr}
                    />
                  </View>
                </View>

                <View style={styles.rowTwo}>
                  <View style={[styles.inputField, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>BUY PRICE / UNIT (৳)</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      placeholder="280"
                      placeholderTextColor={C.onSurfaceVariant}
                      value={buyPriceStr}
                      onChangeText={setBuyPriceStr}
                    />
                  </View>

                  <View style={[styles.inputField, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>CURRENT PRICE / UNIT (৳)</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      placeholder="308"
                      placeholderTextColor={C.onSurfaceVariant}
                      value={currentPriceStr}
                      onChangeText={setCurrentPriceStr}
                    />
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.inputGroup}>
                <View style={styles.rowTwo}>
                  <View style={[styles.inputField, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>PURCHASE / PRINCIPAL (৳)</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      placeholder="500000"
                      placeholderTextColor={C.onSurfaceVariant}
                      value={purchaseAmountStr}
                      onChangeText={setPurchaseAmountStr}
                    />
                  </View>

                  <View style={[styles.inputField, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>ANNUAL YIELD / RATE (%)</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      placeholder="11.52"
                      placeholderTextColor={C.onSurfaceVariant}
                      value={interestRateStr}
                      onChangeText={setInterestRateStr}
                    />
                  </View>
                </View>

                <View style={styles.rowTwo}>
                  <View style={[styles.inputField, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>TENURE (MONTHS)</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      placeholder="60"
                      placeholderTextColor={C.onSurfaceVariant}
                      value={tenureMonthsStr}
                      onChangeText={setTenureMonthsStr}
                    />
                  </View>

                  {category === 'FIXED_DEPOSIT' && (
                    <View style={[styles.inputField, { flex: 1 }]}>
                      <Text style={styles.fieldLabel}>COMPOUNDING</Text>
                      <View style={styles.compoundingRow}>
                        {(['MONTHLY', 'QUARTERLY', 'YEARLY'] as CompoundingFrequency[]).map((cf) => (
                          <TouchableOpacity
                            key={cf}
                            onPress={() => setCompounding(cf)}
                            style={[
                              styles.compBtn,
                              compounding === cf && styles.compBtnActive,
                            ]}>
                            <Text
                              style={[
                                styles.compBtnText,
                                compounding === cf && styles.compBtnTextActive,
                              ]}>
                              {cf.substring(0, 1)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* 5. LIVE PROJECTION PREVIEW TILE */}
            <View style={styles.previewBox}>
              <View style={styles.previewHeader}>
                <MaterialIcons name="auto-awesome" size={14} color="#20C997" />
                <Text style={styles.previewTitle}>LIVE RETURNS ESTIMATION</Text>
              </View>

              <View style={styles.previewRow}>
                <View>
                  <Text style={styles.previewSub}>PROJECTED MATURITY</Text>
                  <Text style={styles.previewAmount}>
                    ৳{liveProjection.maturityAmount.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.previewRight}>
                  <Text style={styles.previewSub}>TOTAL INTEREST / GAIN</Text>
                  <Text style={styles.previewGain}>
                    +৳{liveProjection.totalInterest.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* 6. NOTES */}
            <View style={styles.inputField}>
              <Text style={styles.fieldLabel}>NOTES & REMARKS (OPTIONAL)</Text>
              <TextInput
                style={[styles.textInput, { height: 60 }]}
                placeholder="e.g. Account number, nominee details, auto-renewal instructions..."
                placeholderTextColor={C.onSurfaceVariant}
                multiline
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            {/* 7. SAVE BUTTON */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSave}
              style={styles.saveBtn}>
              <MaterialIcons name="check" size={18} color="#101416" />
              <Text style={styles.saveBtnText}>
                {initialItem ? 'Save Changes' : 'Add to Investment Vault'}
              </Text>
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
  modalCard: {
    backgroundColor: '#101416',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: 24,
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
  closeBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  fieldBlock: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: F.bold,
    fontSize: 10,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  categoryScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#181F23',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  catPillText: {
    fontFamily: F.medium,
    fontSize: 11,
    color: C.onSurface,
  },
  subtypeGrid: {
    gap: 8,
  },
  subtypeBtn: {
    backgroundColor: '#181F23',
    borderRadius: 10,
    padding: 10,
    gap: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  subtypeBtnActive: {
    backgroundColor: 'rgba(255, 146, 43, 0.12)',
    borderColor: '#FF922B',
  },
  subtypeTitle: {
    fontFamily: F.medium,
    fontSize: 12,
    color: C.onSurface,
  },
  subtypeTitleActive: {
    fontFamily: F.bold,
    color: '#FF922B',
  },
  subtypeRate: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  inputGroup: {
    gap: 10,
  },
  inputField: {
    gap: 4,
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 10,
  },
  textInput: {
    backgroundColor: '#181F23',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: F.medium,
    fontSize: 13,
    color: '#FFFFFF',
  },
  compoundingRow: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#181F23',
    borderRadius: 12,
    padding: 4,
  },
  compBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  compBtnActive: {
    backgroundColor: '#339AF0',
  },
  compBtnText: {
    fontFamily: F.bold,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  compBtnTextActive: {
    color: '#FFFFFF',
  },
  previewBox: {
    backgroundColor: 'rgba(32, 201, 151, 0.08)',
    borderRadius: 14,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(32, 201, 151, 0.2)',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewTitle: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#20C997',
    letterSpacing: 0.6,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  previewSub: {
    fontFamily: F.regular,
    fontSize: 9,
    color: C.onSurfaceVariant,
    letterSpacing: 0.4,
  },
  previewAmount: {
    fontFamily: F.bold,
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 2,
  },
  previewRight: {
    alignItems: 'flex-end',
  },
  previewGain: {
    fontFamily: F.bold,
    fontSize: 14,
    color: '#20C997',
    marginTop: 2,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#20C997',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 6,
  },
  saveBtnText: {
    fontFamily: F.bold,
    fontSize: 14,
    color: '#101416',
  },
});
