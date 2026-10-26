import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { DebtHistoryEntry, DebtItem, DebtStats, DebtStatus } from '@/types/debt';

const DEBTS_STORAGE_KEY = 'vital_debts_vault_v1';

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

const SEED_DEBTS: DebtItem[] = [
  {
    id: 'debt-lent-01',
    personName: 'Tanvir Ahmed',
    phone: '+880 1711-234567',
    type: 'I_LENT',
    amount: 15000,
    paidAmount: 5000,
    remainingAmount: 10000,
    startDate: Date.now() - 20 * 24 * 60 * 60 * 1000,
    dueDate: Date.now() + 10 * 24 * 60 * 60 * 1000, // Due in 10 days
    status: 'PARTIALLY_PAID',
    notes: 'Tour expense contribution support.',
    history: [
      {
        id: 'rep-01',
        date: Date.now() - 5 * 24 * 60 * 60 * 1000,
        amount: 5000,
        type: 'PARTIAL_PAYMENT',
        remainingAfter: 10000,
        note: 'Sent via bKash',
      },
    ],
    createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
  },
  {
    id: 'debt-borrowed-02',
    personName: 'Rahim Chowdhury (Cousin)',
    phone: '+880 1819-987654',
    type: 'I_BORROWED',
    amount: 8000,
    paidAmount: 0,
    remainingAmount: 8000,
    startDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
    dueDate: Date.now() + 5 * 24 * 60 * 60 * 1000, // Due in 5 days
    status: 'PENDING',
    notes: 'Emergency car maintenance support.',
    history: [],
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
  },
  {
    id: 'debt-lent-03',
    personName: 'Sakib Hassan',
    phone: '+880 1912-334455',
    type: 'I_LENT',
    amount: 6000,
    paidAmount: 6000,
    remainingAmount: 0,
    startDate: Date.now() - 45 * 24 * 60 * 60 * 1000,
    dueDate: Date.now() - 15 * 24 * 60 * 60 * 1000,
    status: 'SETTLED',
    notes: 'Office lunch advance payment.',
    history: [
      {
        id: 'rep-02',
        date: Date.now() - 15 * 24 * 60 * 60 * 1000,
        amount: 6000,
        type: 'FULL_PAYMENT',
        remainingAfter: 0,
        note: 'Cash settled',
      },
    ],
    createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
  },
];

interface DebtState {
  debts: DebtItem[];
  isLoading: boolean;

  loadData: () => Promise<void>;
  addDebt: (
    data: Omit<DebtItem, 'id' | 'createdAt' | 'updatedAt' | 'paidAmount' | 'remainingAmount' | 'status' | 'history'>
  ) => Promise<DebtItem>;
  updateDebt: (id: string, updates: Partial<DebtItem>) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  recordRepayment: (
    debtId: string,
    amount: number,
    note?: string
  ) => Promise<boolean>;
  settleDebt: (debtId: string, note?: string) => Promise<boolean>;
  resetToDemoData: () => Promise<void>;
  clearAllData: () => Promise<void>;

  getStats: () => DebtStats;
}

