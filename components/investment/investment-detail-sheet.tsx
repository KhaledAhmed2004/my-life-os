import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { INVESTMENT_CATEGORY_META } from '@/components/investment/investment-constants';
import { SANCHAY_PATRA_RATES, useInvestmentStore } from '@/stores/investment-store';
import { Vital } from '@/constants/vital-theme';
import { InvestmentItem } from '@/types/investment';

const C = Vital.colors;
const F = Vital.fonts;

interface InvestmentDetailSheetProps {
  visible: boolean;
  item: InvestmentItem | null;
  onClose: () => void;
  onEdit: (item: InvestmentItem) => void;
}

export function InvestmentDetailSheet({
  visible,
  item,
  onClose,
  onEdit,
}: InvestmentDetailSheetProps) {
  const updateCurrentPrice = useInvestmentStore((s) => s.updateCurrentPrice);
  const markStatus = useInvestmentStore((s) => s.markStatus);
  const deleteInvestment = useInvestmentStore((s) => s.deleteInvestment);
  const getMaturityProjection = useInvestmentStore((s) => s.getMaturityProjection);

  const [priceInput, setPriceInput] = useState('');
  const [isEditingPrice, setIsEditingPrice] = useState(false);

  if (!item) return null;

  const meta = INVESTMENT_CATEGORY_META[item.category] || INVESTMENT_CATEGORY_META.OTHER;
  const pnl = item.currentValue - item.purchaseAmount;
  const pnlPercent = item.purchaseAmount > 0 ? (pnl / item.purchaseAmount) * 100 : 0;
  const isGain = pnl >= 0;

  const projection = getMaturityProjection(item);

  const handleSavePrice = async () => {
    const val = parseFloat(priceInput);
    if (!isNaN(val) && val > 0) {
      await updateCurrentPrice(item.id, val);
      setIsEditingPrice(false);
      setPriceInput('');
    }
  };

  const handleToggleMatured = () => {
    const nextStatus = item.status === 'ACTIVE' ? 'MATURED' : 'ACTIVE';
    void markStatus(item.id, nextStatus);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Investment',
      `Are you sure you want to remove "${item.name}" from your portfolio?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void deleteInvestment(item.id);
            onClose();
          },
        },
      ]
    );
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
              <View style={[styles.iconBox, { backgroundColor: meta.bgColor }]}>
                <MaterialIcons name={meta.icon} size={20} color={meta.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.subtitle}>
                  {item.institution || meta.label} • {meta.banglaLabel}
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
            {/* 1. HERO VALUE TILE */}
            <View style={styles.heroTile}>
              <View style={styles.heroRow}>
                <View>
                  <Text style={styles.heroSub}>CURRENT HOLDING VALUE</Text>
                  <Text style={styles.heroVal}>
                    ৳{item.currentValue.toLocaleString()}
                  </Text>
                </View>

                <View
                  style={[
                    styles.pnlBadge,
                    {
                      backgroundColor: isGain
                        ? 'rgba(32, 201, 151, 0.15)'
                        : 'rgba(255, 107, 107, 0.15)',
                    },
                  ]}>
                  <MaterialIcons
                    name={isGain ? 'trending-up' : 'trending-down'}
                    size={14}
                    color={isGain ? '#20C997' : '#FF6B6B'}
                  />
                  <Text
                    style={[
                      styles.pnlText,
                      { color: isGain ? '#20C997' : '#FF6B6B' },
                    ]}>
                    {isGain ? '+' : ''}
                    {Math.round(pnlPercent * 10) / 10}%
                  </Text>
                </View>
              </View>

              <View style={styles.heroFooter}>
                <Text style={styles.footerText}>
                  Cost Basis / Invested: ৳{item.purchaseAmount.toLocaleString()}
                </Text>
                <Text
                  style={[
                    styles.footerPnl,
                    { color: isGain ? '#20C997' : '#FF6B6B' },
                  ]}>
                  {isGain ? '+' : ''}৳{pnl.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* 2. STOCKS / CRYPTO LIVE PRICE UPDATER */}
            {(item.category === 'STOCKS' || item.category === 'CRYPTO') && (
              <View style={styles.updaterCard}>
                <View style={styles.updaterHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.updaterTitle}>Stock / Crypto Unit Price</Text>
                    <Text style={styles.updaterSub}>
                      {item.quantity || 1} units @ ৳{item.currentPrice || item.buyPrice || 0}/unit
                    </Text>
                  </View>

                  {!isEditingPrice ? (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        setIsEditingPrice(true);
                        setPriceInput(item.currentPrice?.toString() || '');
                      }}
                      style={styles.editPriceBtn}>
                      <MaterialIcons name="edit" size={14} color="#51CF66" />
                      <Text style={styles.editPriceBtnText}>Update Price</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                {isEditingPrice && (
                  <View style={styles.priceInputRow}>
                    <TextInput
                      style={styles.priceInput}
                      keyboardType="numeric"
                      placeholder="New market price per unit..."
                      placeholderTextColor={C.onSurfaceVariant}
                      value={priceInput}
                      onChangeText={setPriceInput}
                    />
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleSavePrice}
                      style={styles.savePriceBtn}>
                      <Text style={styles.savePriceBtnText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setIsEditingPrice(false)}
                      style={styles.cancelPriceBtn}>
                      <MaterialIcons name="close" size={16} color={C.onSurfaceVariant} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* 3. MATURITY & RETURNS PROJECTION */}
            {(item.category === 'SANCHAY_PATRA' ||
              item.category === 'DPS' ||
              item.category === 'FIXED_DEPOSIT') && (
              <View style={styles.detailsBox}>
                <Text style={styles.sectionHeader}>Maturity & Returns Engine</Text>

                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Annual Yield / Rate</Text>
                  <Text style={[styles.detailVal, { color: '#FF922B' }]}>
                    {item.interestRate || projection.annualYield}% p.a.
                  </Text>
                </View>

                {item.category === 'SANCHAY_PATRA' && item.sanchaySubtype && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailKey}>Scheme Payout</Text>
                    <Text style={styles.detailVal}>
                      {SANCHAY_PATRA_RATES[item.sanchaySubtype]?.payout || 'Periodic'}
                    </Text>
                  </View>
                )}

                {item.category === 'DPS' && item.monthlyDeposit && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailKey}>Monthly Installment</Text>
                    <Text style={styles.detailVal}>
                      ৳{item.monthlyDeposit.toLocaleString()} / month
                    </Text>
                  </View>
                )}

                {item.category === 'FIXED_DEPOSIT' && item.compoundingFrequency && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailKey}>Compounding</Text>
                    <Text style={styles.detailVal}>
                      {item.compoundingFrequency.replace('_', ' ')}
                    </Text>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Estimated Total Interest</Text>
                  <Text style={[styles.detailVal, { color: '#20C997' }]}>
                    +৳{projection.totalInterest.toLocaleString()}
                  </Text>
                </View>

                <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.detailKey}>Projected Maturity Payout</Text>
                  <Text style={[styles.detailVal, { color: '#FFFFFF', fontFamily: F.bold }]}>
                    ৳{projection.maturityAmount.toLocaleString()}
                  </Text>
                </View>
              </View>
            )}

            {/* 4. METADATA & NOTES */}
            <View style={styles.detailsBox}>
              <Text style={styles.sectionHeader}>Holding Details</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Start Date</Text>
                <Text style={styles.detailVal}>
                  {new Date(item.startDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </View>

              {item.maturityDate ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Maturity Date</Text>
                  <Text style={styles.detailVal}>
                    {new Date(item.maturityDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              ) : null}

              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Status</Text>
                <Text
                  style={[
                    styles.detailVal,
                    {
                      color: item.status === 'ACTIVE' ? '#20C997' : '#38BDF8',
                    },
                  ]}>
                  {item.status}
                </Text>
              </View>

              {item.notes ? (
                <View style={[styles.detailRow, { flexDirection: 'column', alignItems: 'flex-start', gap: 4, borderBottomWidth: 0 }]}>
                  <Text style={styles.detailKey}>Notes</Text>
                  <Text style={styles.notesText}>{item.notes}</Text>
                </View>
              ) : null}
            </View>

            {/* 5. BOTTOM ACTIONS */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleToggleMatured}
                style={[
                  styles.actionBtn,
                  {
                    backgroundColor:
                      item.status === 'ACTIVE'
                        ? 'rgba(56, 189, 248, 0.15)'
                        : 'rgba(32, 201, 151, 0.15)',
                  },
                ]}>
                <MaterialIcons
                  name={item.status === 'ACTIVE' ? 'check-circle' : 'restart-alt'}
                  size={16}
                  color={item.status === 'ACTIVE' ? '#38BDF8' : '#20C997'}
                />
                <Text
                  style={[
                    styles.actionBtnText,
                    {
                      color: item.status === 'ACTIVE' ? '#38BDF8' : '#20C997',
                    },
                  ]}>
                  {item.status === 'ACTIVE' ? 'Mark Matured' : 'Mark Active'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  onClose();
                  onEdit(item);
                }}
                style={[styles.actionBtn, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}>
                <MaterialIcons name="edit" size={16} color={C.onSurface} />
                <Text style={[styles.actionBtnText, { color: C.onSurface }]}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleDelete}
                style={[styles.actionBtn, { backgroundColor: 'rgba(255, 107, 107, 0.15)' }]}>
                <MaterialIcons name="delete-outline" size={16} color="#FF6B6B" />
                <Text style={[styles.actionBtnText, { color: '#FF6B6B' }]}>Delete</Text>
              </TouchableOpacity>
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
    maxHeight: '90%',
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
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
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
  heroTile: {
    backgroundColor: '#181F23',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroSub: {
    fontFamily: F.bold,
    fontSize: 9,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  heroVal: {
    fontFamily: F.bold,
    fontSize: 26,
    color: '#FFFFFF',
    marginTop: 2,
  },
  pnlBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pnlText: {
    fontFamily: F.bold,
    fontSize: 11,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  footerText: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  footerPnl: {
    fontFamily: F.bold,
    fontSize: 11,
  },
  updaterCard: {
    backgroundColor: '#181F23',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  updaterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  updaterTitle: {
    fontFamily: F.bold,
    fontSize: 12,
    color: C.onSurface,
  },
  updaterSub: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  editPriceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(81, 207, 102, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  editPriceBtnText: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#51CF66',
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#101416',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: F.medium,
    fontSize: 13,
    color: '#FFFFFF',
  },
  savePriceBtn: {
    backgroundColor: '#20C997',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  savePriceBtnText: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#101416',
  },
  cancelPriceBtn: {
    padding: 8,
  },
  detailsBox: {
    backgroundColor: '#181F23',
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  sectionHeader: {
    fontFamily: F.bold,
    fontSize: 11,
    color: C.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  detailKey: {
    fontFamily: F.regular,
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  detailVal: {
    fontFamily: F.medium,
    fontSize: 12,
    color: C.onSurface,
  },
  notesText: {
    fontFamily: F.regular,
    fontSize: 12,
    color: C.onSurface,
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  actionBtnText: {
    fontFamily: F.bold,
    fontSize: 12,
  },
});
