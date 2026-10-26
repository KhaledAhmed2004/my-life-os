import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  CompoundingFrequency,
  InvestmentCategory,
  InvestmentCategoryStat,
  InvestmentItem,
  InvestmentStats,
  InvestmentStatus,
  MaturityProjection,
  SanchayPatraSubtype,
} from '@/types/investment';

const INVESTMENTS_STORAGE_KEY = 'vital_investments_vault_v1';

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

// Bangladesh Government Sanchay Patra Official Rates
export const SANCHAY_PATRA_RATES: Record<SanchayPatraSubtype, { label: string; rate: number; defaultMonths: number; payout: string }> = {
  THREE_YEAR: {
    label: '৩ বছর মেয়াদী সঞ্চয়পত্র',
    rate: 11.28,
    defaultMonths: 36,
    payout: 'প্রতি ৩ মাস অন্তর মুনাফা',
  },
  FIVE_YEAR: {
    label: '৫ বছর মেয়াদী বাংলাদেশ সঞ্চয়পত্র',
    rate: 11.76,
    defaultMonths: 60,
    payout: 'মেয়াদান্তে এককালীন মুনাফা',
  },
  PARIBAR: {
    label: 'পরিবার সঞ্চয়পত্র (Family Savings)',
    rate: 11.52,
    defaultMonths: 60,
    payout: 'মাসিক কিস্তিতে মুনাফা',
  },
  PENSIONERS: {
    label: 'পেনশনার সঞ্চয়পত্র (Pensioners)',
    rate: 11.76,
    defaultMonths: 60,
    payout: 'প্রতি ৩ মাস অন্তর মুনাফা',
  },
};

// Math Engine Helpers
export function calculateFDMaturity(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  frequency: CompoundingFrequency = 'QUARTERLY'
): MaturityProjection {
  let timesPerYear = 4;
  if (frequency === 'MONTHLY') timesPerYear = 12;
  else if (frequency === 'HALF_YEARLY') timesPerYear = 2;
  else if (frequency === 'YEARLY') timesPerYear = 1;

  const r = annualRate / 100 / timesPerYear;
  const n = (tenureMonths / 12) * timesPerYear;
  const maturityAmount = Math.round(principal * Math.pow(1 + r, n));
  const totalInterest = Math.max(0, maturityAmount - principal);

  return {
    maturityDate: Date.now() + tenureMonths * 30.4375 * 24 * 60 * 60 * 1000,
    maturityAmount,
    totalInterest,
    annualYield: annualRate,
  };
}

export function calculateDPSMaturity(
  monthlyDeposit: number,
  tenureMonths: number,
  annualRate: number = 8.5
): MaturityProjection {
  const totalPrincipal = monthlyDeposit * tenureMonths;
  // Standard banker recurring deposit interest formula: M * r * T(T+1) / 2400
  const interest = Math.round(
    (monthlyDeposit * annualRate * tenureMonths * (tenureMonths + 1)) / 2400
  );
  const maturityAmount = totalPrincipal + interest;

  return {
    maturityDate: Date.now() + tenureMonths * 30.4375 * 24 * 60 * 60 * 1000,
    maturityAmount,
    totalInterest: interest,
    annualYield: annualRate,
  };
}

export function calculateSanchayPatraMaturity(
  subtype: SanchayPatraSubtype,
  principal: number,
  tenureMonths?: number
): MaturityProjection {
  const meta = SANCHAY_PATRA_RATES[subtype] || SANCHAY_PATRA_RATES.FIVE_YEAR;
  const months = tenureMonths || meta.defaultMonths;
  const annual = meta.rate / 100;
  const totalInterest = Math.round(principal * annual * (months / 12));
  const maturityAmount = principal + totalInterest;

  return {
    maturityDate: Date.now() + months * 30.4375 * 24 * 60 * 60 * 1000,
    maturityAmount,
    totalInterest,
    annualYield: meta.rate,
  };
}

export function calculateStockValue(buyPrice: number, currentPrice: number, qty: number) {
  const invested = buyPrice * qty;
  const currentValue = currentPrice * qty;
  const pnl = currentValue - invested;
  const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;
  return { invested, currentValue, pnl, pnlPercent };
}

