import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  AmortizationMonth,
  EmiCalculationResult,
  LoanCategory,
  LoanItem,
  LoanPaymentLog,
  LoanStats,
  LoanStatus,
} from '@/types/loan';

const LOANS_STORAGE_KEY = 'vital_loans_vault_v1';

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

export function calculateEMI(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number,
  startDateMs: number = Date.now()
): EmiCalculationResult {
  const p = Math.max(0, principal);
  const n = Math.max(1, Math.round(tenureMonths));
  const annualRate = Math.max(0, annualInterestRate);

  if (p === 0) {
    return {
      monthlyEmi: 0,
      totalPayment: 0,
      totalInterest: 0,
      principalPercentage: 100,
      interestPercentage: 0,
      schedule: [],
    };
  }

  let monthlyEmi = 0;
  let totalPayment = 0;
  let totalInterest = 0;

  if (annualRate === 0) {
    monthlyEmi = p / n;
    totalPayment = p;
    totalInterest = 0;
  } else {
    const monthlyRate = annualRate / 12 / 100;
    const factor = Math.pow(1 + monthlyRate, n);
    monthlyEmi = (p * monthlyRate * factor) / (factor - 1);
    totalPayment = monthlyEmi * n;
    totalInterest = totalPayment - p;
  }

  // Generate month-by-month amortization schedule
  const schedule: AmortizationMonth[] = [];
  let currentBalance = p;
  const monthlyRate = annualRate / 12 / 100;

  for (let i = 1; i <= n; i++) {
    const paymentDate = new Date(startDateMs);
    paymentDate.setMonth(paymentDate.getMonth() + i);

    let interestPortion = 0;
    let principalPortion = 0;

    if (annualRate === 0) {
      principalPortion = Math.min(currentBalance, monthlyEmi);
      interestPortion = 0;
    } else {
      interestPortion = currentBalance * monthlyRate;
      principalPortion = monthlyEmi - interestPortion;
    }

    if (i === n || currentBalance - principalPortion < 0) {
      principalPortion = currentBalance;
      currentBalance = 0;
    } else {
      currentBalance = Math.max(0, currentBalance - principalPortion);
    }

    schedule.push({
      monthIndex: i,
      paymentDate: paymentDate.getTime(),
      emi: principalPortion + interestPortion,
      principal: principalPortion,
      interest: interestPortion,
      balanceRemaining: currentBalance,
    });

    if (currentBalance <= 0) break;
  }

  const principalPercentage = totalPayment > 0 ? (p / totalPayment) * 100 : 100;
  const interestPercentage = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0;

  return {
    monthlyEmi: Math.round(monthlyEmi * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    principalPercentage: Math.round(principalPercentage * 10) / 10,
    interestPercentage: Math.round(interestPercentage * 10) / 10,
    schedule,
  };
}

const SEED_LOANS: LoanItem[] = [
  {
    id: 'loan-car-01',
    name: 'Toyota Corolla Cross Financing',
    lender: 'City Bank Auto Loan',
    category: 'CAR_LOAN',
    principalAmount: 1800000,
    interestRate: 9.5,
    tenureMonths: 48,
    startDate: Date.now() - 14 * 30 * 24 * 60 * 60 * 1000, // 14 months ago
    monthlyEmi: 45214,
    totalPayment: 2170272,
    totalInterest: 370272,
    paymentsMade: 14,
    totalPaidAmount: 45214 * 14,
    remainingBalance: 1342600,
    nextDueDate: Date.now() + 16 * 24 * 60 * 60 * 1000, // in 16 days
    status: 'ACTIVE',
    notes: 'Auto-debit on 15th of every month from Salary account.',
    paymentLogs: [],
    createdAt: Date.now() - 14 * 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
  },
  {
    id: 'loan-macbook-02',
    name: 'MacBook Pro 16" M3 Max EMI',
    lender: 'Standard Chartered 0% EMI',
    category: 'DEVICE_FINANCING',
    principalAmount: 360000,
    interestRate: 0,
    tenureMonths: 12,
    startDate: Date.now() - 5 * 30 * 24 * 60 * 60 * 1000, // 5 months ago
    monthlyEmi: 30000,
    totalPayment: 360000,
    totalInterest: 0,
    paymentsMade: 5,
    totalPaidAmount: 150000,
    remainingBalance: 210000,
    nextDueDate: Date.now() + 8 * 24 * 60 * 60 * 1000, // in 8 days
    status: 'ACTIVE',
    notes: 'No cost 12-month credit card installment.',
    paymentLogs: [],
    createdAt: Date.now() - 5 * 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
  },
  {
    id: 'loan-personal-03',
    name: 'Home Renovation Support',
    lender: 'BRAC Bank Personal',
    category: 'PERSONAL_LOAN',
    principalAmount: 250000,
    interestRate: 11.0,
    tenureMonths: 24,
    startDate: Date.now() - 24 * 30 * 24 * 60 * 60 * 1000,
    monthlyEmi: 11654,
    totalPayment: 279696,
    totalInterest: 29696,
    paymentsMade: 24,
    totalPaidAmount: 279696,
    remainingBalance: 0,
    nextDueDate: Date.now(),
    status: 'PAID_OFF',
    notes: 'Fully paid off in previous year.',
    paymentLogs: [],
    createdAt: Date.now() - 24 * 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
  },
];

interface LoanState {
  loans: LoanItem[];
  isLoading: boolean;

  loadData: () => Promise<void>;
  addLoan: (
    data: Omit<
      LoanItem,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'paymentLogs'
      | 'monthlyEmi'
      | 'totalPayment'
      | 'totalInterest'
      | 'paymentsMade'
      | 'totalPaidAmount'
      | 'remainingBalance'
      | 'nextDueDate'
      | 'status'
      | 'startDate'
    > & {
      paymentsMade?: number;
      startDate?: number;
    }
  ) => Promise<LoanItem>;
  updateLoan: (id: string, updates: Partial<LoanItem>) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;
  logEmiPayment: (
    loanId: string,
    amount?: number,
    note?: string
  ) => Promise<boolean>;
  recordPrepayment: (
    loanId: string,
    lumpSumAmount: number,
    note?: string
  ) => Promise<boolean>;
  resetToDemoData: () => Promise<void>;
  clearAllData: () => Promise<void>;

  getStats: () => LoanStats;
  getAmortization: (loanId: string) => AmortizationMonth[];
}

export const useLoanStore = create<LoanState>((set, get) => ({
  loans: [],
  isLoading: true,

  loadData: async () => {
    try {
      set({ isLoading: true });
      const raw = await getStorageItem(LOANS_STORAGE_KEY);
      if (raw) {
        const parsed: LoanItem[] = JSON.parse(raw);
        set({ loans: parsed, isLoading: false });
      } else {
        await setStorageItem(LOANS_STORAGE_KEY, JSON.stringify(SEED_LOANS));
        set({ loans: SEED_LOANS, isLoading: false });
      }
    } catch {
      set({ loans: SEED_LOANS, isLoading: false });
    }
  },

  addLoan: async (data) => {
    const startDate = data.startDate || Date.now();
    const calculation = calculateEMI(
      data.principalAmount,
      data.interestRate,
      data.tenureMonths,
      startDate
    );

    const paymentsMade = data.paymentsMade || 0;
    const monthlyEmi = calculation.monthlyEmi;
    const totalPayment = calculation.totalPayment;
    const totalInterest = calculation.totalInterest;

    // Determine remaining balance based on payments already made
    let remainingBalance = data.principalAmount;
    let totalPaidAmount = 0;

    if (paymentsMade > 0 && calculation.schedule.length >= paymentsMade) {
      remainingBalance = calculation.schedule[paymentsMade - 1]?.balanceRemaining ?? 0;
      totalPaidAmount = paymentsMade * monthlyEmi;
    }

    const nextDueDate = new Date(startDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + paymentsMade + 1);

    const newLoan: LoanItem = {
      ...data,
      id: `loan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      startDate,
      monthlyEmi,
      totalPayment,
      totalInterest,
      paymentsMade,
      totalPaidAmount,
      remainingBalance,
      nextDueDate: nextDueDate.getTime(),
      status: remainingBalance <= 0 ? 'PAID_OFF' : 'ACTIVE',
      paymentLogs: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const nextLoans = [newLoan, ...get().loans];
    set({ loans: nextLoans });
    await setStorageItem(LOANS_STORAGE_KEY, JSON.stringify(nextLoans));
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    return newLoan;
  },

  updateLoan: async (id, updates) => {
    const nextLoans = get().loans.map((loan) => {
      if (loan.id !== id) return loan;

      let updated = { ...loan, ...updates, updatedAt: Date.now() };

      // Recalculate if financial parameters changed
      if (
        updates.principalAmount !== undefined ||
        updates.interestRate !== undefined ||
        updates.tenureMonths !== undefined
      ) {
        const p = updates.principalAmount ?? loan.principalAmount;
        const r = updates.interestRate ?? loan.interestRate;
        const n = updates.tenureMonths ?? loan.tenureMonths;
        const calc = calculateEMI(p, r, n, loan.startDate);
        updated = {
          ...updated,
          monthlyEmi: calc.monthlyEmi,
          totalPayment: calc.totalPayment,
          totalInterest: calc.totalInterest,
        };
      }

      return updated;
    });

    set({ loans: nextLoans });
    await setStorageItem(LOANS_STORAGE_KEY, JSON.stringify(nextLoans));
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },

  deleteLoan: async (id) => {
    const nextLoans = get().loans.filter((loan) => loan.id !== id);
    set({ loans: nextLoans });
    await setStorageItem(LOANS_STORAGE_KEY, JSON.stringify(nextLoans));
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },

  logEmiPayment: async (loanId, amount, note) => {
    const loan = get().loans.find((l) => l.id === loanId);
    if (!loan || loan.status === 'PAID_OFF') return false;

    const paymentAmount = amount || loan.monthlyEmi;
    const calculation = calculateEMI(
      loan.principalAmount,
      loan.interestRate,
      loan.tenureMonths,
      loan.startDate
    );

    const targetMonthIndex = loan.paymentsMade + 1;
    const scheduleMonth = calculation.schedule.find((s) => s.monthIndex === targetMonthIndex);

    const interestPortion = scheduleMonth ? scheduleMonth.interest : (loan.remainingBalance * (loan.interestRate / 12 / 100));
    const principalPortion = Math.max(0, paymentAmount - interestPortion);
    const newRemainingBalance = Math.max(0, loan.remainingBalance - principalPortion);

    const newPaymentLog: LoanPaymentLog = {
      id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      loanId,
      paymentDate: Date.now(),
      amount: paymentAmount,
      principalPart: Math.round(principalPortion),
      interestPart: Math.round(interestPortion),
      remainingBalanceAfter: Math.round(newRemainingBalance),
      note: note || `Month ${targetMonthIndex} EMI Payment`,
    };

    const nextDueDate = new Date(loan.nextDueDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);

    const updatedLoans = get().loans.map((l) => {
      if (l.id !== loanId) return l;
      const isPaidOff = newRemainingBalance <= 0 || targetMonthIndex >= l.tenureMonths;
      return {
        ...l,
        paymentsMade: l.paymentsMade + 1,
        totalPaidAmount: l.totalPaidAmount + paymentAmount,
        remainingBalance: Math.round(newRemainingBalance),
        nextDueDate: nextDueDate.getTime(),
        status: (isPaidOff ? 'PAID_OFF' : 'ACTIVE') as LoanStatus,
        paymentLogs: [newPaymentLog, ...l.paymentLogs],
        updatedAt: Date.now(),
      };
    });

    set({ loans: updatedLoans });
    await setStorageItem(LOANS_STORAGE_KEY, JSON.stringify(updatedLoans));
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    return true;
  },

  recordPrepayment: async (loanId, lumpSumAmount, note) => {
    const loan = get().loans.find((l) => l.id === loanId);
    if (!loan || lumpSumAmount <= 0) return false;

    const newRemaining = Math.max(0, loan.remainingBalance - lumpSumAmount);
    const log: LoanPaymentLog = {
      id: `prepay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      loanId,
      paymentDate: Date.now(),
      amount: lumpSumAmount,
      principalPart: lumpSumAmount,
      interestPart: 0,
      remainingBalanceAfter: Math.round(newRemaining),
      note: note || 'Lump-sum Principal Prepayment',
    };

    const updatedLoans = get().loans.map((l) => {
      if (l.id !== loanId) return l;
      return {
        ...l,
        remainingBalance: Math.round(newRemaining),
        totalPaidAmount: l.totalPaidAmount + lumpSumAmount,
        status: (newRemaining <= 0 ? 'PAID_OFF' : l.status) as LoanStatus,
        paymentLogs: [log, ...l.paymentLogs],
        updatedAt: Date.now(),
      };
    });

    set({ loans: updatedLoans });
    await setStorageItem(LOANS_STORAGE_KEY, JSON.stringify(updatedLoans));
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    return true;
  },

  resetToDemoData: async () => {
    await setStorageItem(LOANS_STORAGE_KEY, JSON.stringify(SEED_LOANS));
    set({ loans: SEED_LOANS });
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },

  clearAllData: async () => {
    await setStorageItem(LOANS_STORAGE_KEY, JSON.stringify([]));
    set({ loans: [] });
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
  },

  getStats: () => {
    const activeLoans = get().loans.filter((l) => l.status === 'ACTIVE');

    const totalOutstanding = activeLoans.reduce((sum, l) => sum + l.remainingBalance, 0);
    const totalOriginalPrincipal = activeLoans.reduce((sum, l) => sum + l.principalAmount, 0);
    const totalMonthlyEmi = activeLoans.reduce((sum, l) => sum + l.monthlyEmi, 0);
    const totalInterestProjected = activeLoans.reduce((sum, l) => sum + l.totalInterest, 0);
    const totalPaidAcrossAll = get().loans.reduce((sum, l) => sum + l.totalPaidAmount, 0);

    // Find nearest upcoming EMI due date
    let nextEmiDueDate: number | null = null;
    let nextEmiAmount = 0;

    const sortedByDue = [...activeLoans].sort((a, b) => a.nextDueDate - b.nextDueDate);
    if (sortedByDue.length > 0) {
      nextEmiDueDate = sortedByDue[0].nextDueDate;
      nextEmiAmount = sortedByDue[0].monthlyEmi;
    }

    const overallProgressPercent =
      totalOriginalPrincipal > 0
        ? Math.min(100, Math.max(0, ((totalOriginalPrincipal - totalOutstanding) / totalOriginalPrincipal) * 100))
        : 0;

    return {
      totalOutstanding: Math.round(totalOutstanding),
      totalOriginalPrincipal: Math.round(totalOriginalPrincipal),
      totalMonthlyEmi: Math.round(totalMonthlyEmi),
      activeLoansCount: activeLoans.length,
      totalInterestPaid: Math.round(totalPaidAcrossAll - (totalOriginalPrincipal - totalOutstanding)),
      totalInterestProjected: Math.round(totalInterestProjected),
      nextEmiDueDate,
      nextEmiAmount: Math.round(nextEmiAmount),
      overallProgressPercent: Math.round(overallProgressPercent),
    };
  },

  getAmortization: (loanId: string) => {
    const loan = get().loans.find((l) => l.id === loanId);
    if (!loan) return [];
    const calc = calculateEMI(
      loan.principalAmount,
      loan.interestRate,
      loan.tenureMonths,
      loan.startDate
    );
    return calc.schedule;
  },
}));
