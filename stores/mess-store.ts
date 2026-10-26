import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  DailyMealEntry,
  MemberMonthlySettlement,
  MessBazaarEntry,
  MessMember,
  MessMonthSession,
  MessSummaryStats,
  MessUtilityItem,
} from '@/types/mess';
import { useDebtStore } from '@/stores/debt-store';

const MESS_STORAGE_KEY = 'vital_bachelor_mess_vault_v1';

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

const INITIAL_MEMBERS: MessMember[] = [
  {
    id: 'm1',
    name: 'তানভীর আহমেদ (ম্যানেজার)',
    phone: '01711223344',
    role: 'MANAGER',
    totalMeals: 110,
    totalDeposited: 8000,
  },
  {
    id: 'm2',
    name: 'সাকিব হাসান',
    phone: '01822334455',
    role: 'MEMBER',
    totalMeals: 95,
    totalDeposited: 5000,
  },
  {
    id: 'm3',
    name: 'হাসান মাহমুদ',
    phone: '01933445566',
    role: 'MEMBER',
    totalMeals: 105,
    totalDeposited: 7500,
  },
  {
    id: 'm4',
    name: 'নাঈম চৌধুরী',
    phone: '01644556677',
    role: 'MEMBER',
    totalMeals: 80,
    totalDeposited: 4000,
  },
];

const INITIAL_BAZAAR: MessBazaarEntry[] = [
  {
    id: 'b1',
    date: '2026-09-02',
    shopperMemberId: 'm1',
    shopperName: 'তানভীর আহমেদ',
    amount: 3850,
    itemsSummary: 'মিনিকেট চাল ২৫ কেজি, সোয়াবিন তেল ৫ লিটার, মসুর ডাল ২ কেজি',
  },
  {
    id: 'b2',
    date: '2026-09-06',
    shopperMemberId: 'm2',
    shopperName: 'সাকিব হাসান',
    amount: 4200,
    itemsSummary: 'রুই মাছ ৩ কেজি, ব্রয়লার মুরগি ৪ কেজি, আলু, পেঁয়াজ ও রসুন',
  },
  {
    id: 'b3',
    date: '2026-09-12',
    shopperMemberId: 'm3',
    shopperName: 'হাসান মাহমুদ',
    amount: 3400,
    itemsSummary: 'গরুর মাংস ২ কেজি, কাঁচামরিচ, আদা, হলুদ গুঁড়া ও লবণ',
  },
  {
    id: 'b4',
    date: '2026-09-18',
    shopperMemberId: 'm1',
    shopperName: 'তানভীর আহমেদ',
    amount: 4600,
    itemsSummary: 'পোলাওয়ের চাল, ডিম ৩ ডজন, রুই মাছ, শাকসবজি ও মসলা',
  },
];

const INITIAL_UTILITIES: MessUtilityItem[] = [
  {
    id: 'u1',
    title: 'বাসা ভাড়া (Flat Rent)',
    amount: 22000,
    category: 'RENT',
    splitMode: 'EQUAL',
  },
  {
    id: 'u2',
    title: 'কাজের বুয়ার বেতন (Maid Salary)',
    amount: 3500,
    category: 'MAID',
    splitMode: 'EQUAL',
  },
  {
    id: 'u3',
    title: 'ওয়াই-ফাই ইন্টারনেট (Wi-Fi Bill)',
    amount: 1200,
    category: 'INTERNET',
    splitMode: 'EQUAL',
  },
  {
    id: 'u4',
    title: 'বিদ্যুৎ বিল (DESCO Prepaid Token)',
    amount: 2800,
    category: 'ELECTRICITY',
    splitMode: 'EQUAL',
  },
  {
    id: 'u5',
    title: 'ময়লার বিল ও গার্ড (Service Charge)',
    amount: 800,
    category: 'SERVICE_CHARGE',
    splitMode: 'EQUAL',
  },
];

const DEFAULT_SESSION: MessMonthSession = {
  id: 'mess_2026_09',
  monthTitle: 'সেপ্টেম্বর ২০২৬',
  yearMonth: '2026-09',
  isActive: true,
  members: INITIAL_MEMBERS,
  bazaarEntries: INITIAL_BAZAAR,
  utilityBills: INITIAL_UTILITIES,
  dailyMeals: [],
  notes: 'গ্রিন ভিউ ব্যাচেলর মেস, ফ্ল্যাট ৪/বি',
  updatedAt: Date.now(),
};

