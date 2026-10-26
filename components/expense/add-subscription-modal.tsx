import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
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

import { Vital } from '@/constants/vital-theme';
import { useExpenseStore } from '@/stores/expense-store';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { BillingCycle, Subscription, SubscriptionCategory } from '@/types/subscription';

const C = Vital.colors;
const F = Vital.fonts;

export interface SubscriptionPreset {
  id: string;
  name: string;
  category: SubscriptionCategory;
  icon: keyof typeof MaterialIcons.glyphMap;
  amount: number;
  dueDay: number;
  billingCycle: BillingCycle;
  color: string;
}

export const SUBSCRIPTION_PRESETS: SubscriptionPreset[] = [
  { id: 'p-netflix', name: 'Netflix', category: 'STREAMING', icon: 'movie', amount: 300, dueDay: 15, billingCycle: 'MONTHLY', color: '#CC5DE8' },
  { id: 'p-spotify', name: 'Spotify Duo', category: 'STREAMING', icon: 'headphones', amount: 199, dueDay: 10, billingCycle: 'MONTHLY', color: '#1DB954' },
  { id: 'p-gym', name: "Gold's Gym", category: 'FITNESS', icon: 'fitness-center', amount: 3500, dueDay: 5, billingCycle: 'MONTHLY', color: '#FF6B6B' },
  { id: 'p-wifi', name: 'Fiber Broadband', category: 'UTILITIES', icon: 'wifi', amount: 1500, dueDay: 10, billingCycle: 'MONTHLY', color: '#20C997' },
  { id: 'p-rent', name: 'Apartment Rent', category: 'HOUSING', icon: 'home', amount: 25000, dueDay: 1, billingCycle: 'MONTHLY', color: '#4DABF7' },
  { id: 'p-chatgpt', name: 'ChatGPT Plus', category: 'SOFTWARE', icon: 'cloud-queue', amount: 2500, dueDay: 20, billingCycle: 'MONTHLY', color: '#FCC419' },
  { id: 'p-electric', name: 'Electricity / DPDC', category: 'UTILITIES', icon: 'bolt', amount: 3200, dueDay: 12, billingCycle: 'MONTHLY', color: '#F59F00' },
  { id: 'p-phone', name: 'Mobile Postpaid', category: 'COMMUTE', icon: 'phone-iphone', amount: 800, dueDay: 7, billingCycle: 'MONTHLY', color: '#339AF0' },
];

export const CATEGORIES: Array<{
  id: SubscriptionCategory;
  label: string;
  color: string;
  defaultIcon: keyof typeof MaterialIcons.glyphMap;
}> = [
  { id: 'FITNESS', label: 'Fitness & Health', color: '#FF6B6B', defaultIcon: 'fitness-center' },
  { id: 'STREAMING', label: 'Streaming & Media', color: '#CC5DE8', defaultIcon: 'movie' },
  { id: 'HOUSING', label: 'Rent & Housing', color: '#4DABF7', defaultIcon: 'home' },
  { id: 'UTILITIES', label: 'Internet & Power', color: '#20C997', defaultIcon: 'wifi' },
  { id: 'SOFTWARE', label: 'Software & AI', color: '#FCC419', defaultIcon: 'cloud-queue' },
  { id: 'COMMUTE', label: 'Transport & Auto', color: '#FF922B', defaultIcon: 'directions-car' },
  { id: 'OTHER', label: 'Other Recurring', color: '#845EF7', defaultIcon: 'credit-card' },
];

const EMOJI_TO_VECTOR_ICON: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  '🏋️': 'fitness-center',
  '🎬': 'movie',
  '🏠': 'home',
  '🌐': 'wifi',
  '☁️': 'cloud-queue',
  '🚗': 'directions-car',
  '📱': 'phone-iphone',
  '⚡': 'bolt',
  '💧': 'water-drop',
  '🛡️': 'security',
  '🎧': 'headphones',
  '💳': 'credit-card',
};

