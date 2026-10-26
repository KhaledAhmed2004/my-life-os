import { create } from 'zustand';
import { SEED_TRANSACTIONS, getCategoryById } from '@/constants/expense-categories';
import { CategoryExpenseSummary, Transaction } from '@/types/expense';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const EXPENSES_STORAGE_KEY = 'vital_expenses_data_v1';
const BUDGET_STORAGE_KEY = 'vital_monthly_budget_v1';
const PRIVACY_STORAGE_KEY = 'vital_privacy_mode_v1';
const DEFAULT_MONTHLY_BUDGET = 50000;

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

const CATEGORY_BUDGETS_STORAGE_KEY = 'vital_category_budgets_v1';

export const DEFAULT_CATEGORY_BUDGETS: Record<string, number> = {
  food: 12000,
  supplements: 8000,
  gym: 15000,
  shopping: 6000,
  games: 2500,
  jewelry: 8000,
  transport: 4000,
  bills: 12000,
  other_expense: 3000,
};

export interface DailySpendingPoint {
  date: string;
  dayLabel: string;
  fullDateLabel: string;
  amount: number;
  transactionCount: number;
  isToday: boolean;
}

export interface HeatmapDayCell {
  date: string;
  dayNum: number;
  amount: number;
  intensityLevel: 0 | 1 | 2 | 3 | 4;
  isCurrentMonth: boolean;
  isToday: boolean;
  transactionCount: number;
}

export interface DailySpendingStats {
  dailyAvg: number;
  peakDay: { date: string; dayLabel: string; amount: number };
  zeroSpendDays: number;
  weekTotal: number;
}

export interface CategoryBudgetStatus {
  category: ReturnType<typeof getCategoryById>;
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'SAFE' | 'WARNING' | 'OVERBUDGET';
  overAmount: number;
  transactionCount: number;
}

export interface OverBudgetSummary {
  overBudgetCount: number;
  totalOverAmount: number;
  warningCount: number;
  safeCount: number;
  totalAllocated: number;
  totalBudget: number;
  unallocatedAmount: number;
}

export type BudgetPreset = '50_30_20' | 'FITNESS' | 'FRUGAL' | 'AUTO_FIT';

export type BudgetBucketType = 'FIXED' | 'SAVINGS' | 'FLEXIBLE';

export const CATEGORY_BUCKET_MAP: Record<string, BudgetBucketType> = {
  bills: 'FIXED',
  other_expense: 'FIXED',
  food: 'FLEXIBLE',
  supplements: 'FLEXIBLE',
  gym: 'FLEXIBLE',
  shopping: 'FLEXIBLE',
  games: 'FLEXIBLE',
  jewelry: 'FLEXIBLE',
  transport: 'FLEXIBLE',
};

export interface BucketSummary {
  type: BudgetBucketType;
  label: string;
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentage: number;
  categories: CategoryBudgetStatus[];
}

export interface ThreeBucketOverview {
  totalInflow: number;
  totalOutflow: number;
  fixedCommitments: BucketSummary;
  dedicatedSavings: BucketSummary;
  flexibleSpending: BucketSummary;
  availableToSpend: number;
  safeDailyTarget: number;
  daysRemaining: number;
  paceStatus: 'ON_TRACK' | 'TIGHT' | 'ZERO_BURN';
}

export interface DailySafeToSpend {
  safeDailyAmount: number;
  daysLeft: number;
  remainingBudget: number;
  status: 'ON_TRACK' | 'TIGHT' | 'ZERO_BURN';
  recoveryAdvice: string;
  burnPaceRatio: number;
}

export interface FinancialHealthScore {
  score: number;
  grade: 'PRIME' | 'HEALTHY' | 'CAUTION' | 'CRITICAL';
  label: string;
  budgetScore: number;
  cashflowScore: number;
  diversificationScore: number;
}

export interface CreditScore {
  score: number; // 300–850
  tier: 'EXCEPTIONAL' | 'VERY_GOOD' | 'GOOD' | 'FAIR' | 'POOR';
  label: string;
  color: string;
  paymentScore: number;    // max 35
  utilizationScore: number; // max 30
  savingsScore: number;    // max 20
  consistencyScore: number; // max 10
  diversityScore: number;  // max 5
  tip: string;
}

