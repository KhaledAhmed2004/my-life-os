import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  SERVICE_CHARGE_PRESETS,
  TITLE_SUGGESTIONS,
  VAT_PRESETS,
} from '@/components/split-bill/split-bill-constants';
import { SplitMemberShareCard } from '@/components/split-bill/split-member-share-card';
import { useDebtStore } from '@/stores/debt-store';
import {
  computeSessionShares,
  useSplitBillStore,
} from '@/stores/split-bill-store';
import { Vital } from '@/constants/vital-theme';
import {
  BillItem,
  SplitMember,
  SplitMode,
  SplitSession,
} from '@/types/split-bill';

const C = Vital.colors;
const F = Vital.fonts;

interface SplitBillCalculatorCardProps {
  onSessionSaved?: (session: SplitSession) => void;
  onOpenShareModal: (session: SplitSession, member: SplitMember) => void;
}

export function SplitBillCalculatorCard({
  onSessionSaved,
  onOpenShareModal,
}: SplitBillCalculatorCardProps) {
  const saveSession = useSplitBillStore((s) => s.saveSession);
  const syncMembersToUdhaar = useSplitBillStore((s) => s.syncMembersToUdhaar);
  const existingDebts = useDebtStore((s) => s.debts);

  // Form State
  const [title, setTitle] = useState('Dhanmondi Dinner Hangout');
  const [venue, setVenue] = useState('');
  const [mode, setMode] = useState<SplitMode>('EQUAL');

  // Amounts
  const [subtotalStr, setSubtotalStr] = useState('4200');
  const [vatPercent, setVatPercent] = useState(7.5);
  const [serviceChargePercent, setServiceChargePercent] = useState(5);
  const [discountStr, setDiscountStr] = useState('0');
  const [tipStr, setTipStr] = useState('0');

  // Members
  const [members, setMembers] = useState<SplitMember[]>([
    {
      id: 'mem-1',
      name: 'Me (Payer)',
      phone: '',
      isPayer: true,
      subtotalShare: 0,
      vatShare: 0,
      serviceChargeShare: 0,
      discountShare: 0,
      tipShare: 0,
      totalShare: 0,
      isSettled: true,
    },
    {
      id: 'mem-2',
      name: 'Tanvir',
      phone: '',
      isPayer: false,
      subtotalShare: 0,
      vatShare: 0,
      serviceChargeShare: 0,
      discountShare: 0,
      tipShare: 0,
      totalShare: 0,
      isSettled: false,
    },
    {
      id: 'mem-3',
      name: 'Sakib',
      phone: '',
      isPayer: false,
      subtotalShare: 0,
      vatShare: 0,
      serviceChargeShare: 0,
      discountShare: 0,
      tipShare: 0,
      totalShare: 0,
      isSettled: false,
    },
  ]);

  // New member quick input
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');

  // Itemized items list
  const [items, setItems] = useState<BillItem[]>([
    {
      id: 'item-1',
      name: 'Ribeye Steak',
      price: 1800,
      assignedMemberIds: ['mem-1'],
    },
    {
      id: 'item-2',
      name: 'Smash Burger (x2)',
      price: 1200,
      assignedMemberIds: ['mem-2', 'mem-3'],
    },
    {
      id: 'item-3',
      name: 'Drinks & Fries',
      price: 1200,
      assignedMemberIds: ['mem-1', 'mem-2', 'mem-3'],
    },
  ]);

  const [newItemName, setNewItemName] = useState('');
  const [newItemPriceStr, setNewItemPriceStr] = useState('');

  // Known contacts from debts
  const knownContacts = useMemo(() => {
    const names = new Set<string>();
    const list: { name: string; phone?: string }[] = [];
    existingDebts.forEach((d) => {
      if (!names.has(d.personName) && !members.some((m) => m.name === d.personName)) {
        names.add(d.personName);
        list.push({ name: d.personName, phone: d.phone });
      }
    });
    return list.slice(0, 5);
  }, [existingDebts, members]);

  // Subtotal calculation
  const rawSubtotal = useMemo(() => {
    if (mode === 'ITEMIZED') {
      return items.reduce((sum, item) => sum + item.price, 0);
    }
    return parseFloat(subtotalStr) || 0;
  }, [mode, items, subtotalStr]);

  // Live Shares computation
  const {
    members: computedMembers,
    totalBill,
    totalVat,
    totalServiceCharge,
  } = useMemo(() => {
    const discount = parseFloat(discountStr) || 0;
    const tip = parseFloat(tipStr) || 0;
    return computeSessionShares(
      rawSubtotal,
      vatPercent,
      serviceChargePercent,
      discount,
      tip,
      mode,
      items,
      members
    );
  }, [rawSubtotal, vatPercent, serviceChargePercent, discountStr, tipStr, mode, items, members]);

  const handleAddMember = (name: string, phone?: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const newId = `mem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setMembers((prev) => [
      ...prev,
      {
        id: newId,
        name: trimmed,
        phone: phone || '',
        isPayer: false,
        subtotalShare: 0,
        vatShare: 0,
        serviceChargeShare: 0,
        discountShare: 0,
        tipShare: 0,
        totalShare: 0,
        isSettled: false,
      },
    ]);
    setNewMemberName('');
    setNewMemberPhone('');
  };

  const handleRemoveMember = (id: string) => {
    if (members.length <= 1) return;
    setMembers((prev) => prev.filter((m) => m.id !== id));
    // Also remove from items
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        assignedMemberIds: it.assignedMemberIds.filter((mId) => mId !== id),
      }))
    );
  };

  const handleSetPayer = (id: string) => {
    void Haptics.selectionAsync().catch(() => {});
    setMembers((prev) =>
      prev.map((m) => ({
        ...m,
        isPayer: m.id === id,
        isSettled: m.id === id, // Payer is always settled
      }))
    );
  };

  const handleAddItem = () => {
    const price = parseFloat(newItemPriceStr);
    if (!newItemName.trim() || isNaN(price) || price <= 0) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const newItem: BillItem = {
      id: `item-${Date.now()}`,
      name: newItemName.trim(),
      price,
      assignedMemberIds: members.map((m) => m.id), // default: split among all
    };
    setItems((prev) => [...prev, newItem]);
    setNewItemName('');
    setNewItemPriceStr('');
  };

  const handleToggleItemMember = (itemId: string, memberId: string) => {
    void Haptics.selectionAsync().catch(() => {});
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        const exists = it.assignedMemberIds.includes(memberId);
        const updated = exists
          ? it.assignedMemberIds.filter((id) => id !== memberId)
          : [...it.assignedMemberIds, memberId];
        return { ...it, assignedMemberIds: updated };
      })
    );
  };

  const handleSave = async (autoSyncUdhaar = false) => {
    if (totalBill <= 0) {
      Alert.alert('Invalid Bill', 'Please enter a valid bill amount.');
      return;
    }

    const sessionPayload = {
      title: title.trim() || 'Restaurant Bill',
      venue: venue.trim() || undefined,
      date: Date.now(),
      mode,
      subtotal: rawSubtotal,
      vatPercent,
      serviceChargePercent,
      discountAmount: parseFloat(discountStr) || 0,
      tipAmount: parseFloat(tipStr) || 0,
      totalBill,
      items: mode === 'ITEMIZED' ? items : [],
      members: computedMembers,
    };

    const saved = await saveSession(sessionPayload);

    if (autoSyncUdhaar) {
      const synced = await syncMembersToUdhaar(saved.id);
      Alert.alert(
        'Synced to Udhaar! 🤝',
        `${synced} unpaid friend shares recorded as I_LENT receivables in your Debt Tracker.`
      );
    } else {
      Alert.alert('Bill Saved! 📋', 'Bill split session saved to your history ledger.');
    }

    if (onSessionSaved) onSessionSaved(saved);
  };

  return (
    <View style={styles.container}>
      {/* 1. TITLE & VENUE */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>BILL TITLE & VENUE</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Dhanmondi Dinner Hangout"
          placeholderTextColor={C.onSurfaceVariant}
          value={title}
          onChangeText={setTitle}
        />

        {/* Suggestion Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionScroll}>
          {TITLE_SUGGESTIONS.map((sug) => (
            <TouchableOpacity
              key={sug}
              onPress={() => setTitle(sug)}
              style={styles.sugPill}>
              <Text style={styles.sugText}>{sug}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TextInput
          style={[styles.textInput, { marginTop: 6 }]}
          placeholder="Restaurant / Cafe (Optional) e.g. Woodhouse Grill"
          placeholderTextColor={C.onSurfaceVariant}
          value={venue}
          onChangeText={setVenue}
        />
      </View>

      {/* 2. SPLIT MODE SWITCHER */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>SPLIT METHOD</Text>
        <View style={styles.modeTabsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              void Haptics.selectionAsync().catch(() => {});
              setMode('EQUAL');
            }}
            style={[styles.modeTab, mode === 'EQUAL' && styles.modeTabActive]}>
            <MaterialIcons
              name="people"
              size={16}
              color={mode === 'EQUAL' ? '#101416' : C.onSurfaceVariant}
            />
            <Text
              style={[
                styles.modeTabText,
                mode === 'EQUAL' && styles.modeTabTextActive,
              ]}>
              Equal Split (সমান ভাগ)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              void Haptics.selectionAsync().catch(() => {});
              setMode('ITEMIZED');
            }}
            style={[styles.modeTab, mode === 'ITEMIZED' && styles.modeTabActive]}>
            <MaterialIcons
              name="restaurant-menu"
              size={16}
              color={mode === 'ITEMIZED' ? '#101416' : C.onSurfaceVariant}
            />
            <Text
              style={[
                styles.modeTabText,
                mode === 'ITEMIZED' && styles.modeTabTextActive,
              ]}>
              Dish / Itemized (আলাদা খাবার)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. AMOUNTS / ITEMS */}
      {mode === 'EQUAL' ? (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>FOOD SUBTOTAL (৳)</Text>
          <TextInput
            style={[styles.textInput, styles.bigAmountInput]}
            keyboardType="numeric"
            placeholder="4200"
            placeholderTextColor={C.onSurfaceVariant}
            value={subtotalStr}
            onChangeText={setSubtotalStr}
          />
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ORDERED DISHES & ITEMS</Text>
          <View style={styles.itemsList}>
            {items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemMain}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>৳{item.price.toLocaleString()}</Text>
                </View>

                {/* Member Assign Pills */}
                <View style={styles.assignPillsRow}>
                  {members.map((m) => {
                    const isAssigned = item.assignedMemberIds.includes(m.id);
                    return (
                      <TouchableOpacity
                        key={m.id}
                        onPress={() => handleToggleItemMember(item.id, m.id)}
                        style={[
                          styles.assignPill,
                          isAssigned && styles.assignPillActive,
                        ]}>
                        <Text
                          style={[
                            styles.assignPillText,
                            isAssigned && styles.assignPillTextActive,
                          ]}>
                          {m.name.split(' ')[0]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>

          {/* Add Item Row */}
          <View style={styles.addItemRow}>
            <TextInput
              style={[styles.textInput, { flex: 2 }]}
              placeholder="Dish Name (e.g. Pasta)"
              placeholderTextColor={C.onSurfaceVariant}
              value={newItemName}
              onChangeText={setNewItemName}
            />
            <TextInput
              style={[styles.textInput, { flex: 1 }]}
              keyboardType="numeric"
              placeholder="Price ৳"
              placeholderTextColor={C.onSurfaceVariant}
              value={newItemPriceStr}
              onChangeText={setNewItemPriceStr}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleAddItem}
              style={styles.addItemBtn}>
              <MaterialIcons name="add" size={20} color="#101416" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 4. VAT & SERVICE CHARGE */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>VAT & SERVICE CHARGE PRESETS</Text>

        <View style={styles.ratesRow}>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={styles.rateSubLabel}>VAT (%)</Text>
            <View style={styles.presetChips}>
              {VAT_PRESETS.map((p) => (
                <TouchableOpacity
                  key={p.label}
                  onPress={() => setVatPercent(p.value)}
                  style={[
                    styles.presetChip,
                    vatPercent === p.value && styles.presetChipActive,
                  ]}>
                  <Text
                    style={[
                      styles.presetChipText,
                      vatPercent === p.value && styles.presetChipTextActive,
                    ]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ flex: 1, gap: 6 }}>
            <Text style={styles.rateSubLabel}>Service Charge (%)</Text>
            <View style={styles.presetChips}>
              {SERVICE_CHARGE_PRESETS.map((p) => (
                <TouchableOpacity
                  key={p.label}
                  onPress={() => setServiceChargePercent(p.value)}
                  style={[
                    styles.presetChip,
                    serviceChargePercent === p.value && styles.presetChipActive,
                  ]}>
                  <Text
                    style={[
                      styles.presetChipText,
                      serviceChargePercent === p.value && styles.presetChipTextActive,
                    ]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* 5. GROUP MEMBERS */}
      <View style={styles.section}>
        <View style={styles.membersHeaderRow}>
          <Text style={styles.sectionHeader}>
            PARTICIPANTS ({members.length})
          </Text>
          <Text style={styles.payerNote}>Tap star to pick who paid bill</Text>
        </View>

        <View style={styles.membersGrid}>
          {members.map((m) => (
            <View key={m.id} style={styles.memberTile}>
              <TouchableOpacity
                onPress={() => handleSetPayer(m.id)}
                style={styles.payerStarBtn}>
                <MaterialIcons
                  name={m.isPayer ? 'star' : 'star-outline'}
                  size={18}
                  color={m.isPayer ? '#FCC419' : C.onSurfaceVariant}
                />
              </TouchableOpacity>

              <View style={{ flex: 1 }}>
                <Text style={styles.memberTileName} numberOfLines={1}>
                  {m.name}
                </Text>
                <Text style={styles.memberTileRole}>
                  {m.isPayer ? 'Paid the Bill' : 'Split Share'}
                </Text>
              </View>

              {members.length > 1 && (
                <TouchableOpacity
                  onPress={() => handleRemoveMember(m.id)}
                  style={styles.removeMemberBtn}>
                  <MaterialIcons name="close" size={14} color={C.onSurfaceVariant} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Quick add known contacts */}
        {knownContacts.length > 0 && (
          <View style={styles.knownContactsSection}>
            <Text style={styles.knownContactsTitle}>QUICK ADD FROM DEBTS:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.knownScroll}>
              {knownContacts.map((c) => (
                <TouchableOpacity
                  key={c.name}
                  onPress={() => handleAddMember(c.name, c.phone)}
                  style={styles.knownPill}>
                  <MaterialIcons name="add" size={12} color="#20C997" />
                  <Text style={styles.knownPillText}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Add custom friend row */}
        <View style={styles.addMemberRow}>
          <TextInput
            style={[styles.textInput, { flex: 1 }]}
            placeholder="Friend's Name"
            placeholderTextColor={C.onSurfaceVariant}
            value={newMemberName}
            onChangeText={setNewMemberName}
          />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleAddMember(newMemberName, newMemberPhone)}
            style={styles.addMemberBtn}>
            <MaterialIcons name="person-add" size={16} color="#101416" />
            <Text style={styles.addMemberBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 6. TOTAL BILL HERO SUMMARY */}
      <View style={styles.totalHeroBox}>
        <View style={styles.totalHeroTop}>
          <View>
            <Text style={styles.totalHeroLabel}>TOTAL FINAL BILL</Text>
            <Text style={styles.totalHeroAmount}>৳{totalBill.toLocaleString()}</Text>
          </View>
          <View style={styles.totalHeroBreakdown}>
            <Text style={styles.heroBreakdownText}>Subtotal: ৳{rawSubtotal.toLocaleString()}</Text>
            <Text style={styles.heroBreakdownText}>
              VAT ({vatPercent}%): +৳{totalVat.toLocaleString()}
            </Text>
            <Text style={styles.heroBreakdownText}>
              Service ({serviceChargePercent}%): +৳{totalServiceCharge.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* 7. MEMBER SHARES BREAKDOWN */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>INDIVIDUAL PAYABLE SHARES</Text>
        <View style={styles.sharesList}>
          {computedMembers.map((m) => (
            <SplitMemberShareCard
              key={m.id}
              member={m}
              onToggleSettled={() => {
                setMembers((prev) =>
                  prev.map((item) =>
                    item.id === m.id ? { ...item, isSettled: !item.isSettled } : item
                  )
                );
              }}
              onShare={() => {
                const sessionPreview: SplitSession = {
                  id: 'preview',
                  title: title.trim() || 'Restaurant Bill',
                  venue: venue.trim() || undefined,
                  date: Date.now(),
                  mode,
                  subtotal: rawSubtotal,
                  vatPercent,
                  serviceChargePercent,
                  discountAmount: 0,
                  tipAmount: 0,
                  totalBill,
                  items,
                  members: computedMembers,
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                };
                onOpenShareModal(sessionPreview, m);
              }}
            />
          ))}
        </View>
      </View>

      {/* 8. ACTIONS */}
      <View style={styles.actionButtonsCol}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleSave(true)}
          style={styles.syncUdhaarBtn}>
          <MaterialIcons name="swap-horiz" size={18} color="#101416" />
          <Text style={styles.syncUdhaarBtnText}>
            Save & 1-Tap Sync to Udhaar Ledger
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleSave(false)}
          style={styles.saveLedgerBtn}>
          <MaterialIcons name="bookmark-border" size={16} color={C.onSurface} />
          <Text style={styles.saveLedgerBtnText}>Save to Split Bill History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    fontFamily: F.bold,
    fontSize: 10,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
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
  bigAmountInput: {
    fontSize: 20,
    fontFamily: F.bold,
    color: '#20C997',
  },
  suggestionScroll: {
    gap: 6,
    paddingTop: 6,
  },
  sugPill: {
    backgroundColor: '#181F23',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  sugText: {
    fontFamily: F.medium,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  modeTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#181F23',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modeTabActive: {
    backgroundColor: '#20C997',
  },
  modeTabText: {
    fontFamily: F.medium,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  modeTabTextActive: {
    fontFamily: F.bold,
    color: '#101416',
  },
  itemsList: {
    gap: 8,
  },
  itemRow: {
    backgroundColor: '#181F23',
    borderRadius: 12,
    padding: 10,
    gap: 8,
  },
  itemMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontFamily: F.bold,
    fontSize: 13,
    color: C.onSurface,
  },
  itemPrice: {
    fontFamily: F.bold,
    fontSize: 13,
    color: '#20C997',
  },
  assignPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  assignPill: {
    backgroundColor: '#101416',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  assignPillActive: {
    backgroundColor: 'rgba(32, 201, 151, 0.2)',
  },
  assignPillText: {
    fontFamily: F.medium,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  assignPillTextActive: {
    fontFamily: F.bold,
    color: '#20C997',
  },
  addItemRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addItemBtn: {
    backgroundColor: '#20C997',
    width: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rateSubLabel: {
    fontFamily: F.medium,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  presetChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  presetChip: {
    backgroundColor: '#181F23',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  presetChipActive: {
    backgroundColor: '#38BDF8',
  },
  presetChipText: {
    fontFamily: F.bold,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  presetChipTextActive: {
    color: '#101416',
  },
  membersHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payerNote: {
    fontFamily: F.regular,
    fontSize: 10,
    color: '#FCC419',
  },
  membersGrid: {
    gap: 6,
  },
  memberTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181F23',
    borderRadius: 10,
    padding: 8,
    gap: 8,
  },
  payerStarBtn: {
    padding: 4,
  },
  memberTileName: {
    fontFamily: F.bold,
    fontSize: 12,
    color: C.onSurface,
  },
  memberTileRole: {
    fontFamily: F.regular,
    fontSize: 9,
    color: C.onSurfaceVariant,
  },
  removeMemberBtn: {
    padding: 6,
  },
  knownContactsSection: {
    gap: 6,
    marginTop: 4,
  },
  knownContactsTitle: {
    fontFamily: F.bold,
    fontSize: 9,
    color: C.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  knownScroll: {
    gap: 6,
  },
  knownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(32, 201, 151, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  knownPillText: {
    fontFamily: F.medium,
    fontSize: 10,
    color: '#20C997',
  },
  addMemberRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  addMemberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#20C997',
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 4,
  },
  addMemberBtnText: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#101416',
  },
  totalHeroBox: {
    backgroundColor: '#181F23',
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  totalHeroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalHeroLabel: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#20C997',
    letterSpacing: 0.6,
  },
  totalHeroAmount: {
    fontFamily: F.bold,
    fontSize: 26,
    color: '#FFFFFF',
    marginTop: 2,
  },
  totalHeroBreakdown: {
    alignItems: 'flex-end',
    gap: 2,
  },
  heroBreakdownText: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  sharesList: {
    gap: 8,
  },
  actionButtonsCol: {
    gap: 10,
    marginTop: 6,
    marginBottom: 20,
  },
  syncUdhaarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#51CF66',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  syncUdhaarBtnText: {
    fontFamily: F.bold,
    fontSize: 13,
    color: '#101416',
  },
  saveLedgerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181F23',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  saveLedgerBtnText: {
    fontFamily: F.bold,
    fontSize: 12,
    color: C.onSurface,
  },
});
