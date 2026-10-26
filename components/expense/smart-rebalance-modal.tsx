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
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getCategoryVectorIcon } from '@/constants/expense-categories';
import { Vital } from '@/constants/vital-theme';
import { useExpenseStore } from '@/stores/expense-store';

const C = Vital.colors;
const F = Vital.fonts;

interface SmartRebalanceModalProps {
  visible: boolean;
  onClose: () => void;
  targetDeficitCatId?: string | null;
}

export function SmartRebalanceModal({
  visible,
  onClose,
  targetDeficitCatId,
}: SmartRebalanceModalProps) {
  const insets = useSafeAreaInsets();
  const getCategoryBudgetStatus = useExpenseStore((s) => s.getCategoryBudgetStatus);
  const rebalanceEnvelopes = useExpenseStore((s) => s.rebalanceEnvelopes);

  const [selectedDeficitId, setSelectedDeficitId] = useState<string>('');
  const [selectedSurplusId, setSelectedSurplusId] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<number>(0);

  const statuses = getCategoryBudgetStatus();
  const surplusCategories = statuses
    .filter((s) => s.status === 'SAFE' && s.remaining > 500)
    .sort((a, b) => b.remaining - a.remaining);

  useEffect(() => {
    if (visible) {
      const allStatuses = getCategoryBudgetStatus();
      const defCats = allStatuses.filter((s) => s.status === 'OVERBUDGET' && s.overAmount > 0);
      const surCats = allStatuses
        .filter((s) => s.status === 'SAFE' && s.remaining > 500)
        .sort((a, b) => b.remaining - a.remaining);

      const def =
        targetDeficitCatId && defCats.some((d) => d.category.id === targetDeficitCatId)
          ? targetDeficitCatId
          : defCats[0]?.category.id || '';

      setSelectedDeficitId(def);

      const targetDefStatus = allStatuses.find((s) => s.category.id === def);
      const needed = targetDefStatus ? targetDefStatus.overAmount : 1000;

      const bestSurplus = surCats[0]?.category.id || '';
      setSelectedSurplusId(bestSurplus);

      const bestSurplusStatus = allStatuses.find((s) => s.category.id === bestSurplus);
      const maxAvailable = bestSurplusStatus ? bestSurplusStatus.remaining : 0;
      setTransferAmount(Math.min(needed, maxAvailable));
    }
  }, [visible, targetDeficitCatId, getCategoryBudgetStatus]);

  const activeDeficitStatus = statuses.find((s) => s.category.id === selectedDeficitId);
  const activeSurplusStatus = statuses.find((s) => s.category.id === selectedSurplusId);

  const handleConfirm = async () => {
    if (!selectedDeficitId || !selectedSurplusId || transferAmount <= 0) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    await rebalanceEnvelopes(selectedSurplusId, selectedDeficitId, transferAmount);
    onClose();
  };

  const handleSelectSurplus = (surplusId: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedSurplusId(surplusId);
    const surStatus = statuses.find((s) => s.category.id === surplusId);
    const needed = activeDeficitStatus ? activeDeficitStatus.overAmount : 1000;
    const maxAvailable = surStatus ? surStatus.remaining : 0;
    setTransferAmount(Math.min(needed, maxAvailable));
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.backdrop} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetContainer}>
          <View style={[styles.sheetContent, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            {/* HANDLE */}
            <View style={styles.handleBar} />

            {/* HEADER */}
            <View style={styles.headerRow}>
              <View style={styles.headerTitleBox}>
                <View style={styles.badgeRow}>
                  <MaterialIcons name="auto-fix-high" size={14} color="#C8F135" />
                  <Text style={styles.sheetBadgeText}>SMART REBALANCE ENGINE</Text>
                </View>
                <Text style={styles.sheetTitle}>Fix Envelope Deficit</Text>
              </View>

              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <MaterialIcons name="close" size={18} color={C.onSurface} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}>
              {/* DEFICIT CARD */}
              {activeDeficitStatus ? (
                <View style={styles.deficitCard}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardSectionLabel}>OVER-BUDGET ENVELOPE</Text>
                    <View style={styles.deficitPill}>
                      <Text style={styles.deficitPillText}>
                        -৳ {activeDeficitStatus.overAmount.toLocaleString('en-US')} Over
                      </Text>
                    </View>
                  </View>

                  <View style={styles.categoryItemRow}>
                    <View
                      style={[
                        styles.categoryIconSquircle,
                        {
                          backgroundColor: `${activeDeficitStatus.category.color}1A`,
                          borderColor: `${activeDeficitStatus.category.color}35`,
                          borderWidth: 1,
                        },
                      ]}>
                      <MaterialIcons
                        name={getCategoryVectorIcon(activeDeficitStatus.category.id) as any}
                        size={20}
                        color={activeDeficitStatus.category.color}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.categoryName}>{activeDeficitStatus.category.name}</Text>
                      <Text style={styles.categoryMeta}>
                        Spent ৳{activeDeficitStatus.spent.toLocaleString('en-US')} / Budget ৳{activeDeficitStatus.budget.toLocaleString('en-US')}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.emptyDeficitCard}>
                  <MaterialIcons name="check-circle" size={24} color="#20C997" />
                  <Text style={styles.emptyDeficitText}>All Envelopes Within Budget Bounds!</Text>
                </View>
              )}

              {/* ARROW TRANSFER VISUALIZER */}
              <View style={styles.transferArrowRow}>
                <View style={styles.dividerLine} />
                <View style={styles.arrowIconBox}>
                  <MaterialIcons name="arrow-downward" size={16} color="#C8F135" />
                </View>
                <View style={styles.dividerLine} />
              </View>

              {/* SURPLUS SELECTION */}
              <View style={styles.surplusSection}>
                <Text style={styles.surplusSectionTitle}>SELECT SURPLUS ENVELOPE TO TRANSFER FROM</Text>

                {surplusCategories.length === 0 ? (
                  <View style={styles.noSurplusBox}>
                    <MaterialIcons name="warning-amber" size={20} color="#FCC419" />
                    <Text style={styles.noSurplusText}>
                      No surplus funds found in other envelopes. Consider increasing master monthly budget.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.surplusList}>
                    {surplusCategories.map((sur) => {
                      const isSelected = sur.category.id === selectedSurplusId;
                      const iconName = getCategoryVectorIcon(sur.category.id);
                      return (
                        <TouchableOpacity
                          key={sur.category.id}
                          activeOpacity={0.8}
                          onPress={() => handleSelectSurplus(sur.category.id)}
                          style={[styles.surplusTile, isSelected && styles.surplusTileSelected]}>
                          <View
                            style={[
                              styles.categoryIconSquircle,
                              {
                                backgroundColor: `${sur.category.color}1A`,
                                borderColor: `${sur.category.color}35`,
                                borderWidth: 1,
                              },
                            ]}>
                            <MaterialIcons
                              name={iconName as any}
                              size={18}
                              color={sur.category.color}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.surplusName}>{sur.category.name}</Text>
                            <Text style={styles.surplusRemaining}>
                              ৳{sur.remaining.toLocaleString('en-US')} available buffer
                            </Text>
                          </View>
                          {isSelected && (
                            <View style={styles.checkSquircle}>
                              <MaterialIcons name="check" size={14} color="#101416" />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* LIVE TRANSFER PREVIEW CARD */}
              {activeDeficitStatus && activeSurplusStatus && transferAmount > 0 && (
                <View style={styles.previewCard}>
                  <Text style={styles.previewTitle}>PROPOSED REBALANCE PREVIEW</Text>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewItemName}>
                      {activeSurplusStatus.category.name}
                    </Text>
                    <Text style={styles.previewItemOld}>৳{activeSurplusStatus.budget.toLocaleString('en-US')}</Text>
                    <MaterialIcons name="arrow-forward" size={12} color={C.onSurfaceVariant} />
                    <Text style={styles.previewItemNew}>
                      ৳{(activeSurplusStatus.budget - transferAmount).toLocaleString('en-US')}
                    </Text>
                  </View>

                  <View style={styles.previewRow}>
                    <Text style={styles.previewItemName}>
                      {activeDeficitStatus.category.name}
                    </Text>
                    <Text style={styles.previewItemOld}>৳{activeDeficitStatus.budget.toLocaleString('en-US')}</Text>
                    <MaterialIcons name="arrow-forward" size={12} color={C.onSurfaceVariant} />
                    <Text style={styles.previewItemNewPositive}>
                      ৳{(activeDeficitStatus.budget + transferAmount).toLocaleString('en-US')}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* CONFIRM ACTION */}
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={surplusCategories.length === 0 || transferAmount <= 0}
              onPress={handleConfirm}
              style={[
                styles.confirmBtn,
                (surplusCategories.length === 0 || transferAmount <= 0) && styles.confirmBtnDisabled,
              ]}>
              <Text style={styles.confirmBtnText}>
                Confirm 1-Tap Transfer (৳{transferAmount.toLocaleString('en-US')})
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetContainer: {
    width: '100%',
  },
  sheetContent: {
    backgroundColor: '#161A1D',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 16,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    maxHeight: '88%',
  },
  handleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerTitleBox: {
    gap: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sheetBadgeText: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: '#C8F135',
    letterSpacing: 0.8,
  },
  sheetTitle: {
    fontFamily: F.sansBold,
    fontSize: 18,
    color: '#FFFFFF',
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
    gap: 14,
    paddingBottom: 10,
  },
  deficitCard: {
    backgroundColor: 'rgba(250, 82, 82, 0.08)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(250, 82, 82, 0.25)',
    gap: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardSectionLabel: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  deficitPill: {
    backgroundColor: 'rgba(250, 82, 82, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  deficitPillText: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: '#FA5252',
  },
  categoryItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryIconSquircle: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontFamily: F.sansBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  categoryMeta: {
    fontFamily: F.sans,
    fontSize: 12,
    color: C.onSurfaceVariant,
    marginTop: 1,
  },
  emptyDeficitCard: {
    backgroundColor: 'rgba(32, 201, 151, 0.08)',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(32, 201, 151, 0.2)',
  },
  emptyDeficitText: {
    fontFamily: F.sansBold,
    fontSize: 14,
    color: '#20C997',
  },
  transferArrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  arrowIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(200, 241, 53, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(200, 241, 53, 0.3)',
  },
  surplusSection: {
    gap: 8,
  },
  surplusSectionTitle: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  surplusList: {
    gap: 8,
  },
  surplusTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  surplusTileSelected: {
    backgroundColor: 'rgba(200, 241, 53, 0.08)',
    borderColor: '#C8F135',
  },
  surplusName: {
    fontFamily: F.sansBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  surplusRemaining: {
    fontFamily: F.sans,
    fontSize: 12,
    color: '#20C997',
  },
  checkSquircle: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: '#C8F135',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noSurplusBox: {
    backgroundColor: 'rgba(252, 196, 25, 0.08)',
    borderRadius: 14,
    padding: 14,
    gap: 6,
    alignItems: 'center',
  },
  noSurplusText: {
    fontFamily: F.sans,
    fontSize: 12,
    color: '#FCC419',
    textAlign: 'center',
    lineHeight: 16,
  },
  previewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  previewTitle: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewItemName: {
    fontFamily: F.sansMedium,
    fontSize: 12,
    color: C.onSurface,
    flex: 1,
  },
  previewItemOld: {
    fontFamily: F.sans,
    fontSize: 12,
    color: C.onSurfaceVariant,
    textDecorationLine: 'line-through',
  },
  previewItemNew: {
    fontFamily: F.sansBold,
    fontSize: 12,
    color: '#FCC419',
  },
  previewItemNewPositive: {
    fontFamily: F.sansBold,
    fontSize: 12,
    color: '#20C997',
  },
  confirmBtn: {
    backgroundColor: '#C8F135',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C8F135',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowOpacity: 0,
  },
  confirmBtnText: {
    fontFamily: F.sansBold,
    fontSize: 14,
    color: '#101416',
  },
});
