import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';

import { Subscription, SubscriptionCategory, SubscriptionSummary } from '@/types/subscription';

const SUBSCRIPTION_STORAGE_KEY = 'vital_subscriptions_v2';

const SEED_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-gym-01',
    name: "Gold's Gym Elite",
    icon: 'fitness-center',
    amount: 3500,
    category: 'FITNESS',
    billingCycle: 'MONTHLY',
    dueDay: 5,
    autoLog: false,
    color: '#FF6B6B',
    notes: 'Access to gym, sauna & personal locker',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
  },
  {
    id: 'sub-streaming-02',
    name: 'Netflix & Spotify Duo',
    icon: 'movie',
    amount: 1200,
    category: 'STREAMING',
    billingCycle: 'MONTHLY',
    dueDay: 14,
    autoLog: false,
    color: '#CC5DE8',
    notes: 'Premium 4K plan + Music streaming',
    createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
  },
  {
    id: 'sub-rent-03',
    name: 'Apartment Lease',
    icon: 'home',
    amount: 45000,
    category: 'HOUSING',
    billingCycle: 'MONTHLY',
    dueDay: 1,
    autoLog: false,
    color: '#4DABF7',
    notes: 'Monthly fixed rent payment',
    createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
  },
  {
    id: 'sub-internet-04',
    name: 'Fiber Internet 500Mbps',
    icon: 'wifi',
    amount: 1800,
    category: 'UTILITIES',
    billingCycle: 'MONTHLY',
    dueDay: 10,
    autoLog: false,
    color: '#20C997',
    notes: 'Home gigabit optical connection',
    createdAt: Date.now() - 40 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
  },
  {
    id: 'sub-cloud-05',
    name: 'AI Workspace Pro',
    icon: 'cloud-queue',
    amount: 2000,
    category: 'SOFTWARE',
    billingCycle: 'MONTHLY',
    dueDay: 22,
    autoLog: false,
    color: '#FCC419',
    notes: 'Cloud storage & AI assistant tooling',
    createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
  },
];

async function getStorageItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return await SecureStore.getItemAsync(key);
}

async function setStorageItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

interface SubscriptionState {
  subscriptions: Subscription[];
  isLoading: boolean;
  loadData: () => Promise<void>;
  addSubscription: (data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Subscription>;
  updateSubscription: (id: string, updates: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  markAsPaid: (id: string, amountOverride?: number) => Promise<boolean>;
  getSummary: () => SubscriptionSummary;
  getUpcomingBills: (daysWindow?: number) => Array<Subscription & { daysUntilDue: number; isPaidThisMonth: boolean }>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscriptions: SEED_SUBSCRIPTIONS,
  isLoading: false,

  loadData: async () => {
    set({ isLoading: true });
    try {
      const stored = await getStorageItem(SUBSCRIPTION_STORAGE_KEY);
      if (stored) {
        set({ subscriptions: JSON.parse(stored) });
      } else {
        set({ subscriptions: SEED_SUBSCRIPTIONS });
        await setStorageItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(SEED_SUBSCRIPTIONS));
      }
    } catch {
      set({ subscriptions: SEED_SUBSCRIPTIONS });
    } finally {
      set({ isLoading: false });
    }
  },

  addSubscription: async (data) => {
    const now = Date.now();
    const newSub: Subscription = {
      id: `sub-${now}-${Math.random().toString(36).substring(2, 6)}`,
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    const updated = [newSub, ...get().subscriptions];
    set({ subscriptions: updated });
    await setStorageItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(updated));
    return newSub;
  },

  updateSubscription: async (id, updates) => {
    const updated = get().subscriptions.map((s) => {
      if (s.id !== id) return s;
      return { ...s, ...updates, updatedAt: Date.now() };
    });
    set({ subscriptions: updated });
    await setStorageItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(updated));
  },

  deleteSubscription: async (id) => {
    const updated = get().subscriptions.filter((s) => s.id !== id);
    set({ subscriptions: updated });
    await setStorageItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(updated));
  },

  markAsPaid: async (id, amountOverride) => {
    const target = get().subscriptions.find((s) => s.id === id);
    if (!target) return false;

    const currentYearMonth = new Date().toISOString().substring(0, 7); // 'YYYY-MM'
    const todayStr = new Date().toISOString().split('T')[0];
    const amountToCharge = amountOverride || target.amount;

    // 1. Update subscription state
    const updated = get().subscriptions.map((s) => {
      if (s.id !== id) return s;
      return { ...s, lastPaidMonth: currentYearMonth, updatedAt: Date.now() };
    });
    set({ subscriptions: updated });
    await setStorageItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(updated));

    // 2. Auto-record in Expense Store
    try {
      const { useExpenseStore } = await import('./expense-store');
      await useExpenseStore.getState().addTransaction({
        title: `${target.icon} ${target.name}`,
        amount: amountToCharge,
        type: 'EXPENSE',
        categoryId: target.category === 'FITNESS' ? 'gym' : 'other_expense',
        paymentMethod: 'WALLET',
        date: todayStr,
        notes: `Recurring subscription bill for ${new Date().toLocaleString('en-US', { month: 'long' })}`,
      });
    } catch {}

    return true;
  },

  getSummary: () => {
    const subs = get().subscriptions;
    const currentYearMonth = new Date().toISOString().substring(0, 7);
    const today = new Date().getDate();

    let totalMonthly = 0;
    let paidCount = 0;
    let upcomingWeekCount = 0;

    subs.forEach((s) => {
      const monthlyEquivalent =
        s.billingCycle === 'YEARLY' ? Math.round(s.amount / 12) : s.amount;
      totalMonthly += monthlyEquivalent;

      const isPaid = s.lastPaidMonth === currentYearMonth;
      if (isPaid) {
        paidCount++;
      } else {
        const diff = s.dueDay - today;
        if (diff >= 0 && diff <= 7) {
          upcomingWeekCount++;
        }
      }
    });

    return {
      totalMonthlyCommitment: totalMonthly,
      totalAnnualCommitment: totalMonthly * 12,
      activeCount: subs.length,
      paidThisMonthCount: paidCount,
      upcomingThisWeekCount: upcomingWeekCount,
    };
  },

  getUpcomingBills: (daysWindow = 14) => {
    const subs = get().subscriptions;
    const currentYearMonth = new Date().toISOString().substring(0, 7);
    const today = new Date().getDate();

    return subs
      .map((s) => {
        const isPaid = s.lastPaidMonth === currentYearMonth;
        let daysUntilDue = s.dueDay - today;
        if (daysUntilDue < 0) {
          // Passed this month, next month due
          daysUntilDue += 30;
        }

        return {
          ...s,
          daysUntilDue,
          isPaidThisMonth: isPaid,
        };
      })
      .sort((a, b) => {
        if (a.isPaidThisMonth !== b.isPaidThisMonth) {
          return a.isPaidThisMonth ? 1 : -1; // Unpaid first
        }
        return a.daysUntilDue - b.daysUntilDue;
      });
  },
}));