interface ExpenseState {
  transactions: Transaction[];
  monthlyBudget: number;
  categoryBudgets: Record<string, number>;
  isLoading: boolean;
  isPrivacyMode: boolean;
  lastDeletedTransaction: Transaction | null;
  loadData: () => Promise<void>;
  togglePrivacyMode: () => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  undoDeleteTransaction: () => Promise<boolean>;
  updateMonthlyBudget: (budget: number) => Promise<void>;
  setCategoryBudget: (categoryId: string, amount: number) => Promise<void>;
  setAllCategoryBudgets: (budgets: Record<string, number>) => Promise<void>;
  applyBudgetPreset: (preset: BudgetPreset) => Promise<void>;
  resetToDemoData: () => Promise<void>;
  clearAllData: () => Promise<void>;
  getTotals: () => { totalIncome: number; totalExpense: number; netBalance: number };
  getCategoryBreakdown: () => CategoryExpenseSummary[];
  getCategoryBudgetStatus: () => CategoryBudgetStatus[];
  getOverBudgetSummary: () => OverBudgetSummary;
  getDailySpendingSeries: (daysCount?: number) => DailySpendingPoint[];
  getMonthlySpendingHeatmap: () => HeatmapDayCell[];
  getDailySpendingStats: () => DailySpendingStats;
  getDailySafeToSpend: () => DailySafeToSpend;
  getFinancialHealthScore: () => FinancialHealthScore;
  getCreditScore: () => CreditScore;
  getThreeBucketOverview: () => ThreeBucketOverview;
  autoBalanceFlexibleEnvelopes: () => Promise<void>;
  rebalanceEnvelopes: (fromCatId: string, toCatId: string, amount: number) => Promise<void>;
  getSuggestedRebalances: () => {
    deficitCatId: string;
    deficitAmount: number;
    surplusCatId: string;
    surplusAvailable: number;
  }[];
  autoFitUnallocatedBuffer: () => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  transactions: SEED_TRANSACTIONS,
  monthlyBudget: DEFAULT_MONTHLY_BUDGET,
  categoryBudgets: DEFAULT_CATEGORY_BUDGETS,
  isLoading: false,
  isPrivacyMode: false,
  lastDeletedTransaction: null,