// Seed initial portfolio for a rich first-run experience
const SEED_INVESTMENTS: InvestmentItem[] = [
  {
    id: 'inv-sanchay-01',
    name: '৫ বছর মেয়াদী পরিবার সঞ্চয়পত্র',
    category: 'SANCHAY_PATRA',
    sanchaySubtype: 'PARIBAR',
    institution: 'National Savings Directorate',
    status: 'ACTIVE',
    startDate: Date.now() - 180 * 24 * 60 * 60 * 1000, // 6 months ago
    maturityDate: Date.now() + (60 - 6) * 30.4375 * 24 * 60 * 60 * 1000,
    tenureMonths: 60,
    purchaseAmount: 500000,
    currentValue: 528800,
    interestRate: 11.52,
    notes: 'Govt backed risk-free family investment scheme.',
    createdAt: Date.now() - 180 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
  },
  {
    id: 'inv-dps-02',
    name: 'BRAC Bank 5-Year High Growth DPS',
    category: 'DPS',
    institution: 'BRAC Bank PLC',
    status: 'ACTIVE',
    startDate: Date.now() - 365 * 24 * 60 * 60 * 1000, // 1 year ago
    maturityDate: Date.now() + 48 * 30.4375 * 24 * 60 * 60 * 1000,
    tenureMonths: 60,
    monthlyDeposit: 10000,
    purchaseAmount: 120000, // 12 months deposited
    currentValue: 126500,
    interestRate: 8.5,
    notes: 'Auto-debited on 5th of every month from salary account.',
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
  },
  {
    id: 'inv-fd-03',
    name: 'IDLC 1-Year Fixed Deposit',
    category: 'FIXED_DEPOSIT',
    institution: 'IDLC Finance',
    status: 'ACTIVE',
    startDate: Date.now() - 120 * 24 * 60 * 60 * 1000,
    maturityDate: Date.now() + 245 * 24 * 60 * 60 * 1000,
    tenureMonths: 12,
    compoundingFrequency: 'QUARTERLY',
    purchaseAmount: 200000,
    currentValue: 207200,
    interestRate: 9.5,
    notes: 'Quarterly compounding fixed deposit.',
    createdAt: Date.now() - 120 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
  },
  {
    id: 'inv-stock-04',
    name: 'Grameenphone (GP)',
    category: 'STOCKS',
    institution: 'Dhaka Stock Exchange (DSE)',
    tickerSymbol: 'GP',
    status: 'ACTIVE',
    startDate: Date.now() - 90 * 24 * 60 * 60 * 1000,
    purchaseAmount: 140000,
    currentValue: 154000,
    buyPrice: 280,
    currentPrice: 308,
    quantity: 500,
    notes: 'Blue chip telecom dividend stock on DSE.',
    createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
  },
];

interface InvestmentState {
  investments: InvestmentItem[];
  isLoading: boolean;

