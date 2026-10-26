import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  BillItem,
  SplitMember,
  SplitMode,
  SplitSession,
  SplitBillStats,
} from '@/types/split-bill';
import { useDebtStore } from '@/stores/debt-store';

const SPLIT_BILLS_STORAGE_KEY = 'vital_split_bills_vault_v1';
const MY_BKASH_STORAGE_KEY = 'vital_my_bkash_number_v1';

async function setStorageItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getStorageItem(key: string) {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

// Math calculation helper
export function computeSessionShares(
  subtotal: number,
  vatPercent: number,
  serviceChargePercent: number,
  discountAmount: number,
  tipAmount: number,
  mode: SplitMode,
  items: BillItem[],
  members: SplitMember[]
): { members: SplitMember[]; totalBill: number; totalVat: number; totalServiceCharge: number } {
  const memberCount = Math.max(1, members.length);
  const totalVat = Math.round(subtotal * (vatPercent / 100));
  const totalServiceCharge = Math.round(subtotal * (serviceChargePercent / 100));
  const totalBill = Math.max(0, subtotal + totalVat + totalServiceCharge + tipAmount - discountAmount);

  if (mode === 'EQUAL' || mode === 'CUSTOM_AMOUNT') {
    const rawSubtotalShare = Math.round(subtotal / memberCount);
    const rawVatShare = Math.round(totalVat / memberCount);
    const rawServiceShare = Math.round(totalServiceCharge / memberCount);
    const rawDiscountShare = Math.round(discountAmount / memberCount);
    const rawTipShare = Math.round(tipAmount / memberCount);
    const rawTotalShare = Math.round(totalBill / memberCount);

    const updatedMembers = members.map((m) => ({
      ...m,
      subtotalShare: rawSubtotalShare,
      vatShare: rawVatShare,
      serviceChargeShare: rawServiceShare,
      discountShare: rawDiscountShare,
      tipShare: rawTipShare,
      totalShare: rawTotalShare,
    }));

    return { members: updatedMembers, totalBill, totalVat, totalServiceCharge };
  }

  // ITEMIZED SPLIT: Proportional distribution
  // 1. Calculate raw subtotal per member from assigned items
  const memberItemSubtotals: Record<string, number> = {};
  members.forEach((m) => {
    memberItemSubtotals[m.id] = 0;
  });

  items.forEach((item) => {
    const assignedCount = Math.max(1, item.assignedMemberIds.length);
    const costPerPerson = item.price / assignedCount;
    item.assignedMemberIds.forEach((mId) => {
      if (memberItemSubtotals[mId] !== undefined) {
        memberItemSubtotals[mId] += costPerPerson;
      }
    });
  });

  // 2. Compute proportional shares
  const sumItemSubtotals = Object.values(memberItemSubtotals).reduce((a, b) => a + b, 0);
  const effectiveSubtotal = sumItemSubtotals > 0 ? sumItemSubtotals : subtotal;

  const updatedMembers = members.map((m) => {
    const mSubtotal = memberItemSubtotals[m.id] || 0;
    const ratio = effectiveSubtotal > 0 ? mSubtotal / effectiveSubtotal : 1 / memberCount;

    const mVat = Math.round(totalVat * ratio);
    const mService = Math.round(totalServiceCharge * ratio);
    const mDiscount = Math.round(discountAmount * ratio);
    const mTip = Math.round(tipAmount * ratio);
    const mTotal = Math.round(mSubtotal + mVat + mService + mTip - mDiscount);

    return {
      ...m,
      subtotalShare: Math.round(mSubtotal),
      vatShare: mVat,
      serviceChargeShare: mService,
      discountShare: mDiscount,
      tipShare: mTip,
      totalShare: Math.max(0, mTotal),
    };
  });

  return { members: updatedMembers, totalBill, totalVat, totalServiceCharge };
}

// Default Seed Session
const SEED_SESSIONS: SplitSession[] = [
  {
    id: 'split-dhanmondi-01',
    title: 'Weekend Steak & Burgers Hangout',
    venue: 'Takeout / Woodhouse Grill (Dhanmondi)',
    date: Date.now() - 2 * 24 * 60 * 60 * 1000,
    mode: 'EQUAL',
    subtotal: 4200,
    vatPercent: 7.5,
    serviceChargePercent: 5,
    discountAmount: 0,
    tipAmount: 100,
    totalBill: 4825,
    items: [],
    members: [
      {
        id: 'mem-01',
        name: 'Me (Payer)',
        phone: '',
        isPayer: true,
        subtotalShare: 1050,
        vatShare: 79,
        serviceChargeShare: 52,
        discountShare: 0,
        tipShare: 25,
        totalShare: 1206,
        isSettled: true,
      },
      {
        id: 'mem-02',
        name: 'Tanvir Ahmed',
        phone: '+880 1711-234567',
        isPayer: false,
        subtotalShare: 1050,
        vatShare: 79,
        serviceChargeShare: 52,
        discountShare: 0,
        tipShare: 25,
        totalShare: 1206,
        isSettled: false,
      },
      {
        id: 'mem-03',
        name: 'Sakib Hassan',
        phone: '+880 1912-334455',
        isPayer: false,
        subtotalShare: 1050,
        vatShare: 79,
        serviceChargeShare: 52,
        discountShare: 0,
        tipShare: 25,
        totalShare: 1206,
        isSettled: false,
      },
      {
        id: 'mem-04',
        name: 'Rahim Chowdhury',
        phone: '+880 1819-987654',
        isPayer: false,
        subtotalShare: 1050,
        vatShare: 79,
        serviceChargeShare: 52,
        discountShare: 0,
        tipShare: 25,
        totalShare: 1207,
        isSettled: true,
      },
    ],
    myPaymentNumber: '+880 1700-000000',
    notes: 'Tanvir and Sakib pending bKash.',
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
  },
];

interface SplitBillState {
  sessions: SplitSession[];
  myPaymentNumber: string;
  isLoading: boolean;

  // Lifecycle
  loadData: () => Promise<void>;
  saveSession: (session: Omit<SplitSession, 'id' | 'createdAt' | 'updatedAt'>) => Promise<SplitSession>;
  updateSession: (id: string, updates: Partial<SplitSession>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  setMyPaymentNumber: (num: string) => Promise<void>;

  // Settlement & Actions
  markMemberSettled: (sessionId: string, memberId: string, isSettled: boolean) => Promise<void>;
  syncMembersToUdhaar: (sessionId: string) => Promise<number>; // returns count of synced debts
  generateWhatsAppText: (sessionId: string, memberId: string) => string;

  // Analytics
  getStats: () => SplitBillStats;
}

export const useSplitBillStore = create<SplitBillState>((set, get) => ({
  sessions: [],
  myPaymentNumber: '',
  isLoading: false,

  loadData: async () => {
    try {
      set({ isLoading: true });
      const raw = await getStorageItem(SPLIT_BILLS_STORAGE_KEY);
      const rawNumber = await getStorageItem(MY_BKASH_STORAGE_KEY);

      if (rawNumber) {
        set({ myPaymentNumber: rawNumber });
      }

      if (raw) {
        const parsed = JSON.parse(raw) as SplitSession[];
        set({ sessions: parsed, isLoading: false });
      } else {
        await setStorageItem(SPLIT_BILLS_STORAGE_KEY, JSON.stringify(SEED_SESSIONS));
        set({ sessions: SEED_SESSIONS, isLoading: false });
      }
    } catch (err) {
      console.warn('Failed to load split bills:', err);
      set({ sessions: SEED_SESSIONS, isLoading: false });
    }
  },

  setMyPaymentNumber: async (num: string) => {
    set({ myPaymentNumber: num });
    await setStorageItem(MY_BKASH_STORAGE_KEY, num);
  },

  saveSession: async (sessionData) => {
    const newSession: SplitSession = {
      ...sessionData,
      id: `split-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updated = [newSession, ...get().sessions];
    set({ sessions: updated });
    await setStorageItem(SPLIT_BILLS_STORAGE_KEY, JSON.stringify(updated));

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    return newSession;
  },

  updateSession: async (id, updates) => {
    const updated = get().sessions.map((s) => {
      if (s.id !== id) return s;
      return {
        ...s,
        ...updates,
        updatedAt: Date.now(),
      };
    });

    set({ sessions: updated });
    await setStorageItem(SPLIT_BILLS_STORAGE_KEY, JSON.stringify(updated));
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },

  deleteSession: async (id) => {
    const updated = get().sessions.filter((s) => s.id !== id);
    set({ sessions: updated });
    await setStorageItem(SPLIT_BILLS_STORAGE_KEY, JSON.stringify(updated));
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  },

  markMemberSettled: async (sessionId, memberId, isSettled) => {
    const updated = get().sessions.map((s) => {
      if (s.id !== sessionId) return s;
      return {
        ...s,
        members: s.members.map((m) => {
          if (m.id !== memberId) return m;
          return { ...m, isSettled };
        }),
        updatedAt: Date.now(),
      };
    });

    set({ sessions: updated });
    await setStorageItem(SPLIT_BILLS_STORAGE_KEY, JSON.stringify(updated));
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },

  syncMembersToUdhaar: async (sessionId) => {
    const session = get().sessions.find((s) => s.id === sessionId);
    if (!session) return 0;

    let syncedCount = 0;
    const addDebt = useDebtStore.getState().addDebt;

    const updatedMembers = await Promise.all(
      session.members.map(async (m) => {
        // Only sync unpaid non-payer members who aren't already synced
        if (!m.isPayer && !m.isSettled && !m.linkedDebtId && m.totalShare > 0) {
          try {
            const venueNote = session.venue ? ` @ ${session.venue}` : '';
            const created = await addDebt({
              personName: m.name,
              phone: m.phone,
              type: 'I_LENT',
              amount: m.totalShare,
              startDate: session.date,
              dueDate: session.date + 7 * 24 * 60 * 60 * 1000, // Due in 7 days
              notes: `Bill Split: ${session.title}${venueNote}`,
            });
            syncedCount++;
            return { ...m, linkedDebtId: created.id };
          } catch (e) {
            console.warn('Failed to sync debt for member:', m.name, e);
            return m;
          }
        }
        return m;
      })
    );

    await get().updateSession(sessionId, { members: updatedMembers });
    if (syncedCount > 0) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    return syncedCount;
  },

  generateWhatsAppText: (sessionId, memberId) => {
    const session = get().sessions.find((s) => s.id === sessionId);
    if (!session) return '';

    const member = session.members.find((m) => m.id === memberId);
    if (!member) return '';

    const dateStr = new Date(session.date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const paymentNumber = session.myPaymentNumber || get().myPaymentNumber || '017XXXXXXXX';
    const venueText = session.venue ? `\n📍 *Venue:* ${session.venue}` : '';

    return `🍽️ *Restaurant Bill Share*\n📋 *Bill:* ${session.title}${venueText}\n📅 *Date:* ${dateStr}\n💳 *Total Bill:* ৳${session.totalBill.toLocaleString()}\n\n👤 *Hey ${member.name}, your share breakdown:*\n• Food/Subtotal: ৳${member.subtotalShare.toLocaleString()}\n• VAT & Service: ৳${(member.vatShare + member.serviceChargeShare).toLocaleString()}\n👉 *Total Payable: ৳${member.totalShare.toLocaleString()}*\n\n📱 *Please bKash / Nagad (Personal) to:*\n*${paymentNumber}*\n\nThank you! 🙏`;
  },

  getStats: () => {
    const sessions = get().sessions;
    let totalBillsVolume = 0;
    let totalUnsettledReceivable = 0;
    let unsettledFriendsCount = 0;

    sessions.forEach((s) => {
      totalBillsVolume += s.totalBill;
      s.members.forEach((m) => {
        if (!m.isPayer && !m.isSettled) {
          totalUnsettledReceivable += m.totalShare;
          unsettledFriendsCount++;
        }
      });
    });

    return {
      totalSessionsCount: sessions.length,
      totalBillsVolume,
      totalUnsettledReceivable,
      unsettledFriendsCount,
    };
  },
}));