  loadData: async () => {
    set({ isLoading: true });
    try {
      const storedTx = await getStorageItem(EXPENSES_STORAGE_KEY);
      const storedBudget = await getStorageItem(BUDGET_STORAGE_KEY);
      const storedCatBudgets = await getStorageItem(CATEGORY_BUDGETS_STORAGE_KEY);
      const storedPrivacy = await getStorageItem(PRIVACY_STORAGE_KEY);

      const transactions = storedTx ? JSON.parse(storedTx) : SEED_TRANSACTIONS;
      const monthlyBudget = storedBudget ? Number(storedBudget) : DEFAULT_MONTHLY_BUDGET;
      const categoryBudgets = storedCatBudgets
        ? { ...DEFAULT_CATEGORY_BUDGETS, ...JSON.parse(storedCatBudgets) }
        : DEFAULT_CATEGORY_BUDGETS;
      const isPrivacyMode = storedPrivacy === 'true';

      set({ transactions, monthlyBudget, categoryBudgets, isPrivacyMode, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  togglePrivacyMode: async () => {
    const next = !get().isPrivacyMode;
    set({ isPrivacyMode: next });
    await setStorageItem(PRIVACY_STORAGE_KEY, String(next));
  },

  addTransaction: async (txData) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };
    const updated = [newTx, ...get().transactions];
    set({ transactions: updated });
    await setStorageItem(EXPENSES_STORAGE_KEY, JSON.stringify(updated));

    try {
      const { useRoutineStore } = await import('./routine-store');
      void useRoutineStore.getState().autoCompleteByAction('EXPENSE');
    } catch {}
  },

  deleteTransaction: async (id) => {
    const target = get().transactions.find((t) => t.id === id);
    const updated = get().transactions.filter((t) => t.id !== id);
    set({ transactions: updated, lastDeletedTransaction: target || null });
    await setStorageItem(EXPENSES_STORAGE_KEY, JSON.stringify(updated));
  },

  undoDeleteTransaction: async () => {
    const lastDeleted = get().lastDeletedTransaction;
    if (!lastDeleted) return false;
    const updated = [lastDeleted, ...get().transactions];
    set({ transactions: updated, lastDeletedTransaction: null });
    await setStorageItem(EXPENSES_STORAGE_KEY, JSON.stringify(updated));
    return true;
  },

  updateMonthlyBudget: async (budget) => {
    set({ monthlyBudget: budget });
    await setStorageItem(BUDGET_STORAGE_KEY, String(budget));
  },

  setCategoryBudget: async (categoryId, amount) => {
    const updated = { ...get().categoryBudgets, [categoryId]: Math.max(0, amount) };
    set({ categoryBudgets: updated });
    await setStorageItem(CATEGORY_BUDGETS_STORAGE_KEY, JSON.stringify(updated));
  },

  setAllCategoryBudgets: async (budgets) => {
    set({ categoryBudgets: budgets });
    await setStorageItem(CATEGORY_BUDGETS_STORAGE_KEY, JSON.stringify(budgets));
  },

  applyBudgetPreset: async (preset: BudgetPreset) => {
    const total = get().monthlyBudget > 0 ? get().monthlyBudget : 60000;
    let newBudgets: Record<string, number> = { ...DEFAULT_CATEGORY_BUDGETS };

    if (preset === '50_30_20') {
      newBudgets = {
        food: Math.round(total * 0.30),
        bills: Math.round(total * 0.20),
        shopping: Math.round(total * 0.15),
        games: Math.round(total * 0.15),
        gym: Math.round(total * 0.10),
        supplements: Math.round(total * 0.10),
        transport: Math.round(total * 0.05),
        jewelry: Math.round(total * 0.05),
        other_expense: Math.round(total * 0.05),
      };
    } else if (preset === 'FITNESS') {
      newBudgets = {
        food: Math.round(total * 0.35),
        gym: Math.round(total * 0.25),
        supplements: Math.round(total * 0.20),
        bills: Math.round(total * 0.10),
        shopping: Math.round(total * 0.05),
        games: Math.round(total * 0.05),
        transport: Math.round(total * 0.05),
        jewelry: Math.round(total * 0.05),
        other_expense: Math.round(total * 0.05),
      };
    } else if (preset === 'FRUGAL') {
      newBudgets = {
        food: Math.round(total * 0.25),
        bills: Math.round(total * 0.20),
        transport: Math.round(total * 0.10),
        gym: Math.round(total * 0.08),
        supplements: Math.round(total * 0.07),
        shopping: Math.round(total * 0.05),
        games: Math.round(total * 0.03),
        jewelry: Math.round(total * 0.02),
        other_expense: Math.round(total * 0.05),
      };
    } else if (preset === 'AUTO_FIT') {
      // Auto-fit to actual spending with 15% buffer
      const statusList = get().getCategoryBudgetStatus();
      statusList.forEach((s) => {
        const target = Math.max(1000, Math.round((s.spent * 1.15) / 500) * 500);
        newBudgets[s.category.id] = target;
      });
    }

    set({ categoryBudgets: newBudgets });
    await setStorageItem(CATEGORY_BUDGETS_STORAGE_KEY, JSON.stringify(newBudgets));
  },

  resetToDemoData: async () => {
    set({
      transactions: SEED_TRANSACTIONS,
      monthlyBudget: DEFAULT_MONTHLY_BUDGET,
      categoryBudgets: DEFAULT_CATEGORY_BUDGETS,
    });
    await setStorageItem(EXPENSES_STORAGE_KEY, JSON.stringify(SEED_TRANSACTIONS));
    await setStorageItem(BUDGET_STORAGE_KEY, String(DEFAULT_MONTHLY_BUDGET));
    await setStorageItem(CATEGORY_BUDGETS_STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORY_BUDGETS));
  },

  clearAllData: async () => {
    set({ transactions: [] });
    await removeStorageItem(EXPENSES_STORAGE_KEY);
  },

  getTotals: () => {
    const txs = get().transactions;
    const totalIncome = txs
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = txs
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpense;

    return { totalIncome, totalExpense, netBalance };
  },

  getCategoryBreakdown: () => {
    const expenseTx = get().transactions.filter((t) => t.type === 'EXPENSE');
    const totalExp = expenseTx.reduce((sum, t) => sum + t.amount, 0);

    const categoryMap = new Map<string, { total: number; count: number }>();

    expenseTx.forEach((tx) => {
      const prev = categoryMap.get(tx.categoryId) || { total: 0, count: 0 };
      categoryMap.set(tx.categoryId, {
        total: prev.total + tx.amount,
        count: prev.count + 1,
      });
    });

    const summaries: CategoryExpenseSummary[] = [];

    categoryMap.forEach((val, categoryId) => {
      const cat = getCategoryById(categoryId);
      summaries.push({
        category: cat,
        totalAmount: val.total,
        percentage: totalExp > 0 ? (val.total / totalExp) * 100 : 0,
        transactionCount: val.count,
      });
    });

    return summaries.sort((a, b) => b.totalAmount - a.totalAmount);
  },

  getCategoryBudgetStatus: () => {
    const expenseTx = get().transactions.filter((t) => t.type === 'EXPENSE');
    const budgets = get().categoryBudgets || DEFAULT_CATEGORY_BUDGETS;

    // Collect spending per category
    const spendingMap = new Map<string, { spent: number; count: number }>();
    expenseTx.forEach((tx) => {
      const prev = spendingMap.get(tx.categoryId) || { spent: 0, count: 0 };
      spendingMap.set(tx.categoryId, {
        spent: prev.spent + tx.amount,
        count: prev.count + 1,
      });
    });

    // List of active expense categories
    const categories = [
      getCategoryById('food'),
      getCategoryById('supplements'),
      getCategoryById('gym'),
      getCategoryById('shopping'),
      getCategoryById('games'),
      getCategoryById('jewelry'),
      getCategoryById('transport'),
      getCategoryById('bills'),
      getCategoryById('other_expense'),
    ];

    const results: CategoryBudgetStatus[] = categories.map((cat) => {
      const data = spendingMap.get(cat.id) || { spent: 0, count: 0 };
      const budget = budgets[cat.id] ?? DEFAULT_CATEGORY_BUDGETS[cat.id] ?? 3000;
      const spent = data.spent;
      const remaining = Math.max(0, budget - spent);
      const percentage = budget > 0 ? (spent / budget) * 100 : 0;
      const isOver = spent > budget;
      const isWarning = !isOver && percentage >= 75;

      return {
        category: cat,
        budget,
        spent,
        remaining,
        percentage,
        status: isOver ? 'OVERBUDGET' : isWarning ? 'WARNING' : 'SAFE',
        overAmount: Math.max(0, spent - budget),
        transactionCount: data.count,
      };
    });

    // Sort by overbudget first, then percentage descending
    return results.sort((a, b) => {
      if (a.status === 'OVERBUDGET' && b.status !== 'OVERBUDGET') return -1;
      if (b.status === 'OVERBUDGET' && a.status !== 'OVERBUDGET') return 1;
      return b.percentage - a.percentage;
    });
  },

  getOverBudgetSummary: () => {
    const statuses = get().getCategoryBudgetStatus();
    const monthlyBudget = get().monthlyBudget;

    let overBudgetCount = 0;
    let totalOverAmount = 0;
    let warningCount = 0;
    let safeCount = 0;
    let totalAllocated = 0;

    statuses.forEach((s) => {
      totalAllocated += s.budget;
      if (s.status === 'OVERBUDGET') {
        overBudgetCount++;
        totalOverAmount += s.overAmount;
      } else if (s.status === 'WARNING') {
        warningCount++;
      } else {
        safeCount++;
      }
    });

    const unallocatedAmount = Math.max(0, monthlyBudget - totalAllocated);

    return {
      overBudgetCount,
      totalOverAmount,
      warningCount,
      safeCount,
      totalAllocated,
      totalBudget: monthlyBudget,
      unallocatedAmount,
    };
  },

  getDailySpendingSeries: (daysCount = 7) => {
    const expenseTxs = get().transactions.filter((t) => t.type === 'EXPENSE');
    const series: DailySpendingPoint[] = [];
    const today = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86400000);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      const fullDateLabel = `${dayName}, ${d.getDate()} ${monthName}`;

      const matchingTxs = expenseTxs.filter((t) => t.date === dateStr);
      const amount = matchingTxs.reduce((sum, t) => sum + t.amount, 0);

      series.push({
        date: dateStr,
        dayLabel: dayName,
        fullDateLabel,
        amount,
        transactionCount: matchingTxs.length,
        isToday: i === 0,
      });
    }