// Pure Calculation Functions
export function computeMessStats(session: MessMonthSession): MessSummaryStats {
  const totalBazaar = session.bazaarEntries.reduce((sum, b) => sum + b.amount, 0);
  const totalMeals = session.members.reduce((sum, m) => sum + m.totalMeals, 0);
  const mealRate = totalMeals > 0 ? Math.round((totalBazaar / totalMeals) * 100) / 100 : 0;

  const totalUtilities = session.utilityBills.reduce((sum, u) => sum + u.amount, 0);
  const totalMessExpenditure = totalBazaar + totalUtilities;
  const totalDepositsCollected = session.members.reduce((sum, m) => sum + m.totalDeposited, 0);
  const cashInHand = totalDepositsCollected - totalBazaar;

  const settlements = computeMemberSettlements(session);
  const totalDueReceivables = settlements
    .filter((s) => s.status === 'DUE')
    .reduce((sum, s) => sum + Math.abs(s.balance), 0);

  return {
    totalBazaar,
    totalMeals,
    mealRate,
    totalUtilities,
    totalMessExpenditure,
    totalDepositsCollected,
    cashInHand,
    totalDueReceivables,
  };
}

export function computeMemberSettlements(
  session: MessMonthSession
): MemberMonthlySettlement[] {
  const totalBazaar = session.bazaarEntries.reduce((sum, b) => sum + b.amount, 0);
  const totalMeals = session.members.reduce((sum, m) => sum + m.totalMeals, 0);
  const mealRate = totalMeals > 0 ? totalBazaar / totalMeals : 0;

  const activeMembersCount = Math.max(1, session.members.length);
  const equalUtilityShare = Math.round(
    session.utilityBills.reduce((sum, u) => sum + u.amount, 0) / activeMembersCount
  );

  return session.members.map((member) => {
    const mealCost = Math.round(member.totalMeals * mealRate);
    const utilityShare = member.roomRentShare || equalUtilityShare;
    const totalCost = mealCost + utilityShare;
    const balance = member.totalDeposited - totalCost;

    let status: 'REFUNDABLE' | 'DUE' | 'SETTLED' = 'SETTLED';
    if (balance > 0) status = 'REFUNDABLE';
    else if (balance < 0) status = 'DUE';

    return {
      memberId: member.id,
      memberName: member.name,
      phone: member.phone,
      role: member.role,
      totalMeals: member.totalMeals,
      mealCost,
      utilityShare,
      totalCost,
      totalDeposited: member.totalDeposited,
      balance,
      status,
    };
  });
}

export function generateMessWhatsAppReport(session: MessMonthSession): string {
  const stats = computeMessStats(session);
  const settlements = computeMemberSettlements(session);

  let text = `🏠 *${session.monthTitle} — মেস ও বাসা হিসাব*\n`;
  if (session.notes) text += `📍 ${session.notes}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `🛒 মোট বাজার খরচ: ৳${stats.totalBazaar.toLocaleString()}\n`;
  text += `🍽️ মোট মিল সংখ্যা: ${stats.totalMeals} টি\n`;
  text += `🔥 বর্তমান মিল রেট: ৳${stats.mealRate.toFixed(2)} / মিল\n`;
  text += `💡 মোট ফিক্সড ইউটিলিটি: ৳${stats.totalUtilities.toLocaleString()}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `📋 *মেম্বারদের বিস্তারিত লেজার:*\n\n`;

  settlements.forEach((s, idx) => {
    const statusText =
      s.status === 'REFUNDABLE'
        ? `✅ পাবে: ৳${s.balance.toLocaleString()}`
        : s.status === 'DUE'
        ? `⚠️ দিতে হবে: ৳${Math.abs(s.balance).toLocaleString()}`
        : `✔️ পরিশোধিত`;

    text += `${idx + 1}. *${s.memberName}*\n`;
    text += `   • মিল: ${s.totalMeals} টি (৳${s.mealCost.toLocaleString()})\n`;
    text += `   • ইউটিলিটি ও বাসা: ৳${s.utilityShare.toLocaleString()}\n`;
    text += `   • মোট খরচ: ৳${s.totalCost.toLocaleString()} | জমা: ৳${s.totalDeposited.toLocaleString()}\n`;
    text += `   👉 *${statusText}*\n\n`;
  });

  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `💰 মোট বকেয়া আদায়যোগ্য: ৳${stats.totalDueReceivables.toLocaleString()}\n`;
  text += `📱 _Generated via Track-Me Mess Studio_`;

  return text;
}

interface MessState {
  currentSession: MessMonthSession;
  sessionsHistory: MessMonthSession[];
  isLoading: boolean;

  // Lifecycle
  loadData: () => Promise<void>;
  createSession: (monthTitle: string, yearMonth: string) => Promise<void>;
  updateSessionNotes: (notes: string) => Promise<void>;