  // Lifecycle
  loadData: () => Promise<void>;
  addInvestment: (
    item: Omit<InvestmentItem, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<InvestmentItem>;
  updateInvestment: (
    id: string,
    updates: Partial<InvestmentItem>
  ) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  updateCurrentPrice: (
    id: string,
    newPrice: number
  ) => Promise<void>;
  markStatus: (
    id: string,
    status: InvestmentStatus
  ) => Promise<void>;

  // Analytics & Stats
  getStats: () => InvestmentStats;
  getMaturityProjection: (item: InvestmentItem) => MaturityProjection;
}

export const useInvestmentStore = create<InvestmentState>((set, get) => ({
  investments: [],
  isLoading: false,

  loadData: async () => {
    try {
      set({ isLoading: true });
      const raw = await getStorageItem(INVESTMENTS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as InvestmentItem[];
        set({ investments: parsed, isLoading: false });
      } else {
        await setStorageItem(INVESTMENTS_STORAGE_KEY, JSON.stringify(SEED_INVESTMENTS));
        set({ investments: SEED_INVESTMENTS, isLoading: false });
      }
    } catch (err) {
      console.warn('Failed to load investments, fallback to seed:', err);
      set({ investments: SEED_INVESTMENTS, isLoading: false });
    }
  },

  addInvestment: async (itemData) => {
    const newItem: InvestmentItem = {
      ...itemData,
      id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updated = [newItem, ...get().investments];
    set({ investments: updated });
    await setStorageItem(INVESTMENTS_STORAGE_KEY, JSON.stringify(updated));

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    return newItem;
  },

  updateInvestment: async (id, updates) => {
    const updated = get().investments.map((inv) => {
      if (inv.id !== id) return inv;
      return {
        ...inv,
        ...updates,
        updatedAt: Date.now(),
      };
    });

    set({ investments: updated });
    await setStorageItem(INVESTMENTS_STORAGE_KEY, JSON.stringify(updated));
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },

  deleteInvestment: async (id) => {
    const updated = get().investments.filter((inv) => inv.id !== id);
    set({ investments: updated });
    await setStorageItem(INVESTMENTS_STORAGE_KEY, JSON.stringify(updated));
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  },

  updateCurrentPrice: async (id, newPrice) => {
    const updated = get().investments.map((inv) => {
      if (inv.id !== id) return inv;
      const qty = inv.quantity || 1;
      const newCurrentValue = Math.round(newPrice * qty);
      return {
        ...inv,
        currentPrice: newPrice,
        currentValue: newCurrentValue,
        updatedAt: Date.now(),
      };
    });

    set({ investments: updated });
    await setStorageItem(INVESTMENTS_STORAGE_KEY, JSON.stringify(updated));
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },

  markStatus: async (id, status) => {
    const updated = get().investments.map((inv) => {
      if (inv.id !== id) return inv;
      return {
        ...inv,
        status,
        updatedAt: Date.now(),
      };
    });

    set({ investments: updated });
    await setStorageItem(INVESTMENTS_STORAGE_KEY, JSON.stringify(updated));
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },

  getMaturityProjection: (item: InvestmentItem): MaturityProjection => {
    if (item.category === 'SANCHAY_PATRA') {
      return calculateSanchayPatraMaturity(
        item.sanchaySubtype || 'FIVE_YEAR',
        item.purchaseAmount,
        item.tenureMonths
      );
    }
    if (item.category === 'DPS') {
      return calculateDPSMaturity(
        item.monthlyDeposit || item.purchaseAmount / (item.tenureMonths || 60),
        item.tenureMonths || 60,
        item.interestRate || 8.5
      );
    }
    if (item.category === 'FIXED_DEPOSIT') {
      return calculateFDMaturity(
        item.purchaseAmount,
        item.interestRate || 9.0,
        item.tenureMonths || 12,
        item.compoundingFrequency || 'QUARTERLY'
      );
    }

    // Default fallback
    return {
      maturityDate: item.maturityDate || Date.now(),
      maturityAmount: item.currentValue,
      totalInterest: Math.max(0, item.currentValue - item.purchaseAmount),
      annualYield: item.interestRate || 0,
    };
  },

  getStats: (): InvestmentStats => {
    const items = get().investments;
    let totalInvested = 0;
    let currentMarketValue = 0;
    let totalInterestProjected = 0;
    let activeCount = 0;
    let maturedCount = 0;

    const catMap: Record<InvestmentCategory, { invested: number; current: number; count: number }> = {
      DPS: { invested: 0, current: 0, count: 0 },
      FIXED_DEPOSIT: { invested: 0, current: 0, count: 0 },
      SANCHAY_PATRA: { invested: 0, current: 0, count: 0 },
      STOCKS: { invested: 0, current: 0, count: 0 },
      MUTUAL_FUND: { invested: 0, current: 0, count: 0 },
      CRYPTO: { invested: 0, current: 0, count: 0 },
      US_BONDS: { invested: 0, current: 0, count: 0 },
      OTHER: { invested: 0, current: 0, count: 0 },
    };

    let nextMaturing: {
      id: string;
      name: string;
      date: number;
      daysLeft: number;
      amount: number;
    } | null = null;
    const now = Date.now();

    for (const item of items) {
      if (item.status === 'ACTIVE') {
        activeCount++;
        totalInvested += item.purchaseAmount;
        currentMarketValue += item.currentValue;

        const catData = catMap[item.category] || catMap.OTHER;
        catData.invested += item.purchaseAmount;
        catData.current += item.currentValue;
        catData.count += 1;

        if (item.maturityDate && item.maturityDate > now) {
          const daysLeft = Math.ceil((item.maturityDate - now) / (1000 * 60 * 60 * 24));
          if (!nextMaturing || item.maturityDate < nextMaturing.date) {
            nextMaturing = {
              id: item.id,
              name: item.name,
              date: item.maturityDate,
              daysLeft,
              amount: item.currentValue,
            };
          }
        }

        if (item.category === 'DPS' || item.category === 'FIXED_DEPOSIT' || item.category === 'SANCHAY_PATRA') {
          const proj = get().getMaturityProjection(item);
          totalInterestProjected += proj.totalInterest;
        }
      } else if (item.status === 'MATURED') {
        maturedCount++;
      }
    }

    const totalPnL = currentMarketValue - totalInvested;
    const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

    const categoryBreakdown: InvestmentCategoryStat[] = (
      Object.keys(catMap) as InvestmentCategory[]
    )
      .filter((cat) => catMap[cat].count > 0 || catMap[cat].invested > 0)
      .map((cat) => {
        const data = catMap[cat];
        const pnl = data.current - data.invested;
        const percentage = currentMarketValue > 0 ? (data.current / currentMarketValue) * 100 : 0;
        return {
          category: cat,
          invested: data.invested,
          current: data.current,
          pnl,
          count: data.count,
          percentage: Math.round(percentage * 10) / 10,
        };
      })
      .sort((a, b) => b.current - a.current);

    return {
      totalInvested,
      currentMarketValue,
      totalPnL,
      totalPnLPercent: Math.round(totalPnLPercent * 100) / 100,
      totalInterestProjected,
      activeCount,
      maturedCount,
      categoryBreakdown,
      nextMaturingItem: nextMaturing,
    };
  },
}));