    return series;
  },

  getMonthlySpendingHeatmap: () => {
    const expenseTxs = get().transactions.filter((t) => t.type === 'EXPENSE');
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const todayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`;

    // Get first day of month and total days
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDay.getDate();

    // Find start offset (0: Sunday, 1: Monday, ... 6: Saturday)
    // We'll align by Monday (0 = Mon, 6 = Sun)
    let startDayOfWeek = firstDay.getDay(); // 0 is Sunday
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    // Collect daily totals for current month
    const dailySpendMap = new Map<string, { amount: number; count: number }>();
    expenseTxs.forEach((tx) => {
      const prev = dailySpendMap.get(tx.date) || { amount: 0, count: 0 };
      dailySpendMap.set(tx.date, {
        amount: prev.amount + tx.amount,
        count: prev.count + 1,
      });
    });

    // Find max daily spend to calibrate intensity thresholds
    let maxSpend = 1;
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
        day
      ).padStart(2, '0')}`;
      const spend = dailySpendMap.get(dateStr)?.amount || 0;
      if (spend > maxSpend) maxSpend = spend;
    }

    const cells: HeatmapDayCell[] = [];

    // Add padding days from previous month
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDayNum = prevMonthLastDay - i;
      const prevDate = new Date(currentYear, currentMonth - 1, prevDayNum);
      const dateStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(prevDayNum).padStart(2, '0')}`;

      cells.push({
        date: dateStr,
        dayNum: prevDayNum,
        amount: 0,
        intensityLevel: 0,
        isCurrentMonth: false,
        isToday: false,
        transactionCount: 0,
      });
    }

    // Add current month days
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
        day
      ).padStart(2, '0')}`;
      const data = dailySpendMap.get(dateStr) || { amount: 0, count: 0 };
      const amount = data.amount;

      let intensityLevel: 0 | 1 | 2 | 3 | 4 = 0;
      if (amount > 0) {
        const ratio = amount / maxSpend;
        if (ratio > 0.75) intensityLevel = 4;
        else if (ratio > 0.5) intensityLevel = 3;
        else if (ratio > 0.25) intensityLevel = 2;
        else intensityLevel = 1;
      }

      cells.push({
        date: dateStr,
        dayNum: day,
        amount,
        intensityLevel,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        transactionCount: data.count,
      });
    }

    // Add trailing padding to complete the week (multiple of 7)
    const remainder = cells.length % 7;
    if (remainder !== 0) {
      const needed = 7 - remainder;
      for (let day = 1; day <= needed; day++) {
        const nextDate = new Date(currentYear, currentMonth + 1, day);
        const dateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(
          2,
          '0'
        )}-${String(day).padStart(2, '0')}`;

        cells.push({
          date: dateStr,
          dayNum: day,
          amount: 0,
          intensityLevel: 0,
          isCurrentMonth: false,
          isToday: false,
          transactionCount: 0,
        });
      }
    }

    return cells;
  },

  getDailySpendingStats: () => {
    const series = get().getDailySpendingSeries(14);
    const last7 = series.slice(-7);

    const weekTotal = last7.reduce((sum, d) => sum + d.amount, 0);
    const dailyAvg = Math.round(weekTotal / 7);

    let peakDay = { date: '', dayLabel: 'None', amount: 0 };
    let zeroSpendDays = 0;

    series.forEach((d) => {
      if (d.amount > peakDay.amount) {
        peakDay = { date: d.date, dayLabel: d.dayLabel, amount: d.amount };
      }
      if (d.amount === 0) {
        zeroSpendDays++;
      }
    });

    return {
      dailyAvg,
      peakDay,
      zeroSpendDays,
      weekTotal,
    };
  },

  getDailySafeToSpend: () => {
    const now = new Date();
    const dayOfMonth = now.getDate();
    const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysLeft = Math.max(1, totalDaysInMonth - dayOfMonth + 1);

    const monthlyBudget = get().monthlyBudget;
    const { totalExpense } = get().getTotals();
    const remainingBudget = monthlyBudget - totalExpense;

    if (remainingBudget <= 0) {
      return {
        safeDailyAmount: 0,
        daysLeft,
        remainingBudget,
        status: 'ZERO_BURN',
        recoveryAdvice: 'Monthly budget reached. Limit outlays strictly to zero-burn essentials until month resets.',
        burnPaceRatio: Math.round((totalExpense / (monthlyBudget || 1)) * 100) / 100,
      };
    }

    const safeDailyAmount = Math.floor(remainingBudget / daysLeft);
    const expectedSpendByToday = (monthlyBudget / totalDaysInMonth) * dayOfMonth;
    const burnPaceRatio = Math.round((totalExpense / (expectedSpendByToday || 1)) * 100) / 100;

    let status: 'ON_TRACK' | 'TIGHT' | 'ZERO_BURN' = 'ON_TRACK';
    let recoveryAdvice = `You have ${daysLeft} days remaining. Spend under ${safeDailyAmount.toLocaleString('en-US').replace(/,/g, ' ')} ৳/day to stay on budget.`;

    if (burnPaceRatio > 1.15) {
      status = 'TIGHT';
      recoveryAdvice = `Burn pace is ${(burnPaceRatio * 100 - 100).toFixed(0)}% faster than target. Keep non-essential outlays modest.`;
    }

    return {
      safeDailyAmount,
      daysLeft,
      remainingBudget,
      status,
      recoveryAdvice,
      burnPaceRatio,
    };
  },

  getFinancialHealthScore: () => {
    const { totalIncome, totalExpense } = get().getTotals();
    const monthlyBudget = get().monthlyBudget;
    const now = new Date();
    const dayOfMonth = now.getDate();
    const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    // 1. Budget Discipline (Max 45 points)
    const expectedRatio = dayOfMonth / totalDaysInMonth;
    const actualSpendRatio = monthlyBudget > 0 ? totalExpense / monthlyBudget : 0;
    let budgetScore = 45;
    if (actualSpendRatio > expectedRatio) {
      const overPace = actualSpendRatio - expectedRatio;
      budgetScore = Math.max(10, Math.round(45 - overPace * 60));
    }

    // 2. Cashflow & Savings Buffer (Max 30 points)
    let cashflowScore = 20;
    if (totalIncome > 0) {
      const netSavingsRatio = (totalIncome - totalExpense) / totalIncome;
      if (netSavingsRatio >= 0.3) cashflowScore = 30;
      else if (netSavingsRatio >= 0.15) cashflowScore = 25;
      else if (netSavingsRatio >= 0.05) cashflowScore = 18;
      else if (netSavingsRatio >= 0) cashflowScore = 12;
      else cashflowScore = 5;
    }

    // 3. Expense Diversification (Max 25 points)
    const breakdown = get().getCategoryBreakdown();
    let diversificationScore = 25;
    if (breakdown.length > 0 && totalExpense > 0) {
      const highestCategoryPct = breakdown[0].percentage;
      if (highestCategoryPct > 65) diversificationScore = 12;
      else if (highestCategoryPct > 45) diversificationScore = 18;
    }

    const totalScore = Math.min(100, Math.max(15, budgetScore + cashflowScore + diversificationScore));

    let grade: 'PRIME' | 'HEALTHY' | 'CAUTION' | 'CRITICAL' = 'HEALTHY';
    let label = 'Solid & Balanced';

    if (totalScore >= 88) {
      grade = 'PRIME';
      label = 'Prime';
    } else if (totalScore >= 72) {
      grade = 'HEALTHY';
      label = 'Healthy';
    } else if (totalScore >= 52) {
      grade = 'CAUTION';
      label = 'Caution';
    } else {
      grade = 'CRITICAL';
      label = 'Critical';
    }

    return {
      score: totalScore,
      grade,
      label,
      budgetScore,
      cashflowScore,
      diversificationScore,
    };
  },

  getCreditScore: () => {
    const { totalIncome, totalExpense } = get().getTotals();
    const monthlyBudget = get().monthlyBudget;
    const transactions = get().transactions;
    const now = new Date();
    const dayOfMonth = now.getDate();
    const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    // 1. Payment / Budget Discipline (Max 35 pts → maps to 35% weight)
    const expectedRatio = dayOfMonth / totalDaysInMonth;
    const actualSpendRatio = monthlyBudget > 0 ? totalExpense / monthlyBudget : 0;
    let paymentScore = 35;
    if (actualSpendRatio > expectedRatio) {
      const overPace = actualSpendRatio - expectedRatio;
      paymentScore = Math.max(5, Math.round(35 - overPace * 50));
    }

    // 2. Credit Utilization — how much of budget used (Max 30 pts)
    let utilizationScore = 30;
    if (monthlyBudget > 0) {
      const utilPct = totalExpense / monthlyBudget;
      if (utilPct <= 0.3) utilizationScore = 30;
      else if (utilPct <= 0.5) utilizationScore = 26;
      else if (utilPct <= 0.7) utilizationScore = 20;
      else if (utilPct <= 0.9) utilizationScore = 13;
      else utilizationScore = 6;
    }

    // 3. Savings Rate (Max 20 pts)
    let savingsScore = 10;
    if (totalIncome > 0) {
      const savingsRatio = (totalIncome - totalExpense) / totalIncome;
      if (savingsRatio >= 0.3) savingsScore = 20;
      else if (savingsRatio >= 0.2) savingsScore = 17;
      else if (savingsRatio >= 0.1) savingsScore = 13;
      else if (savingsRatio >= 0) savingsScore = 8;
      else savingsScore = 3;
    }

    // 4. Spending Consistency — days with transactions (Max 10 pts)
    const expenseTxs = transactions.filter((t) => t.type === 'EXPENSE');
    const uniqueDays = new Set(expenseTxs.map((t) => new Date(t.createdAt).toDateString())).size;
    let consistencyScore = 5;
    if (uniqueDays >= 20) consistencyScore = 10;
    else if (uniqueDays >= 12) consistencyScore = 8;
    else if (uniqueDays >= 6) consistencyScore = 6;
    else if (uniqueDays >= 3) consistencyScore = 4;
    else consistencyScore = 2;

    // 5. Income Diversity (Max 5 pts)
    const incomeTxs = transactions.filter((t) => t.type === 'INCOME');
    const uniqueIncomeSources = new Set(incomeTxs.map((t) => t.categoryId)).size;
    let diversityScore = 2;
    if (uniqueIncomeSources >= 3) diversityScore = 5;
    else if (uniqueIncomeSources >= 2) diversityScore = 4;
    else if (uniqueIncomeSources >= 1) diversityScore = 3;

    // Map 0–100 base score to 300–850 FICO-like range
    const rawBase = paymentScore + utilizationScore + savingsScore + consistencyScore + diversityScore;
    const score = Math.round(300 + (rawBase / 100) * 550);
    const clamped = Math.min(850, Math.max(300, score));

    let tier: CreditScore['tier'] = 'FAIR';
    let label = 'Fair';
    let color = '#FCC419';
    let tip = 'Stay within your monthly budget to improve your score.';

    if (clamped >= 800) {
      tier = 'EXCEPTIONAL';
      label = 'Exceptional';
      color = '#C8F135';
      tip = 'Outstanding! Keep your savings rate above 20% to maintain this.';
    } else if (clamped >= 740) {
      tier = 'VERY_GOOD';
      label = 'Very Good';
      color = '#20C997';
      tip = 'Great discipline. Diversify income sources to push into Exceptional.';
    } else if (clamped >= 670) {
      tier = 'GOOD';
      label = 'Good';
      color = '#74C0FC';
      tip = 'Solid standing. Try to save at least 15% of your monthly income.';
    } else if (clamped >= 580) {
      tier = 'FAIR';
      label = 'Fair';
      color = '#FCC419';
      tip = 'Reduce your budget utilization below 50% to move to Good tier.';
    } else {
      tier = 'POOR';
      label = 'Poor';
      color = '#FA5252';
      tip = 'Start by logging income and keeping spending under your budget limit.';
    }

    return {
      score: clamped,
      tier,
      label,
      color,
      paymentScore,
      utilizationScore,
      savingsScore,
      consistencyScore,
      diversityScore,
      tip,
    };
  },

  getThreeBucketOverview: () => {
    const { totalIncome, totalExpense } = get().getTotals();
    const categoryStatuses = get().getCategoryBudgetStatus();
    const now = new Date();
    const dayOfMonth = now.getDate();
    const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysRemaining = Math.max(1, totalDaysInMonth - dayOfMonth + 1);

    const fixedCategories = categoryStatuses.filter(
      (c) => (CATEGORY_BUCKET_MAP[c.category.id] || 'FLEXIBLE') === 'FIXED'
    );
    const flexibleCategories = categoryStatuses.filter(
      (c) => (CATEGORY_BUCKET_MAP[c.category.id] || 'FLEXIBLE') === 'FLEXIBLE'
    );

    // 1. Fixed Commitments Bucket
    const fixedBudget = fixedCategories.reduce((sum, c) => sum + c.budget, 0);
    const fixedSpent = fixedCategories.reduce((sum, c) => sum + c.spent, 0);
    const fixedSummary: BucketSummary = {
      type: 'FIXED',
      label: 'Fixed Commitments',
      totalBudget: fixedBudget,
      totalSpent: fixedSpent,
      remaining: Math.max(0, fixedBudget - fixedSpent),
      percentage: fixedBudget > 0 ? Math.min(100, Math.round((fixedSpent / fixedBudget) * 100)) : 0,
      categories: fixedCategories,
    };

    // 2. Dedicated Savings Bucket (20% of Income target or actual net positive cashflow)
    const plannedSavings = Math.max(0, Math.round((totalIncome || get().monthlyBudget) * 0.2));
    const actualSavingsTransferred = Math.max(0, totalIncome - totalExpense);
    const savingsSummary: BucketSummary = {
      type: 'SAVINGS',
      label: 'Dedicated Vaults',
      totalBudget: plannedSavings,
      totalSpent: Math.min(plannedSavings, actualSavingsTransferred),
      remaining: Math.max(0, plannedSavings - actualSavingsTransferred),
      percentage: plannedSavings > 0 ? Math.min(100, Math.round((actualSavingsTransferred / plannedSavings) * 100)) : 100,
      categories: [],
    };

    // 3. Flexible Spending Bucket
    const flexBudget = flexibleCategories.reduce((sum, c) => sum + c.budget, 0);
    const flexSpent = flexibleCategories.reduce((sum, c) => sum + c.spent, 0);
    const flexSummary: BucketSummary = {
      type: 'FLEXIBLE',
      label: 'Flexible Daily Spend',
      totalBudget: flexBudget,
      totalSpent: flexSpent,
      remaining: flexBudget - flexSpent,
      percentage: flexBudget > 0 ? Math.min(100, Math.round((flexSpent / flexBudget) * 100)) : 0,
      categories: flexibleCategories,
    };

    // Available to Spend: Remaining in Flexible Envelopes
    const remainingFlexPool = Math.max(0, flexBudget - flexSpent);
    const safeDailyTarget = Math.max(0, Math.floor(remainingFlexPool / daysRemaining));

    let paceStatus: 'ON_TRACK' | 'TIGHT' | 'ZERO_BURN' = 'ON_TRACK';
    if (remainingFlexPool <= 0) {
      paceStatus = 'ZERO_BURN';
    } else {
      const expectedBurnPerDay = flexBudget / totalDaysInMonth;
      if (safeDailyTarget < expectedBurnPerDay * 0.7) {
        paceStatus = 'TIGHT';
      }
    }

    return {
      totalInflow: totalIncome,
      totalOutflow: totalExpense,
      fixedCommitments: fixedSummary,
      dedicatedSavings: savingsSummary,
      flexibleSpending: flexSummary,
      availableToSpend: remainingFlexPool,
      safeDailyTarget,
      daysRemaining,
      paceStatus,
    };
  },

  autoBalanceFlexibleEnvelopes: async () => {
    const categoryBudgets = { ...get().categoryBudgets };
    const categoryStatuses = get().getCategoryBudgetStatus();
    const flexibleCategories = categoryStatuses.filter(
      (c) => (CATEGORY_BUCKET_MAP[c.category.id] || 'FLEXIBLE') === 'FLEXIBLE'
    );

    const totalFlexBudget = flexibleCategories.reduce((sum, c) => sum + c.budget, 0);
    const totalFlexSpent = flexibleCategories.reduce((sum, c) => sum + c.spent, 0);
    const unspentFlex = Math.max(0, totalFlexBudget - totalFlexSpent);

    if (flexibleCategories.length > 0 && unspentFlex > 0) {
      const perCategoryShare = Math.floor(unspentFlex / flexibleCategories.length / 500) * 500;
      flexibleCategories.forEach((c) => {
        categoryBudgets[c.category.id] = c.spent + Math.max(500, perCategoryShare);
      });
      await get().setAllCategoryBudgets(categoryBudgets);
    }
  },

  rebalanceEnvelopes: async (fromCatId: string, toCatId: string, amount: number) => {
    if (amount <= 0 || fromCatId === toCatId) return;
    const current = { ...get().categoryBudgets };
    const fromBudget = current[fromCatId] ?? DEFAULT_CATEGORY_BUDGETS[fromCatId] ?? 0;
    const toBudget = current[toCatId] ?? DEFAULT_CATEGORY_BUDGETS[toCatId] ?? 0;

    const transfer = Math.min(fromBudget, amount);
    current[fromCatId] = Math.max(0, fromBudget - transfer);
    current[toCatId] = toBudget + transfer;

    await get().setAllCategoryBudgets(current);
  },

  getSuggestedRebalances: () => {
    const statuses = get().getCategoryBudgetStatus();
    const deficits = statuses.filter((s) => s.status === 'OVERBUDGET' && s.overAmount > 0);
    const surpluses = statuses
      .filter((s) => s.status === 'SAFE' && s.remaining > 500)
      .sort((a, b) => b.remaining - a.remaining);

    const suggestions: {
      deficitCatId: string;
      deficitAmount: number;
      surplusCatId: string;
      surplusAvailable: number;
    }[] = [];

    deficits.forEach((def) => {
      const bestSurplus = surpluses.find((sur) => sur.remaining >= 500);
      if (bestSurplus) {
        suggestions.push({
          deficitCatId: def.category.id,
          deficitAmount: def.overAmount,
          surplusCatId: bestSurplus.category.id,
          surplusAvailable: bestSurplus.remaining,
        });
      }
    });

    return suggestions;
  },

  autoFitUnallocatedBuffer: async () => {
    const { monthlyBudget } = get();
    const current = { ...get().categoryBudgets };
    const totalAllocated = Object.values(current).reduce((sum, v) => sum + (v || 0), 0);
    const unallocated = monthlyBudget - totalAllocated;

    if (unallocated > 0) {
      const flexibleStatuses = get()
        .getCategoryBudgetStatus()
        .filter((c) => (CATEGORY_BUCKET_MAP[c.category.id] || 'FLEXIBLE') === 'FLEXIBLE');

      if (flexibleStatuses.length > 0) {
        const share = Math.floor(unallocated / flexibleStatuses.length / 100) * 100;
        if (share > 0) {
          flexibleStatuses.forEach((c) => {
            current[c.category.id] = (current[c.category.id] || 0) + share;
          });
          await get().setAllCategoryBudgets(current);
        }
      }
    }
  },
}));
