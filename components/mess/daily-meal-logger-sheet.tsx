import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useMessStore } from '@/stores/mess-store';
import { Vital } from '@/constants/vital-theme';

const C = Vital.colors;
const F = Vital.fonts;

interface DailyMealLoggerSheetProps {
  visible: boolean;
  onClose: () => void;
}

interface MemberMealDraft {
  memberId: string;
  name: string;
  breakfast: number;
  lunch: number;
  dinner: number;
  guestMeals: number;
}

export function DailyMealLoggerSheet({
  visible,
  onClose,
}: DailyMealLoggerSheetProps) {
  const members = useMessStore((s) => s.currentSession.members);
  const logDailyMeals = useMessStore((s) => s.logDailyMeals);

  const [drafts, setDrafts] = useState<MemberMealDraft[]>(() =>
    members.map((m) => ({
      memberId: m.id,
      name: m.name,
      breakfast: 1,
      lunch: 1,
      dinner: 1,
      guestMeals: 0,
    }))
  );

  const updateDraft = (
    memberId: string,
    key: 'breakfast' | 'lunch' | 'dinner' | 'guestMeals',
    val: number
  ) => {
    void Haptics.selectionAsync().catch(() => {});
    setDrafts((prev) =>
      prev.map((d) => (d.memberId === memberId ? { ...d, [key]: val } : d))
    );
  };

  const handleSaveAll = async () => {
    const today = new Date().toISOString().split('T')[0];
    await logDailyMeals(
      today,
      drafts.map((d) => ({
        memberId: d.memberId,
        breakfast: d.breakfast,
        lunch: d.lunch,
        dinner: d.dinner,
        guestMeals: d.guestMeals,
      }))
    );
    onClose();
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
                <MaterialIcons name="fastfood" size={18} color="#38BDF8" />
              </View>
              <View>
                <Text style={styles.title}>ডেইলি মিল লগার (Daily Meals)</Text>
                <Text style={styles.subtitle}>
                  আজকের সকাল, দুপুর ও রাতের মিল এন্ট্রি
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
            {drafts.map((draft) => {
              const dayTotal =
                draft.breakfast + draft.lunch + draft.dinner + draft.guestMeals;

              return (
                <View key={draft.memberId} style={styles.memberBox}>
                  <View style={styles.memberHeader}>
                    <Text style={styles.memberName}>{draft.name}</Text>
                    <View style={styles.totalBadge}>
                      <Text style={styles.totalBadgeText}>
                        Total: {dayTotal} meals
                      </Text>
                    </View>
                  </View>

                  {/* Meal Switchers */}
                  <View style={styles.slotsRow}>
                    {/* Breakfast */}
                    <View style={styles.slotCol}>
                      <Text style={styles.slotLabel}>সকাল (B)</Text>
                      <View style={styles.optionsGroup}>
                        {[0, 0.5, 1].map((val) => (
                          <TouchableOpacity
                            key={val}
                            onPress={() =>
                              updateDraft(draft.memberId, 'breakfast', val)
                            }
                            style={[
                              styles.miniBtn,
                              draft.breakfast === val && styles.miniBtnActive,
                            ]}>
                            <Text
                              style={[
                                styles.miniBtnText,
                                draft.breakfast === val && styles.miniBtnTextActive,
                              ]}>
                              {val}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Lunch */}
                    <View style={styles.slotCol}>
                      <Text style={styles.slotLabel}>দুপুর (L)</Text>
                      <View style={styles.optionsGroup}>
                        {[0, 1, 2].map((val) => (
                          <TouchableOpacity
                            key={val}
                            onPress={() => updateDraft(draft.memberId, 'lunch', val)}
                            style={[
                              styles.miniBtn,
                              draft.lunch === val && styles.miniBtnActive,
                            ]}>
                            <Text
                              style={[
                                styles.miniBtnText,
                                draft.lunch === val && styles.miniBtnTextActive,
                              ]}>
                              {val}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Dinner */}
                    <View style={styles.slotCol}>
                      <Text style={styles.slotLabel}>রাত (D)</Text>
                      <View style={styles.optionsGroup}>
                        {[0, 1, 2].map((val) => (
                          <TouchableOpacity
                            key={val}
                            onPress={() => updateDraft(draft.memberId, 'dinner', val)}
                            style={[
                              styles.miniBtn,
                              draft.dinner === val && styles.miniBtnActive,
                            ]}>
                            <Text
                              style={[
                                styles.miniBtnText,
                                draft.dinner === val && styles.miniBtnTextActive,
                              ]}>
                              {val}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSaveAll}
              style={styles.saveAllBtn}>
              <Text style={styles.saveAllBtnText}>ডেইলি মিল সেভ করুন</Text>
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
  sheetContainer: {
    backgroundColor: '#101416',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
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
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: F.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  subtitle: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  closeBtn: {
    padding: 6,
  },
  scrollBody: {
    padding: 16,
    gap: 12,
  },
  memberBox: {
    backgroundColor: '#181F23',
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberName: {
    fontFamily: F.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  totalBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  totalBadgeText: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#38BDF8',
  },
  slotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  slotCol: {
    flex: 1,
    gap: 4,
  },
  slotLabel: {
    fontFamily: F.medium,
    fontSize: 10,
    color: C.onSurfaceVariant,
    textAlign: 'center',
  },
  optionsGroup: {
    flexDirection: 'row',
    backgroundColor: '#13191C',
    borderRadius: 8,
    padding: 2,
  },
  miniBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  miniBtnActive: {
    backgroundColor: '#38BDF8',
  },
  miniBtnText: {
    fontFamily: F.bold,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  miniBtnTextActive: {
    color: '#101416',
  },
  saveAllBtn: {
    backgroundColor: '#38BDF8',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  saveAllBtnText: {
    fontFamily: F.bold,
    fontSize: 13,
    color: '#101416',
  },
});