  // Members
  addMember: (name: string, phone?: string, role?: 'MANAGER' | 'MEMBER') => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  recordDeposit: (memberId: string, amount: number) => Promise<void>;
  updateMemberMeals: (memberId: string, totalMeals: number) => Promise<void>;

  // Bazaar
  addBazaarEntry: (entry: Omit<MessBazaarEntry, 'id'>) => Promise<void>;
  deleteBazaarEntry: (entryId: string) => Promise<void>;

  // Utilities
  addUtilityBill: (item: Omit<MessUtilityItem, 'id'>) => Promise<void>;
  deleteUtilityBill: (billId: string) => Promise<void>;

  // Daily Meal Logger
  logDailyMeals: (date: string, meals: { memberId: string; breakfast: number; lunch: number; dinner: number; guestMeals: number }[]) => Promise<void>;

  // Udhaar Sync
  syncDueBalancesToUdhaar: () => Promise<number>;

  // Getters
  getStats: () => MessSummaryStats;
  getSettlements: () => MemberMonthlySettlement[];
}

export const useMessStore = create<MessState>((set, get) => ({
  currentSession: DEFAULT_SESSION,
  sessionsHistory: [],
  isLoading: false,

  loadData: async () => {
    try {
      set({ isLoading: true });
      const raw = await getStorageItem(MESS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        set({
          currentSession: parsed.currentSession || DEFAULT_SESSION,
          sessionsHistory: parsed.sessionsHistory || [],
          isLoading: false,
        });
      } else {
        await setStorageItem(
          MESS_STORAGE_KEY,
          JSON.stringify({
            currentSession: DEFAULT_SESSION,
            sessionsHistory: [],
          })
        );
        set({ currentSession: DEFAULT_SESSION, sessionsHistory: [], isLoading: false });
      }
    } catch (err) {
      console.warn('Failed to load mess vault:', err);
      set({ currentSession: DEFAULT_SESSION, sessionsHistory: [], isLoading: false });
    }
  },

  createSession: async (monthTitle, yearMonth) => {
    const current = get().currentSession;
    const history = [current, ...get().sessionsHistory];

    const newMembers = current.members.map((m) => ({
      ...m,
      totalMeals: 0,
      totalDeposited: 0,
    }));

    const newSession: MessMonthSession = {
      id: `mess_${yearMonth}_${Date.now()}`,
      monthTitle,
      yearMonth,
      isActive: true,
      members: newMembers,
      bazaarEntries: [],
      utilityBills: [...current.utilityBills],
      dailyMeals: [],
      notes: current.notes,
      updatedAt: Date.now(),
    };

    set({ currentSession: newSession, sessionsHistory: history });
    await setStorageItem(
      MESS_STORAGE_KEY,
      JSON.stringify({ currentSession: newSession, sessionsHistory: history })
    );
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },

  updateSessionNotes: async (notes) => {
    const updated = {
      ...get().currentSession,
      notes,
      updatedAt: Date.now(),
    };
    set({ currentSession: updated });
    await setStorageItem(
      MESS_STORAGE_KEY,
      JSON.stringify({ currentSession: updated, sessionsHistory: get().sessionsHistory })
    );
  },

  addMember: async (name, phone, role = 'MEMBER') => {
    const current = get().currentSession;
    const newMember: MessMember = {
      id: `m_${Date.now()}`,
      name,
      phone,
      role,
      totalMeals: 0,
      totalDeposited: 0,
    };

    const updated = {
      ...current,
      members: [...current.members, newMember],
      updatedAt: Date.now(),
    };

    set({ currentSession: updated });
    await setStorageItem(
      MESS_STORAGE_KEY,
      JSON.stringify({ currentSession: updated, sessionsHistory: get().sessionsHistory })
    );
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },

  removeMember: async (memberId) => {
    const current = get().currentSession;
    const updated = {
      ...current,
      members: current.members.filter((m) => m.id !== memberId),
      updatedAt: Date.now(),
    };
    set({ currentSession: updated });
    await setStorageItem(
      MESS_STORAGE_KEY,
      JSON.stringify({ currentSession: updated, sessionsHistory: get().sessionsHistory })
    );
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },

  recordDeposit: async (memberId, amount) => {
    const current = get().currentSession;
    const updatedMembers = current.members.map((m) =>
      m.id === memberId ? { ...m, totalDeposited: m.totalDeposited + amount } : m
    );

    const updated = {
      ...current,
      members: updatedMembers,
      updatedAt: Date.now(),
    };

    set({ currentSession: updated });
    await setStorageItem(
      MESS_STORAGE_KEY,
      JSON.stringify({ currentSession: updated, sessionsHistory: get().sessionsHistory })
    );
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },

  updateMemberMeals: async (memberId, totalMeals) => {
    const current = get().currentSession;
    const updatedMembers = current.members.map((m) =>
      m.id === memberId ? { ...m, totalMeals: Math.max(0, totalMeals) } : m
    );

    const updated = {
      ...current,
      members: updatedMembers,
      updatedAt: Date.now(),
    };

    set({ currentSession: updated });
    await setStorageItem(
      MESS_STORAGE_KEY,
      JSON.stringify({ currentSession: updated, sessionsHistory: get().sessionsHistory })
    );
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },

  addBazaarEntry: async (entry) => {
    const current = get().currentSession;
    const newEntry: MessBazaarEntry = {
      ...entry,
      id: `b_${Date.now()}`,
    };

    const updated = {
      ...current,
      bazaarEntries: [newEntry, ...current.bazaarEntries],
      updatedAt: Date.now(),
    };

    set({ currentSession: updated });
    await setStorageItem(
      MESS_STORAGE_KEY,
      JSON.stringify({ currentSession: updated, sessionsHistory: get().sessionsHistory })
    );
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },

  deleteBazaarEntry: async (entryId) => {
    const current = get().currentSession;
    const updated = {
      ...current,
      bazaarEntries: current.bazaarEntries.filter((b) => b.id !== entryId),
      updatedAt: Date.now(),
    };
    set({ currentSession: updated });
    await setStorageItem(
      MESS_STORAGE_KEY,
      JSON.stringify({ currentSession: updated, sessionsHistory: get().sessionsHistory })
    );
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },

  addUtilityBill: async (item) => {
    const current = get().currentSession;
    const newBill: MessUtilityItem = {
      ...item,
      id: `u_${Date.now()}`,
    };

    const updated = {
      ...current,
      utilityBills: [...current.utilityBills, newBill],
      updatedAt: Date.now(),
    };

    set({ currentSession: updated });
    await setStorageItem(
      MESS_STORAGE_KEY,
      JSON.stringify({ currentSession: updated, sessionsHistory: get().sessionsHistory })
    );
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },

  deleteUtilityBill: async (billId) => {
    const current = get().currentSession;
    const updated = {
      ...current,
      utilityBills: current.utilityBills.filter((u) => u.id !== billId),
      updatedAt: Date.now(),
    };
    set({ currentSession: updated });
    await setStorageItem(
      MESS_STORAGE_KEY,
      JSON.stringify({ currentSession: updated, sessionsHistory: get().sessionsHistory })
    );
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },

  logDailyMeals: async (date, meals) => {
    const current = get().currentSession;
    const newEntries: DailyMealEntry[] = meals.map((m) => ({
      id: `dm_${date}_${m.memberId}`,
      date,
      memberId: m.memberId,
      breakfast: m.breakfast,
      lunch: m.lunch,
      dinner: m.dinner,
      guestMeals: m.guestMeals,
    }));

    // Recompute total meals per member
    const updatedMembers = current.members.map((member) => {
      const log = meals.find((m) => m.memberId === member.id);
      if (!log) return member;
      const dayTotal = log.breakfast + log.lunch + log.dinner + log.guestMeals;
      return {
        ...member,
        totalMeals: member.totalMeals + dayTotal,
      };
    });

    const updated = {
      ...current,
      members: updatedMembers,
      dailyMeals: [...current.dailyMeals, ...newEntries],
      updatedAt: Date.now(),
    };

    set({ currentSession: updated });
    await setStorageItem(
      MESS_STORAGE_KEY,
      JSON.stringify({ currentSession: updated, sessionsHistory: get().sessionsHistory })
    );
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },

  syncDueBalancesToUdhaar: async () => {
    const current = get().currentSession;
    const settlements = computeMemberSettlements(current);
    const dueMembers = settlements.filter((s) => s.status === 'DUE' && Math.abs(s.balance) > 0);

    let syncedCount = 0;
    const addDebt = useDebtStore.getState().addDebt;

    for (const member of dueMembers) {
      const dueAmount = Math.abs(member.balance);
      await addDebt({
        personName: member.memberName,
        phone: member.phone || '',
        type: 'I_LENT',
        amount: dueAmount,
        startDate: Date.now(),
        notes: `${current.monthTitle} মেস ও মিল বকেয়া হিসাব (Meal: ৳${member.mealCost}, Utility: ৳${member.utilityShare})`,
      });
      syncedCount++;
    }

    if (syncedCount > 0) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }

    return syncedCount;
  },

  getStats: () => {
    return computeMessStats(get().currentSession);
  },

  getSettlements: () => {
    return computeMemberSettlements(get().currentSession);
  },
}));
