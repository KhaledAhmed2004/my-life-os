import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Vital } from '@/constants/vital-theme';
import { useExpenseStore } from '@/stores/expense-store';
import { useWarrantyStore } from '@/stores/warranty-store';
import { ClaimStatus, WarrantyItem } from '@/types/warranty';
import {
  CLAIM_STATUS_CONFIG,
  STATUS_THEME,
  WARRANTY_CATEGORY_CONFIG,
  WARRANTY_TYPE_LABELS,
} from './warranty-constants';

const C = Vital.colors;
const F = Vital.fonts;

interface WarrantyDetailSheetProps {
  visible: boolean;
  item: WarrantyItem | null;
  onClose: () => void;
  onEdit: (item: WarrantyItem) => void;
}

export function WarrantyDetailSheet({
  visible,
  item,
  onClose,
  onEdit,
}: WarrantyDetailSheetProps) {
  const computeStatus = useWarrantyStore((s) => s.computeStatus);
  const deleteItem = useWarrantyStore((s) => s.deleteItem);
  const addClaim = useWarrantyStore((s) => s.addClaim);
  const deleteClaim = useWarrantyStore((s) => s.deleteClaim);
  const isPrivacyMode = useExpenseStore((s) => s.isPrivacyMode);

  const [isAddingClaim, setIsAddingClaim] = useState(false);
  const [claimIssue, setClaimIssue] = useState('');
  const [claimStatus, setClaimStatus] = useState<ClaimStatus>('RESOLVED');
  const [claimRepairCenter, setClaimRepairCenter] = useState('');
  const [claimCostCovered, setClaimCostCovered] = useState('');
  const [claimNotes, setClaimNotes] = useState('');
  const [copiedSerial, setCopiedSerial] = useState(false);

  if (!item) return null;

  const { status, daysRemaining, progressPct, isExpiringSoon, isExpired } =
    computeStatus(item);

  const catConfig = WARRANTY_CATEGORY_CONFIG[item.category] || WARRANTY_CATEGORY_CONFIG.OTHER;
  const statusTheme = STATUS_THEME[status];

  const handleCopySerial = () => {
    if (!item.serialNumber) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setCopiedSerial(true);
    setTimeout(() => setCopiedSerial(false), 2500);
  };

  const handleDeleteItem = () => {
    Alert.alert(
      'Delete Warranty Item',
      `Are you sure you want to remove "${item.productName}" from your warranty wallet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteItem(item.id);
            onClose();
          },
        },
      ]
    );
  };

  const handleSaveClaim = async () => {
    if (!claimIssue.trim()) {
      Alert.alert('Required', 'Please describe the issue or repair reason.');
      return;
    }

    await addClaim(item.id, {
      claimDate: new Date().toISOString().split('T')[0],
      issueDescription: claimIssue.trim(),
      status: claimStatus,
      repairCenter: claimRepairCenter.trim() || undefined,
      costCovered: parseFloat(claimCostCovered) || 0,
      claimNotes: claimNotes.trim() || undefined,
      resolvedDate: claimStatus === 'RESOLVED' ? new Date().toISOString().split('T')[0] : undefined,
    });

    setIsAddingClaim(false);
    setClaimIssue('');
    setClaimRepairCenter('');
    setClaimCostCovered('');
    setClaimNotes('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* 1. HEADER */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.iconSquircle, { backgroundColor: catConfig.bgColor }]}>
                <MaterialIcons name={catConfig.icon} size={20} color={catConfig.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerProductName} numberOfLines={1}>
                  {item.productName}
                </Text>
                <Text style={styles.headerBrand} numberOfLines={1}>
                  {item.brand} {item.modelNumber ? `• ${item.modelNumber}` : ''}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={20} color={C.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}>
            {/* 2. STATUS & COUNTDOWN HERO BANNER */}
            <View
              style={[
                styles.statusHeroBanner,
                { backgroundColor: statusTheme.bg },
              ]}>
              <View style={styles.statusHeroTop}>
                <View style={styles.statusHeroBadge}>
                  <MaterialIcons name={statusTheme.icon} size={14} color={statusTheme.color} />
                  <Text style={[styles.statusHeroText, { color: statusTheme.color }]}>
                    {statusTheme.label}
                  </Text>
                </View>
                <Text style={styles.statusHeroType}>
                  {WARRANTY_TYPE_LABELS[item.warrantyType]}
                </Text>
              </View>

              <View style={styles.statusCountdownRow}>
                <Text style={[styles.statusHeroDays, { color: statusTheme.color }]}>
                  {isExpired
                    ? `Expired on ${item.warrantyEndDate}`
                    : `${daysRemaining} days remaining`}
                </Text>
                <Text style={styles.statusCoverageMonths}>
                  {item.warrantyDurationMonths} Months Total
                </Text>
              </View>

              {/* PROGRESS BAR */}
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progressPct}%`, backgroundColor: statusTheme.color },
                  ]}
                />
              </View>
            </View>

            {/* 3. SERIAL NUMBER COPY CARD */}
            {item.serialNumber && (
              <View style={styles.serialCard}>
                <View style={styles.serialInfo}>
                  <Text style={styles.specLabel}>SERIAL NUMBER / IMEI</Text>
                  <Text style={styles.serialText} selectable>
                    {item.serialNumber}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={handleCopySerial}
                  style={[
                    styles.copyBtn,
                    copiedSerial && styles.copyBtnSuccess,
                  ]}>
                  <MaterialIcons
                    name={copiedSerial ? 'check' : 'content-copy'}
                    size={14}
                    color={copiedSerial ? '#20C997' : '#FFFFFF'}
                  />
                  <Text
                    style={[
                      styles.copyBtnText,
                      copiedSerial && { color: '#20C997' },
                    ]}>
                    {copiedSerial ? 'Copied' : 'Copy'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 4. KEY SPECIFICATIONS GRID */}
            <View style={styles.specsGrid}>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>PURCHASE PRICE</Text>
                <Text style={styles.specValuePrimary}>
                  {isPrivacyMode ? '•••• ৳' : `৳ ${item.purchasePrice.toLocaleString('en-US')}`}
                </Text>
              </View>

              <View style={styles.specItem}>
                <Text style={styles.specLabel}>STORE / RETAILER</Text>
                <Text style={styles.specValue}>
                  {item.storeName || 'Not specified'}
                </Text>
              </View>

              <View style={styles.specItem}>
                <Text style={styles.specLabel}>PURCHASE DATE</Text>
                <Text style={styles.specValue}>{item.purchaseDate}</Text>
              </View>

              <View style={styles.specItem}>
                <Text style={styles.specLabel}>EXPIRATION DATE</Text>
                <Text
                  style={[
                    styles.specValue,
                    isExpiringSoon && { color: '#FCC419', fontFamily: F.sansBold },
                    isExpired && { color: '#FA5252', fontFamily: F.sansBold },
                  ]}>
                  {item.warrantyEndDate}
                </Text>
              </View>
            </View>

            {/* 5. NOTES & TERMS */}
            {item.notes && (
              <View style={styles.notesBox}>
                <View style={styles.notesHeader}>
                  <MaterialIcons name="description" size={14} color="#FF922B" />
                  <Text style={styles.notesTitle}>COVERAGE NOTES & TERMS</Text>
                </View>
                <Text style={styles.notesText}>{item.notes}</Text>
              </View>
            )}

            {/* 6. WARRANTY CLAIMS & REPAIRS SECTION */}
            <View style={styles.claimsSection}>
              <View style={styles.claimsHeader}>
                <View style={styles.claimsTitleRow}>
                  <MaterialIcons name="shield" size={16} color="#38BDF8" />
                  <Text style={styles.claimsTitle}>CLAIMS & SERVICE HISTORY</Text>
                  <View style={styles.claimCountPill}>
                    <Text style={styles.claimCountText}>
                      {item.claims ? item.claims.length : 0}
                    </Text>
                  </View>
                </View>

                {!isAddingClaim && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      setIsAddingClaim(true);
                    }}
                    style={styles.fileClaimBtn}>
                    <MaterialIcons name="add" size={14} color="#38BDF8" />
                    <Text style={styles.fileClaimBtnText}>File Claim</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* INLINE NEW CLAIM FORM */}
              {isAddingClaim && (
                <View style={styles.newClaimForm}>
                  <View style={styles.newClaimHeader}>
                    <Text style={styles.newClaimTitle}>File a Warranty / Repair Claim</Text>
                    <TouchableOpacity
                      onPress={() => setIsAddingClaim(false)}
                      hitSlop={8}>
                      <MaterialIcons name="close" size={16} color={C.onSurfaceVariant} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Issue Description *</Text>
                    <TextInput
                      value={claimIssue}
                      onChangeText={setClaimIssue}
                      placeholder="e.g. Screen flickering, battery swelling..."
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      style={styles.formInput}
                    />
                  </View>

                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>Service Center</Text>
                      <TextInput
                        value={claimRepairCenter}
                        onChangeText={setClaimRepairCenter}
                        placeholder="e.g. Apple Care BD"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        style={styles.formInput}
                      />
                    </View>

                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>Cost Covered (৳)</Text>
                      <TextInput
                        value={claimCostCovered}
                        onChangeText={setClaimCostCovered}
                        placeholder="e.g. 15000"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        keyboardType="numeric"
                        style={styles.formInput}
                      />
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Status</Text>
                    <View style={styles.statusPickerRow}>
                      {(['PENDING', 'IN_REVIEW', 'RESOLVED', 'REJECTED'] as ClaimStatus[]).map(
                        (st) => {
                          const isSelected = claimStatus === st;
                          const cfg = CLAIM_STATUS_CONFIG[st];
                          return (
                            <TouchableOpacity
                              key={st}
                              activeOpacity={0.8}
                              onPress={() => setClaimStatus(st)}
                              style={[
                                styles.claimStatusChip,
                                isSelected && { backgroundColor: cfg.bg, borderColor: cfg.color },
                              ]}>
                              <Text
                                style={[
                                  styles.claimStatusChipText,
                                  isSelected && { color: cfg.color, fontFamily: F.sansBold },
                                ]}>
                                {cfg.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        }
                      )}
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Outcome Notes</Text>
                    <TextInput
                      value={claimNotes}
                      onChangeText={setClaimNotes}
                      placeholder="e.g. Panel replaced free of charge"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      style={styles.formInput}
                    />
                  </View>

                  <View style={styles.formActions}>
                    <TouchableOpacity
                      onPress={() => setIsAddingClaim(false)}
                      style={styles.formCancelBtn}>
                      <Text style={styles.formCancelBtnText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={handleSaveClaim}
                      style={styles.formSaveBtn}>
                      <Text style={styles.formSaveBtnText}>Save Claim</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* CLAIMS LIST */}
              {item.claims && item.claims.length > 0 ? (
                <View style={styles.claimsList}>
                  {item.claims.map((claim) => {
                    const cfg = CLAIM_STATUS_CONFIG[claim.status] || CLAIM_STATUS_CONFIG.PENDING;
                    return (
                      <View key={claim.id} style={styles.claimCard}>
                        <View style={styles.claimCardTop}>
                          <View style={{ flex: 1, gap: 2 }}>
                            <Text style={styles.claimIssue}>{claim.issueDescription}</Text>
                            <Text style={styles.claimDate}>
                              Filed on {claim.claimDate}
                              {claim.repairCenter ? ` • ${claim.repairCenter}` : ''}
                            </Text>
                          </View>

                          <View style={[styles.claimBadge, { backgroundColor: cfg.bg }]}>
                            <Text style={[styles.claimBadgeText, { color: cfg.color }]}>
                              {cfg.label}
                            </Text>
                          </View>
                        </View>

                        {claim.costCovered ? (
                          <View style={styles.claimCostRow}>
                            <MaterialIcons name="savings" size={13} color="#20C997" />
                            <Text style={styles.claimCostText}>
                              Covered under warranty: ৳ {claim.costCovered.toLocaleString('en-US')}
                            </Text>
                          </View>
                        ) : null}

                        {claim.claimNotes && (
                          <Text style={styles.claimNotesText}>{claim.claimNotes}</Text>
                        )}

                        <TouchableOpacity
                          onPress={() => deleteClaim(item.id, claim.id)}
                          style={styles.deleteClaimBtn}>
                          <MaterialIcons name="delete-outline" size={14} color="#FA5252" />
                          <Text style={styles.deleteClaimText}>Remove claim record</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              ) : (
                !isAddingClaim && (
                  <View style={styles.emptyClaimsBox}>
                    <MaterialIcons name="verified" size={24} color="#20C997" />
                    <Text style={styles.emptyClaimsTitle}>No Claims Filed</Text>
                    <Text style={styles.emptyClaimsSubtitle}>
                      If you experience any product defect or request servicing, file a claim here to track repairs and savings.
                    </Text>
                  </View>
                )
              )}
            </View>
          </ScrollView>

          {/* 7. FOOTER ACTIONS: EDIT & DELETE */}
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleDeleteItem}
              style={styles.deleteBtn}>
              <MaterialIcons name="delete-outline" size={18} color="#FA5252" />
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                onClose();
                onEdit(item);
              }}
              style={styles.editBtn}>
              <MaterialIcons name="edit" size={16} color="#101416" />
              <Text style={styles.editBtnText}>Edit Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#12171A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconSquircle: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerProductName: {
    fontFamily: F.sansBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  headerBrand: {
    fontFamily: F.sans,
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    padding: 16,
    gap: 14,
  },
  statusHeroBanner: {
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  statusHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusHeroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusHeroText: {
    fontFamily: F.sansBold,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  statusHeroType: {
    fontFamily: F.sansMedium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  statusCountdownRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  statusHeroDays: {
    fontFamily: F.sansBold,
    fontSize: 18,
  },
  statusCoverageMonths: {
    fontFamily: F.sansMedium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  serialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#171E22',
    borderRadius: 14,
    padding: 12,
  },
  serialInfo: {
    gap: 2,
    flex: 1,
  },
  serialText: {
    fontFamily: F.mono || F.sansBold,
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyBtnSuccess: {
    backgroundColor: 'rgba(32, 201, 151, 0.15)',
  },
  copyBtnText: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: '#FFFFFF',
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  specItem: {
    width: '47%',
    gap: 2,
  },
  specLabel: {
    fontFamily: F.sansBold,
    fontSize: 9,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  specValue: {
    fontFamily: F.sansMedium,
    fontSize: 12,
    color: '#FFFFFF',
  },
  specValuePrimary: {
    fontFamily: F.sansBold,
    fontSize: 14,
    color: '#20C997',
  },
  notesBox: {
    backgroundColor: 'rgba(255, 146, 43, 0.07)',
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notesTitle: {
    fontFamily: F.sansBold,
    fontSize: 10,
    color: '#FF922B',
    letterSpacing: 0.7,
  },
  notesText: {
    fontFamily: F.sans,
    fontSize: 12,
    color: C.onSurface,
    lineHeight: 17,
  },
  claimsSection: {
    gap: 10,
    marginTop: 4,
  },
  claimsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  claimsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  claimsTitle: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: C.onSurfaceVariant,
    letterSpacing: 0.7,
  },
  claimCountPill: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  claimCountText: {
    fontFamily: F.sansBold,
    fontSize: 10,
    color: '#38BDF8',
  },
  fileClaimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  fileClaimBtnText: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: '#38BDF8',
  },
  newClaimForm: {
    backgroundColor: '#171E22',
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  newClaimHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  newClaimTitle: {
    fontFamily: F.sansBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  formGroup: {
    gap: 4,
  },
  formLabel: {
    fontFamily: F.sansMedium,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  formInput: {
    backgroundColor: '#111518',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontFamily: F.sans,
    fontSize: 12,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  formRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusPickerRow: {
    flexDirection: 'row',
    gap: 6,
  },
  claimStatusChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingVertical: 6,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  claimStatusChipText: {
    fontFamily: F.sansMedium,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  formCancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  formCancelBtnText: {
    fontFamily: F.sansMedium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  formSaveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#38BDF8',
  },
  formSaveBtnText: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: '#101416',
  },
  claimsList: {
    gap: 8,
  },
  claimCard: {
    backgroundColor: '#161B1E',
    borderRadius: 12,
    padding: 11,
    gap: 6,
  },
  claimCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  claimIssue: {
    fontFamily: F.sansBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  claimDate: {
    fontFamily: F.sans,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  claimBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  claimBadgeText: {
    fontFamily: F.sansBold,
    fontSize: 9,
  },
  claimCostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(32, 201, 151, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  claimCostText: {
    fontFamily: F.sansBold,
    fontSize: 10,
    color: '#20C997',
  },
  claimNotesText: {
    fontFamily: F.sans,
    fontSize: 11,
    color: C.onSurfaceVariant,
    fontStyle: 'italic',
  },
  deleteClaimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  deleteClaimText: {
    fontFamily: F.sans,
    fontSize: 10,
    color: '#FA5252',
    opacity: 0.8,
  },
  emptyClaimsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
    padding: 16,
    gap: 4,
  },
  emptyClaimsTitle: {
    fontFamily: F.sansBold,
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 4,
  },
  emptyClaimsSubtitle: {
    fontFamily: F.sans,
    fontSize: 10,
    color: C.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 14,
    maxWidth: 280,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(250, 82, 82, 0.12)',
  },
  deleteBtnText: {
    fontFamily: F.sansBold,
    fontSize: 13,
    color: '#FA5252',
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FF922B',
    shadowColor: '#FF922B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  editBtnText: {
    fontFamily: F.sansBold,
    fontSize: 13,
    color: '#101416',
  },
});
