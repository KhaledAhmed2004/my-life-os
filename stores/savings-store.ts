import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { SEED_SAVINGS_GOALS } from '@/constants/default-savings';
import {
  SavingsGoal,
  SavingsPortfolioStats,
  SavingsTransaction,
} from '@/types/savings';

const SAVINGS_STORAGE_KEY = 'vital_savings_vaults_v1';

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

async function removeStorageItem(key: string) {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

interface SavingsState {
  goals: SavingsGoal[];
  isLoading: boolean;

  loadData: () => Promise<void>;
  addGoal: (
    data: Omit<
      SavingsGoal,
      'id' | 'createdAt' | 'updatedAt' | 'history' | 'isCompleted' | 'currentAmount'
    > & {
      initialDeposit?: number;
    }
  ) => Promise<SavingsGoal>;
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  deposit: (goalId: string, amount: number, note?: string) => Promise<boolean>;
  withdraw: (goalId: string, amount: number, note?: string) => Promise<boolean>;
  resetToDemoData: () => Promise<void>;
  clearAllData: () => Promise<void>;

  getPortfolioStats: () => SavingsPortfolioStats;
  getGoalPace: (goalId: string) => {
    remainingAmount: number;
    monthsRemaining: number;
    suggestedMonthly: number;
  };
}

export const useSavingsStore = create<SavingsState>((set, get) => ({
  goals: SEED_SAVINGS_GOALS,
  isLoading: false,

  loadData: async () => {
    set({ isLoading: true });
    try {
      const stored = await getStorageItem(SAVINGS_STORAGE_KEY);
      if (stored) {
        set({ goals: JSON.parse(stored), isLoading: false });
      } else {
        set({ goals: SEED_SAVINGS_GOALS, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  addGoal: async (data) => {
    const now = Date.now();
    const todayStr = new Date().toISOString().split('T')[0];
    const initialDeposit = Math.max(0, data.initialDeposit || 0);

    const history: SavingsTransaction[] = initialDeposit > 0
      ? [
          {
            id: `stx-${now}-${Math.random().toString(36).substring(2, 6)}`,
            goalId: '',
            amount: initialDeposit,
            type: 'DEPOSIT',
            note: 'Initial deposit upon vault creation',
            date: todayStr,
            createdAt: now,
          },
        ]
      : [];

    const newGoalId = `goal-${now}-${Math.random().toString(36).substring(2, 6)}`;
    if (history.length > 0) {
      history[0].goalId = newGoalId;
    }

    const currentAmount = initialDeposit;
    const isCompleted = currentAmount >= data.targetAmount;

    const newGoal: SavingsGoal = {
      id: newGoalId,
      name: data.name,
      icon: data.icon,
      targetAmount: data.targetAmount,
      currentAmount,
      targetDate: data.targetDate,
      color: data.color,
      category: data.category,
      notes: data.notes,
      isCompleted,
      createdAt: now,
      updatedAt: now,
      history,
    };

    const updated = [newGoal, ...get().goals];
    set({ goals: updated });
    await setStorageItem(SAVINGS_STORAGE_KEY, JSON.stringify(updated));

    // Auto-record in Expense Ledger if initial deposit was made
    if (initialDeposit > 0) {
      try {
        const { useExpenseStore } = await import('./expense-store');
        await useExpenseStore.getState().addTransaction({
          title: `${data.icon} ${data.name} (Vault Deposit)`,
          amount: initialDeposit,
          type: 'EXPENSE',
          categoryId: 'transfer',
          paymentMethod: 'WALLET',
          date: todayStr,
          notes: 'Initial deposit to savings vault',
        });
      } catch {}
    }

    return newGoal;
  },

  updateGoal: async (id, updates) => {
    const updated = get().goals.map((g) => {
      if (g.id !== id) return g;
      const merged = { ...g, ...updates, updatedAt: Date.now() };
      merged.isCompleted = merged.currentAmount >= merged.targetAmount;
      return merged;
    });
    set({ goals: updated });
    await setStorageItem(SAVINGS_STORAGE_KEY, JSON.stringify(updated));
  },

  deleteGoal: async (id) => {
    const targetGoal = get().goals.find((g) => g.id === id);
    const updated = get().goals.filter((g) => g.id !== id);
    set({ goals: updated });
    await setStorageItem(SAVINGS_STORAGE_KEY, JSON.stringify(updated));

    // Auto-refund remaining balance back to spendable cash!
    if (targetGoal && targetGoal.currentAmount > 0) {
      try {
        const { useExpenseStore } = await import('./expense-store');
        const todayStr = new Date().toISOString().split('T')[0];
        await useExpenseStore.getState().addTransaction({
          title: `${targetGoal.icon} ${targetGoal.name} (Vault Refund)`,
          amount: targetGoal.currentAmount,
          type: 'INCOME',
          categoryId: 'transfer',
          paymentMethod: 'WALLET',
          date: todayStr,
          notes: 'Remaining vault balance restored to wallet upon deletion',
        });
      } catch {}
    }
  },

  deposit: async (goalId, amount, note) => {
    if (amount <= 0) return false;
    const now = Date.now();
    const todayStr = new Date().toISOString().split('T')[0];

    let reachedGoal = false;
    let targetGoal: SavingsGoal | undefined;

    const updated = get().goals.map((g) => {
      if (g.id !== goalId) return g;
      targetGoal = g;

      const newCurrent = g.currentAmount + amount;
      const wasCompleted = g.isCompleted;
      const isCompleted = newCurrent >= g.targetAmount;

      if (!wasCompleted && isCompleted) {
        reachedGoal = true;
      }

      const tx: SavingsTransaction = {
        id: `stx-${now}-${Math.random().toString(36).substring(2, 6)}`,
        goalId,
        amount,
        type: 'DEPOSIT',
        note: note || 'Deposit into vault',
        date: todayStr,
        createdAt: now,
      };

      return {
        ...g,
        currentAmount: newCurrent,
        isCompleted,
        updatedAt: now,
        history: [tx, ...g.history],
      };
    });

    set({ goals: updated });
    await setStorageItem(SAVINGS_STORAGE_KEY, JSON.stringify(updated));

    // Auto-record transfer in Expense store
    if (targetGoal) {
      try {
        const { useExpenseStore } = await import('./expense-store');
        await useExpenseStore.getState().addTransaction({
          title: `${targetGoal.icon} ${targetGoal.name} (Vault Deposit)`,
          amount,
          type: 'EXPENSE',
          categoryId: 'transfer',
          paymentMethod: 'WALLET',
          date: todayStr,
          notes: note || 'Transferred to wealth vault',
        });
      } catch {}
    }

    return reachedGoal;
  },

  withdraw: async (goalId, amount, note) => {
    if (amount <= 0) return false;
    const now = Date.now();
    const todayStr = new Date().toISOString().split('T')[0];

    let targetGoal: SavingsGoal | undefined;

    const updated = get().goals.map((g) => {
      if (g.id !== goalId) return g;
      targetGoal = g;

      const newCurrent = Math.max(0, g.currentAmount - amount);
      const isCompleted = newCurrent >= g.targetAmount;

      const tx: SavingsTransaction = {
        id: `stx-${now}-${Math.random().toString(36).substring(2, 6)}`,
        goalId,
        amount,
        type: 'WITHDRAW',
        note: note || 'Withdrawal from vault',
        date: todayStr,
        createdAt: now,
      };

      return {
        ...g,
        currentAmount: newCurrent,
        isCompleted,
        updatedAt: now,
        history: [tx, ...g.history],
      };
    });

    set({ goals: updated });
    await setStorageItem(SAVINGS_STORAGE_KEY, JSON.stringify(updated));

    // Auto-record withdrawal as income return in Expense store
    if (targetGoal) {
      try {
        const { useExpenseStore } = await import('./expense-store');
        await useExpenseStore.getState().addTransaction({
          title: `${targetGoal.icon} ${targetGoal.name} (Vault Release)`,
          amount,
          type: 'INCOME',
          categoryId: 'transfer',
          paymentMethod: 'WALLET',
          date: todayStr,
          notes: note || 'Released from wealth vault to wallet',
        });
      } catch {}
    }

    return true;
  },

  resetToDemoData: async () => {
    set({ goals: SEED_SAVINGS_GOALS });
    await setStorageItem(SAVINGS_STORAGE_KEY, JSON.stringify(SEED_SAVINGS_GOALS));
  },

  clearAllData: async () => {
    set({ goals: [] });
    await removeStorageItem(SAVINGS_STORAGE_KEY);
  },

  getPortfolioStats: () => {
    const goals = get().goals;
    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const overallPercentage = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
    const activeCount = goals.filter((g) => !g.isCompleted).length;
    const completedCount = goals.filter((g) => g.isCompleted).length;

    // Calculate deposits in the last 30 days
    const thirtyDaysAgo = Date.now() - 30 * 86400 * 1000;
    let monthlyGrowth = 0;
    goals.forEach((g) => {
      g.history.forEach((tx) => {
        if (tx.createdAt >= thirtyDaysAgo) {
          if (tx.type === 'DEPOSIT') monthlyGrowth += tx.amount;
          else monthlyGrowth -= tx.amount;
        }
      });
    });

    return {
      totalSaved,
      totalTarget,
      overallPercentage,
      activeCount,
      completedCount,
      monthlyGrowth: Math.max(0, monthlyGrowth),
    };
  },

  getGoalPace: (goalId) => {
    const goal = get().goals.find((g) => g.id === goalId);
    if (!goal) {
      return { remainingAmount: 0, monthsRemaining: 1, suggestedMonthly: 0 };
    }

    const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);

    if (!goal.targetDate) {
      return {
        remainingAmount,
        monthsRemaining: 6,
        suggestedMonthly: Math.ceil(remainingAmount / 6),
      };
    }

    const targetTime = new Date(goal.targetDate).getTime();
    const nowTime = Date.now();
    const diffDays = Math.max(1, Math.ceil((targetTime - nowTime) / (86400 * 1000)));
    const monthsRemaining = Math.max(1, Math.ceil(diffDays / 30));
    const suggestedMonthly = Math.ceil(remainingAmount / monthsRemaining);

    return {
      remainingAmount,
      monthsRemaining,
      suggestedMonthly,
    };
  },
}));
