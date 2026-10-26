import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
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

import { AddBazaarModal } from '@/components/mess/add-bazaar-modal';
import { AddUtilityModal } from '@/components/mess/add-utility-modal';
import { DailyMealLoggerSheet } from '@/components/mess/daily-meal-logger-sheet';
import { MessHeroStatCard } from '@/components/mess/mess-hero-stat-card';
import { MessMemberLedgerCard } from '@/components/mess/mess-member-ledger-card';
import { MessWhatsAppShareModal } from '@/components/mess/mess-whatsapp-share-modal';
import {
  generateMessWhatsAppReport,
  useMessStore,
} from '@/stores/mess-store';
import { Vital } from '@/constants/vital-theme';

const C = Vital.colors;
const F = Vital.fonts;

type MessTab = 'LEDGER' | 'BAZAAR' | 'UTILITIES';

interface MessManagerModalProps {
  visible: boolean;
  onClose: () => void;
}

export function MessManagerModal({ visible, onClose }: MessManagerModalProps) {
  const currentSession = useMessStore((s) => s.currentSession);
  const getStats = useMessStore((s) => s.getStats);
  const getSettlements = useMessStore((s) => s.getSettlements);
  const recordDeposit = useMessStore((s) => s.recordDeposit);
  const updateMemberMeals = useMessStore((s) => s.updateMemberMeals);
  const deleteBazaarEntry = useMessStore((s) => s.deleteBazaarEntry);
  const deleteUtilityBill = useMessStore((s) => s.deleteUtilityBill);
  const addMember = useMessStore((s) => s.addMember);
  const syncDueBalancesToUdhaar = useMessStore((s) => s.syncDueBalancesToUdhaar);

  const [activeTab, setActiveTab] = useState<MessTab>('LEDGER');

  // Sub-modals
  const [bazaarModalVisible, setBazaarModalVisible] = useState(false);
  const [utilityModalVisible, setUtilityModalVisible] = useState(false);
  const [mealLoggerVisible, setMealLoggerVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  // Quick Action Dialog States
  const [depositDialogMemberId, setDepositDialogMemberId] = useState<string | null>(null);
  const [depositAmountStr, setDepositAmountStr] = useState('');

  const [mealsDialogMemberId, setMealsDialogMemberId] = useState<string | null>(null);
  const [mealsCountStr, setMealsCountStr] = useState('');

  const [newMemberName, setNewMemberName] = useState('');
  const [addMemberVisible, setAddMemberVisible] = useState(false);

  const stats = useMemo(() => getStats(), [getStats, currentSession]);
  const settlements = useMemo(() => getSettlements(), [getSettlements, currentSession]);

  const handleSyncAllDues = async () => {
    const count = await syncDueBalancesToUdhaar();
    if (count > 0) {
      Alert.alert(
        'Udhaar Synced',
        `${count} জন মেম্বারের বকেয়া টাকা Debt/Udhaar লেজারে যুক্ত হয়েছে!`
      );
    } else {
      Alert.alert('No Dues', 'কোনো মেম্বারের বকেয়া টাকা নেই।');
    }
  };

  const handleSaveDeposit = async () => {
    if (!depositDialogMemberId) return;
    const amount = parseFloat(depositAmountStr);
    if (amount > 0) {
      await recordDeposit(depositDialogMemberId, amount);
    }
    setDepositDialogMemberId(null);
    setDepositAmountStr('');
  };

  const handleSaveMeals = async () => {
    if (!mealsDialogMemberId) return;
    const count = parseFloat(mealsCountStr);
    if (!isNaN(count) && count >= 0) {
      await updateMemberMeals(mealsDialogMemberId, count);
    }
    setMealsDialogMemberId(null);
    setMealsCountStr('');
  };

  const handleCreateMember = async () => {
    if (!newMemberName.trim()) return;
    await addMember(newMemberName.trim());
    setNewMemberName('');
    setAddMemberVisible(false);
  };

  const reportText = useMemo(
    () => generateMessWhatsAppReport(currentSession),
    [currentSession]
  );

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
                <MaterialIcons name="apartment" size={20} color="#38BDF8" />
              </View>
              <View>
                <Text style={styles.title}>Bachelor Mess Studio</Text>
                <Text style={styles.subtitle}>
                  {currentSession.monthTitle} • Flat Utility & Meal Tracker
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={20} color={C.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Sub-tab Switcher */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              onPress={() => {
                void Haptics.selectionAsync().catch(() => {});
                setActiveTab('LEDGER');
              }}
              style={[
                styles.tabBtn,
                activeTab === 'LEDGER' && styles.tabBtnActive,
              ]}>
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === 'LEDGER' && styles.tabBtnTextActive,
                ]}>
                মেস লেজার ({settlements.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                void Haptics.selectionAsync().catch(() => {});
                setActiveTab('BAZAAR');
              }}
              style={[
                styles.tabBtn,
                activeTab === 'BAZAAR' && styles.tabBtnActive,
              ]}>
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === 'BAZAAR' && styles.tabBtnTextActive,
                ]}>
                বাজার খরচ ({currentSession.bazaarEntries.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                void Haptics.selectionAsync().catch(() => {});
                setActiveTab('UTILITIES');
              }}
              style={[
                styles.tabBtn,
                activeTab === 'UTILITIES' && styles.tabBtnActive,
              ]}>
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === 'UTILITIES' && styles.tabBtnTextActive,
                ]}>
                বাসা ও বিল ({currentSession.utilityBills.length})
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}>
            {/* TAB 1: LEDGER */}
            {activeTab === 'LEDGER' && (
              <View style={styles.tabContent}>
                {/* Hero Stats */}
                <MessHeroStatCard
                  monthTitle={currentSession.monthTitle}
                  stats={stats}
                />

                {/* Quick Master Actions */}
                <View style={styles.actionGrid}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setMealLoggerVisible(true)}
                    style={[styles.quickActionBtn, { backgroundColor: 'rgba(56, 189, 248, 0.12)' }]}>
                    <MaterialIcons name="fastfood" size={16} color="#38BDF8" />
                    <Text style={[styles.quickActionText, { color: '#38BDF8' }]}>
                      Daily Meals
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setShareModalVisible(true)}
                    style={[styles.quickActionBtn, { backgroundColor: 'rgba(32, 201, 151, 0.12)' }]}>
                    <MaterialIcons name="share" size={16} color="#20C997" />
                    <Text style={[styles.quickActionText, { color: '#20C997' }]}>
                      WhatsApp Report
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleSyncAllDues}
                    style={[styles.quickActionBtn, { backgroundColor: 'rgba(255, 146, 43, 0.12)' }]}>
                    <MaterialIcons name="swap-horiz" size={16} color="#FF922B" />
                    <Text style={[styles.quickActionText, { color: '#FF922B' }]}>
                      Sync to Udhaar
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Roommate Ledger List */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>ROOMMATE BALANCES & HISAB</Text>
                  <TouchableOpacity
                    onPress={() => setAddMemberVisible(true)}
                    style={styles.addMemberBtn}>
                    <MaterialIcons name="person-add" size={12} color="#38BDF8" />
                    <Text style={styles.addMemberText}>+ Member</Text>
                  </TouchableOpacity>
                </View>

                {settlements.map((s) => (
                  <MessMemberLedgerCard
                    key={s.memberId}
                    settlement={s}
                    onAddDeposit={(id) => {
                      setDepositDialogMemberId(id);
                      setDepositAmountStr('');
                    }}
                    onEditMeals={(id) => {
                      setMealsDialogMemberId(id);
                      setMealsCountStr(s.totalMeals.toString());
                    }}
                    onSyncUdhaar={async () => {
                      await handleSyncAllDues();
                    }}
                  />
                ))}
              </View>
            )}

            {/* TAB 2: BAZAAR LOG */}
            {activeTab === 'BAZAAR' && (
              <View style={styles.tabContent}>
                <View style={styles.tabHeaderRow}>
                  <View>
                    <Text style={styles.sectionTitle}>MONTHLY BAZAAR LOGS</Text>
                    <Text style={styles.subInfo}>
                      Total: ৳{stats.totalBazaar.toLocaleString()}
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setBazaarModalVisible(true)}
                    style={styles.ctaBtn}>
                    <MaterialIcons name="add" size={16} color="#101416" />
                    <Text style={styles.ctaBtnText}>নতুন বাজার</Text>
                  </TouchableOpacity>
                </View>

                {currentSession.bazaarEntries.map((b) => (
                  <View key={b.id} style={styles.logCard}>
                    <View style={styles.logTop}>
                      <View style={styles.logLeft}>
                        <View style={styles.logIcon}>
                          <MaterialIcons
                            name="shopping-bag"
                            size={16}
                            color="#20C997"
                          />
                        </View>
                        <View>
                          <Text style={styles.logShopper}>{b.shopperName}</Text>
                          <Text style={styles.logDate}>{b.date}</Text>
                        </View>
                      </View>

                      <View style={styles.logRight}>
                        <Text style={styles.logAmount}>
                          ৳{b.amount.toLocaleString()}
                        </Text>
                        <TouchableOpacity
                          onPress={() => deleteBazaarEntry(b.id)}
                          style={styles.deleteBtn}>
                          <MaterialIcons
                            name="delete-outline"
                            size={16}
                            color={C.onSurfaceVariant}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <Text style={styles.logSummary}>{b.itemsSummary}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* TAB 3: UTILITIES & RENT */}
            {activeTab === 'UTILITIES' && (
              <View style={styles.tabContent}>
                <View style={styles.tabHeaderRow}>
                  <View>
                    <Text style={styles.sectionTitle}>FLAT RENT & UTILITY BILLS</Text>
                    <Text style={styles.subInfo}>
                      Total: ৳{stats.totalUtilities.toLocaleString()} (৳
                      {Math.round(
                        stats.totalUtilities /
                          Math.max(1, currentSession.members.length)
                      ).toLocaleString()}
                      /person)
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setUtilityModalVisible(true)}
                    style={[styles.ctaBtn, { backgroundColor: '#FF922B' }]}>
                    <MaterialIcons name="add" size={16} color="#101416" />
                    <Text style={styles.ctaBtnText}>নতুন বিল</Text>
                  </TouchableOpacity>
                </View>

                {currentSession.utilityBills.map((u) => (
                  <View key={u.id} style={styles.logCard}>
                    <View style={styles.logTop}>
                      <View style={styles.logLeft}>
                        <View
                          style={[
                            styles.logIcon,
                            { backgroundColor: 'rgba(255, 146, 43, 0.15)' },
                          ]}>
                          <MaterialIcons name="receipt" size={16} color="#FF922B" />
                        </View>
                        <View>
                          <Text style={styles.logShopper}>{u.title}</Text>
                          <Text style={styles.logDate}>
                            Equal Split among {currentSession.members.length} members
                          </Text>
                        </View>
                      </View>

                      <View style={styles.logRight}>
                        <Text style={[styles.logAmount, { color: '#FF922B' }]}>
                          ৳{u.amount.toLocaleString()}
                        </Text>
                        <TouchableOpacity
                          onPress={() => deleteUtilityBill(u.id)}
                          style={styles.deleteBtn}>
                          <MaterialIcons
                            name="delete-outline"
                            size={16}
                            color={C.onSurfaceVariant}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Sub-Modals */}
      <AddBazaarModal
        visible={bazaarModalVisible}
        onClose={() => setBazaarModalVisible(false)}
      />

      <AddUtilityModal
        visible={utilityModalVisible}
        onClose={() => setUtilityModalVisible(false)}
      />

      <DailyMealLoggerSheet
        visible={mealLoggerVisible}
        onClose={() => setMealLoggerVisible(false)}
      />

      <MessWhatsAppShareModal
        visible={shareModalVisible}
        reportText={reportText}
        onClose={() => setShareModalVisible(false)}
      />

      {/* Quick Deposit Dialog */}
      {depositDialogMemberId && (
        <Modal transparent animationType="fade" visible>
          <View style={styles.dialogOverlay}>
            <View style={styles.dialogCard}>
              <Text style={styles.dialogTitle}>টাকা জমা রেকর্ড করুন</Text>
              <TextInput
                style={styles.dialogInput}
                keyboardType="numeric"
                placeholder="e.g. 2000"
                placeholderTextColor={C.onSurfaceVariant}
                value={depositAmountStr}
                onChangeText={setDepositAmountStr}
                autoFocus
              />
              <View style={styles.dialogButtons}>
                <TouchableOpacity
                  onPress={() => setDepositDialogMemberId(null)}
                  style={styles.dialogCancel}>
                  <Text style={styles.dialogCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveDeposit}
                  style={styles.dialogConfirm}>
                  <Text style={styles.dialogConfirmText}>Save Deposit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Quick Meals Update Dialog */}
      {mealsDialogMemberId && (
        <Modal transparent animationType="fade" visible>
          <View style={styles.dialogOverlay}>
            <View style={styles.dialogCard}>
              <Text style={styles.dialogTitle}>মোট মিল আপডেট</Text>
              <TextInput
                style={styles.dialogInput}
                keyboardType="numeric"
                placeholder="e.g. 105"
                placeholderTextColor={C.onSurfaceVariant}
                value={mealsCountStr}
                onChangeText={setMealsCountStr}
                autoFocus
              />
              <View style={styles.dialogButtons}>
                <TouchableOpacity
                  onPress={() => setMealsDialogMemberId(null)}
                  style={styles.dialogCancel}>
                  <Text style={styles.dialogCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveMeals}
                  style={styles.dialogConfirm}>
                  <Text style={styles.dialogConfirmText}>Update Meals</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Add New Roommate Dialog */}
      {addMemberVisible && (
        <Modal transparent animationType="fade" visible>
          <View style={styles.dialogOverlay}>
            <View style={styles.dialogCard}>
              <Text style={styles.dialogTitle}>নতুন মেম্বার যুক্ত করুন</Text>
              <TextInput
                style={styles.dialogInput}
                placeholder="মেম্বারের নাম (e.g. রাহাত ইসলাম)"
                placeholderTextColor={C.onSurfaceVariant}
                value={newMemberName}
                onChangeText={setNewMemberName}
                autoFocus
              />
              <View style={styles.dialogButtons}>
                <TouchableOpacity
                  onPress={() => setAddMemberVisible(false)}
                  style={styles.dialogCancel}>
                  <Text style={styles.dialogCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCreateMember}
                  style={styles.dialogConfirm}>
                  <Text style={styles.dialogConfirmText}>Add Member</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
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
    backgroundColor: '#38BDF8',
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
  tabContent: {
    gap: 12,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 5,
  },
  quickActionText: {
    fontFamily: F.bold,
    fontSize: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: F.bold,
    fontSize: 10,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  addMemberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  addMemberText: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#38BDF8',
  },
  tabHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  subInfo: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
    marginTop: 1,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#20C997',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ctaBtnText: {
    fontFamily: F.bold,
    fontSize: 11,
    color: '#101416',
  },
  logCard: {
    backgroundColor: '#181F23',
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  logTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  logIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(32, 201, 151, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logShopper: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  logDate: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  logRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logAmount: {
    fontFamily: F.bold,
    fontSize: 14,
    color: '#20C997',
  },
  deleteBtn: {
    padding: 4,
  },
  logSummary: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
    paddingLeft: 40,
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#181F23',
    borderRadius: 18,
    padding: 18,
    gap: 14,
  },
  dialogTitle: {
    fontFamily: F.bold,
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  dialogInput: {
    backgroundColor: '#13191C',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: F.medium,
    fontSize: 15,
    color: '#FFFFFF',
  },
  dialogButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  dialogCancel: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#13191C',
  },
  dialogCancelText: {
    fontFamily: F.medium,
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  dialogConfirm: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#38BDF8',
  },
  dialogConfirmText: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#101416',
  },
});