export function getSafeSubVectorIcon(iconStr: string): keyof typeof MaterialIcons.glyphMap {
  if (!iconStr) return 'credit-card';
  if (EMOJI_TO_VECTOR_ICON[iconStr]) return EMOJI_TO_VECTOR_ICON[iconStr];
  return (iconStr as any) || 'credit-card';
}

function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

interface AddSubscriptionModalProps {
  visible: boolean;
  subscriptionToEdit?: Subscription | null;
  onClose: () => void;
}

export function AddSubscriptionModal({
  visible,
  subscriptionToEdit,
  onClose,
}: AddSubscriptionModalProps) {
  const insets = useSafeAreaInsets();
  const addSubscription = useSubscriptionStore((s) => s.addSubscription);
  const updateSubscription = useSubscriptionStore((s) => s.updateSubscription);
  const deleteSubscription = useSubscriptionStore((s) => s.deleteSubscription);
  const monthlyBudget = useExpenseStore((s) => s.monthlyBudget) || 50000;

  const isEditMode = !!subscriptionToEdit;

  const [name, setName] = useState('');
  const [icon, setIcon] = useState<keyof typeof MaterialIcons.glyphMap>('fitness-center');
  const [amount, setAmount] = useState('3500');
  const [dueDay, setDueDay] = useState('5');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('MONTHLY');
  const [category, setCategory] = useState<SubscriptionCategory>('FITNESS');
  const [autoLog, setAutoLog] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (visible) {
      if (subscriptionToEdit) {
        setName(subscriptionToEdit.name);
        setIcon(getSafeSubVectorIcon(subscriptionToEdit.icon));
        setAmount(String(subscriptionToEdit.amount));
        setDueDay(String(subscriptionToEdit.dueDay));
        setBillingCycle(subscriptionToEdit.billingCycle || 'MONTHLY');
        setCategory(subscriptionToEdit.category);
        setAutoLog(subscriptionToEdit.autoLog ?? true);
        setNotes(subscriptionToEdit.notes || '');
      } else {
        setName('');
        setIcon('fitness-center');
        setAmount('3500');
        setDueDay('5');
        setBillingCycle('MONTHLY');
        setCategory('FITNESS');
        setAutoLog(true);
        setNotes('');
      }
    }
  }, [visible, subscriptionToEdit]);

  const parsedAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10) || 0;
  const parsedDueDay = Math.min(31, Math.max(1, parseInt(dueDay.replace(/[^0-9]/g, ''), 10) || 1));

  // Current selected category config
  const currentCat = useMemo(
    () => CATEGORIES.find((c) => c.id === category) || CATEGORIES[0],
    [category]
  );

  // Normalized monthly calculation & Safe-to-spend impact
  const normalizedMonthly = useMemo(() => {
    if (billingCycle === 'YEARLY') return Math.round(parsedAmount / 12);
    if (billingCycle === 'WEEKLY') return Math.round(parsedAmount * 4.33);
    return parsedAmount;
  }, [parsedAmount, billingCycle]);

  const dailyBurnImpact = useMemo(
    () => Math.round(normalizedMonthly / 30),
    [normalizedMonthly]
  );

  const budgetPct = useMemo(() => {
    if (monthlyBudget <= 0) return '0.0';
    return ((normalizedMonthly / monthlyBudget) * 100).toFixed(1);
  }, [normalizedMonthly, monthlyBudget]);

  const handleSelectPreset = (preset: SubscriptionPreset) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setName(preset.name);
    setCategory(preset.category);
    setIcon(preset.icon);
    setAmount(String(preset.amount));
    setDueDay(String(preset.dueDay));
    setBillingCycle(preset.billingCycle);
  };

  const handleSelectCategory = (cat: typeof CATEGORIES[number]) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setCategory(cat.id);
    setIcon(cat.defaultIcon);
  };

  const handleSubmit = async () => {
    if (!name.trim() || parsedAmount <= 0) return;

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    if (isEditMode && subscriptionToEdit) {
      await updateSubscription(subscriptionToEdit.id, {
        name: name.trim(),
        icon,
        amount: parsedAmount,
        dueDay: parsedDueDay,
        category,
        billingCycle,
        autoLog,
        color: currentCat.color,
        notes: notes.trim() || undefined,
      });
    } else {
      await addSubscription({
        name: name.trim(),
        icon,
        amount: parsedAmount,
        dueDay: parsedDueDay,
        category,
        billingCycle,
        autoLog,
        color: currentCat.color,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (!subscriptionToEdit) return;
    Alert.alert(
      'Delete Subscription',
      `Are you sure you want to remove "${subscriptionToEdit.name}" from recurring radar?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteSubscription(subscriptionToEdit.id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.avoidingContainer}>
          <View
            style={[
              styles.sheetContainer,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}>
            {/* DRAG HANDLE BAR */}
            <View style={styles.dragHandleBox}>
              <View style={styles.dragHandle} />
            </View>

            {/* HEADER */}
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetTitle}>
                  {isEditMode ? 'Edit Recurring Bill' : 'New Recurring Commitment'}
                </Text>
                <Text style={styles.sheetSubtitle}>
                  Track fixed monthly subscriptions, rent, and dues
                </Text>
              </View>

              <View style={styles.headerActions}>
                {isEditMode && (
                  <TouchableOpacity onPress={handleDelete} style={styles.actionBtn}>
                    <MaterialIcons name="delete-outline" size={18} color="#FA5252" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={onClose} style={styles.actionBtn}>
                  <MaterialIcons name="close" size={18} color={C.onSurface} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
              contentContainerStyle={styles.scrollContent}>
              {/* ⚡ 1-TAP QUICK PRESETS TRAY (FOR FAST ENTRY) */}
              {!isEditMode && (
                <View style={styles.presetSection}>
                  <Text style={styles.sectionTitle}>⚡ QUICK PRESETS</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.presetList}>
                    {SUBSCRIPTION_PRESETS.map((preset) => {
                      const isSelected = name === preset.name;
                      return (
                        <TouchableOpacity
                          key={preset.id}
                          activeOpacity={0.8}
                          onPress={() => handleSelectPreset(preset)}
                          style={[
                            styles.presetChip,
                            isSelected && {
                              backgroundColor: `${preset.color}25`,
                              borderColor: preset.color,
                            },
                          ]}>
                          <MaterialIcons
                            name={preset.icon}
                            size={14}
                            color={isSelected ? preset.color : C.onSurfaceVariant}
                          />
                          <Text
                            style={[
                              styles.presetChipText,
                              isSelected && { color: preset.color, fontFamily: F.sansBold },
                            ]}>
                            {preset.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* BILLING CYCLE SELECTOR */}
              <View style={styles.cycleSection}>
                <Text style={styles.sectionTitle}>BILLING FREQUENCY</Text>
                <View style={styles.cycleToggleRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      setBillingCycle('MONTHLY');
                    }}
                    style={[
                      styles.cycleBtn,
                      billingCycle === 'MONTHLY' && styles.cycleBtnActive,
                    ]}>
                    <MaterialIcons
                      name="calendar-month"
                      size={15}
                      color={billingCycle === 'MONTHLY' ? '#101416' : C.onSurfaceVariant}
                    />
                    <Text
                      style={[
                        styles.cycleBtnText,
                        billingCycle === 'MONTHLY' && styles.cycleBtnTextActive,
                      ]}>
                      Monthly (৳/mo)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      setBillingCycle('YEARLY');
                    }}
                    style={[
                      styles.cycleBtn,
                      billingCycle === 'YEARLY' && styles.cycleBtnActive,
                    ]}>
                    <MaterialIcons
                      name="event-repeat"
                      size={15}
                      color={billingCycle === 'YEARLY' ? '#101416' : C.onSurfaceVariant}
                    />
                    <Text
                      style={[
                        styles.cycleBtnText,
                        billingCycle === 'YEARLY' && styles.cycleBtnTextActive,
                      ]}>
                      Yearly (৳/yr)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* NAME & ICON PREVIEW */}
              <View style={styles.fieldSection}>
                <Text style={styles.sectionTitle}>SUBSCRIPTION NAME & ICON</Text>
                <View style={styles.nameRow}>
                  <View
                    style={[
                      styles.iconDisplay,
                      {
                        backgroundColor: `${currentCat.color}20`,
                        borderColor: currentCat.color,
                      },
                    ]}>
                    <MaterialIcons
                      name={getSafeSubVectorIcon(icon)}
                      size={22}
                      color={currentCat.color}
                    />
                  </View>
                  <TextInput
                    style={styles.nameInput}
                    placeholder="e.g. Gym Membership, Netflix"
                    placeholderTextColor={C.onSurfaceVariant}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

              {/* AMOUNT & DUE DAY (2-COLUMN COMPACT GRID) */}
              <View style={styles.numbersRow}>
                <View style={[styles.inputCol, { flex: 1.3 }]}>
                  <Text style={styles.sectionTitle}>
                    {billingCycle === 'YEARLY' ? 'ANNUAL AMOUNT' : 'MONTHLY AMOUNT'}
                  </Text>
                  <View style={styles.inputWrap}>
                    <Text style={styles.currencyPrefix}>৳</Text>
                    <TextInput
                      style={styles.numberInput}
                      keyboardType="numeric"
                      value={amount}
                      onChangeText={setAmount}
                    />
                    <Text style={styles.suffix}>
                      {billingCycle === 'YEARLY' ? '/yr' : '/mo'}
                    </Text>
                  </View>
                </View>

                <View style={[styles.inputCol, { flex: 1.1 }]}>
                  <Text style={styles.sectionTitle}>DUE DAY (1-31)</Text>
                  <View style={styles.inputWrap}>
                    <TextInput
                      style={styles.numberInput}
                      keyboardType="numeric"
                      maxLength={2}
                      value={dueDay}
                      onChangeText={setDueDay}
                    />
                    <View style={styles.ordinalPill}>
                      <Text style={styles.ordinalPillText}>
                        {getOrdinalSuffix(parsedDueDay)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* CATEGORY SELECTOR (UNIFIED WITH ICONS) */}
              <View style={styles.fieldSection}>
                <Text style={styles.sectionTitle}>CATEGORY</Text>
                <View style={styles.categoryGrid}>
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        activeOpacity={0.8}
                        onPress={() => handleSelectCategory(cat)}
                        style={[
                          styles.categoryChip,
                          isSelected && {
                            backgroundColor: `${cat.color}25`,
                            borderColor: cat.color,
                          },
                        ]}>
                        <MaterialIcons
                          name={cat.defaultIcon}
                          size={14}
                          color={isSelected ? cat.color : C.onSurfaceVariant}
                        />
                        <Text
                          style={[
                            styles.catLabel,
                            isSelected && { color: cat.color, fontFamily: F.sansBold },
                          ]}>
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 📊 LIVE FINANCIAL IMPACT MICRO-PILL */}
              {parsedAmount > 0 && (
                <View style={styles.impactCard}>
                  <View style={styles.impactIconBox}>
                    <MaterialIcons name="bolt" size={16} color="#C8F135" />
                  </View>
                  <View style={styles.impactTextBox}>
                    <Text style={styles.impactMainText}>
                      -৳ {dailyBurnImpact.toLocaleString('en-US')} / day Safe-to-Spend
                    </Text>
                    <Text style={styles.impactSubText}>
                      Consumes {budgetPct}% of your monthly envelope
                      {billingCycle === 'YEARLY'
                        ? ` (≈ ৳${normalizedMonthly.toLocaleString('en-US')}/mo)`
                        : ''}
                    </Text>
                  </View>
                </View>
              )}

              {/* AUTO-LOG SWITCH CHECKBOX */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setAutoLog(!autoLog);
                }}
                style={styles.autoLogRow}>
                <View style={[styles.checkbox, autoLog && styles.checkboxActive]}>
                  {autoLog && <MaterialIcons name="check" size={14} color="#101416" />}
                </View>
                <Text style={styles.autoLogLabel}>
                  Auto-account in monthly fixed commitments
                </Text>
              </TouchableOpacity>

              {/* OPTIONAL NOTES */}
              <View style={styles.fieldSection}>
                <Text style={styles.sectionTitle}>NOTES (OPTIONAL)</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Plan details, account login info, or cancellation reminders"
                  placeholderTextColor={C.onSurfaceVariant}
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>
            </ScrollView>

            {/* STICKY PINNED FOOTER */}
            <View style={styles.footer}>
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={!name.trim() || parsedAmount <= 0}
                onPress={handleSubmit}
                style={[
                  styles.saveBtn,
                  (!name.trim() || parsedAmount <= 0) && styles.saveBtnDisabled,
                ]}>
                <MaterialIcons name="check" size={18} color="#101416" />
                <Text style={styles.saveBtnText}>
                  {isEditMode
                    ? 'Save Bill Changes'
                    : `Save Commitment (৳${normalizedMonthly.toLocaleString('en-US')}/mo)`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  avoidingContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#161A1D',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '92%',
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dragHandleBox: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  sheetTitle: {
    fontFamily: F.sansBold,
    fontSize: 17,
    color: C.onSurface,
  },
  sheetSubtitle: {
    fontFamily: F.sans,
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  sectionTitle: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  fieldSection: {
    gap: 2,
  },
  presetSection: {
    gap: 4,
  },
  presetList: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  presetChipText: {
    fontFamily: F.sansMedium,
    fontSize: 12,
    color: C.onSurface,
  },
  cycleSection: {
    gap: 4,
  },
  cycleToggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 4,
  },
  cycleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 9,
  },
  cycleBtnActive: {
    backgroundColor: '#C8F135',
  },
  cycleBtnText: {
    fontFamily: F.sansSemiBold,
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  cycleBtnTextActive: {
    color: '#101416',
    fontWeight: '700',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconDisplay: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  nameInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: F.sansMedium,
    fontSize: 15,
    color: C.onSurface,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  numbersRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputCol: {
    gap: 2,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 6,
  },
  currencyPrefix: {
    fontFamily: F.sansBold,
    fontSize: 16,
    color: '#C8F135',
  },
  numberInput: {
    flex: 1,
    fontFamily: F.sansBold,
    fontSize: 16,
    color: C.onSurface,
  },
  suffix: {
    fontFamily: F.sansBold,
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  ordinalPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ordinalPillText: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: C.onSurface,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  catLabel: {
    fontFamily: F.sansMedium,
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  impactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(200, 241, 53, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(200, 241, 53, 0.25)',
    gap: 10,
  },
  impactIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(200, 241, 53, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  impactTextBox: {
    flex: 1,
    gap: 1,
  },
  impactMainText: {
    fontFamily: F.sansBold,
    fontSize: 12,
    color: '#C8F135',
  },
  impactSubText: {
    fontFamily: F.sans,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  autoLogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#C8F135',
    borderColor: '#C8F135',
  },
  autoLogLabel: {
    fontFamily: F.sansMedium,
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  notesInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: F.sans,
    fontSize: 13,
    color: C.onSurface,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C8F135',
    borderRadius: 18,
    paddingVertical: 14,
    gap: 8,
    shadowColor: '#C8F135',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    fontFamily: F.sansBold,
    fontSize: 15,
    color: '#101416',
  },
});