export const useDebtStore = create<DebtState>((set, get) => ({
  debts: [],
  isLoading: true,

  loadData: async () => {
    try {
      set({ isLoading: true });
      const raw = await getStorageItem(DEBTS_STORAGE_KEY);
      if (raw) {
        const parsed: DebtItem[] = JSON.parse(raw);
        set({ debts: parsed, isLoading: false });
      } else {
        await setStorageItem(DEBTS_STORAGE_KEY, JSON.stringify(SEED_DEBTS));
        set({ debts: SEED_DEBTS, isLoading: false });
      }
    } catch {
      set({ debts: SEED_DEBTS, isLoading: false });
    }
  },

  addDebt: async (data) => {
    const amount = Math.max(0, data.amount);
    const newDebt: DebtItem = {
      ...data,
      id: `debt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      amount,
      paidAmount: 0,
      remainingAmount: amount,
      status: amount === 0 ? 'SETTLED' : 'PENDING',
      history: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const nextDebts = [newDebt, ...get().debts];
    set({ debts: nextDebts });
    await setStorageItem(DEBTS_STORAGE_KEY, JSON.stringify(nextDebts));
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    return newDebt;
  },

  updateDebt: async (id, updates) => {
    const nextDebts = get().debts.map((item) => {
      if (item.id !== id) return item;
      const updated = { ...item, ...updates, updatedAt: Date.now() };

      if (updates.amount !== undefined) {
        const remaining = Math.max(0, updates.amount - updated.paidAmount);
        updated.remainingAmount = remaining;
        updated.status = remaining === 0 ? 'SETTLED' : updated.paidAmount > 0 ? 'PARTIALLY_PAID' : 'PENDING';
      }

      return updated;
    });

    set({ debts: nextDebts });
    await setStorageItem(DEBTS_STORAGE_KEY, JSON.stringify(nextDebts));
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },

  deleteDebt: async (id) => {
    const nextDebts = get().debts.filter((item) => item.id !== id);
    set({ debts: nextDebts });
    await setStorageItem(DEBTS_STORAGE_KEY, JSON.stringify(nextDebts));
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },

  recordRepayment: async (debtId, amount, note) => {
    const debt = get().debts.find((d) => d.id === debtId);
    if (!debt || debt.status === 'SETTLED' || amount <= 0) return false;

    const paymentAmount = Math.min(amount, debt.remainingAmount);
    const newPaidAmount = debt.paidAmount + paymentAmount;
    const newRemainingAmount = Math.max(0, debt.amount - newPaidAmount);
    const newStatus: DebtStatus = newRemainingAmount === 0 ? 'SETTLED' : 'PARTIALLY_PAID';

    const historyEntry: DebtHistoryEntry = {
      id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: Date.now(),
      amount: paymentAmount,
      type: newStatus === 'SETTLED' ? 'FULL_PAYMENT' : 'PARTIAL_PAYMENT',
      remainingAfter: newRemainingAmount,
      note: note || (newStatus === 'SETTLED' ? 'Fully settled payment' : 'Partial repayment'),
    };

    const nextDebts = get().debts.map((item) => {
      if (item.id !== debtId) return item;
      return {
        ...item,
        paidAmount: newPaidAmount,
        remainingAmount: newRemainingAmount,
        status: newStatus,
        history: [historyEntry, ...item.history],
        updatedAt: Date.now(),
      };
    });

    set({ debts: nextDebts });
    await setStorageItem(DEBTS_STORAGE_KEY, JSON.stringify(nextDebts));
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    return true;
  },

  settleDebt: async (debtId, note) => {
    const debt = get().debts.find((d) => d.id === debtId);
    if (!debt || debt.status === 'SETTLED') return false;

    const remaining = debt.remainingAmount;
    return get().recordRepayment(debtId, remaining, note || 'Marked fully settled');
  },

  resetToDemoData: async () => {
    await setStorageItem(DEBTS_STORAGE_KEY, JSON.stringify(SEED_DEBTS));
    set({ debts: SEED_DEBTS });
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },

  clearAllData: async () => {
    await setStorageItem(DEBTS_STORAGE_KEY, JSON.stringify([]));
    set({ debts: [] });
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
  },

  getStats: () => {
    const now = Date.now();
    const debts = get().debts;

    let totalLentPending = 0;
    let totalBorrowedPending = 0;
    let activeLentCount = 0;
    let activeBorrowedCount = 0;
    let overdueCount = 0;
    let totalSettledCount = 0;

    for (const item of debts) {
      if (item.status === 'SETTLED') {
        totalSettledCount++;
        continue;
      }

      if (item.dueDate && item.dueDate < now) {
        overdueCount++;
      }

      if (item.type === 'I_LENT') {
        totalLentPending += item.remainingAmount;
        activeLentCount++;
      } else {
        totalBorrowedPending += item.remainingAmount;
        activeBorrowedCount++;
      }
    }

    const netBalance = totalLentPending - totalBorrowedPending;

    return {
      totalLentPending: Math.round(totalLentPending),
      totalBorrowedPending: Math.round(totalBorrowedPending),
      netBalance: Math.round(netBalance),
      activeLentCount,
      activeBorrowedCount,
      overdueCount,
      totalSettledCount,
    };
  },
}));
