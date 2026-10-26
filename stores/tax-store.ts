import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  IncomeSourceInputs,
  InvestmentRebateInputs,
  TaxCalculationResult,
  TaxProfile,
  TaxRegion,
  TaxSlabBreakdown,
  TaxpayerCategory,
} from '@/types/tax';
import { useInvestmentStore } from '@/stores/investment-store';

const TAX_STORAGE_KEY = 'vital_tax_profile_vault_v1';

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

// Bangladesh Tax Law Constants (Finance Act 2024-2025)
export const TAX_FREE_LIMITS: Record<TaxpayerCategory, { label: string; limit: number }> = {
  GENERAL_MALE: { label: 'সাধারণ করদাতা (পুরুষ)', limit: 350000 },
  FEMALE_SENIOR_65: { label: 'মহিলা ও ৬৫+ বছর বয়স্ক করদাতা', limit: 400000 },
  PHYSICALLY_CHALLENGED: { label: 'প্রতিবন্ধী ব্যক্তি / তৃতীয় লিঙ্গ', limit: 475000 },
  FREEDOM_FIGHTER: { label: 'গেজেটভুক্ত যুদ্ধাহত বীর মুক্তিযোদ্ধা', limit: 500000 },
};

export const MINIMUM_TAX_RATES: Record<TaxRegion, { label: string; amount: number }> = {
  DHAKA_CHATTOGRAM_CITY: { label: 'ঢাকা ও চট্টগ্রাম সিটি কর্পোরেশন', amount: 5000 },
  OTHER_CITY_CORP: { label: 'অন্যান্য সিটি কর্পোরেশন', amount: 4000 },
  NON_CITY_MUNICIPAL: { label: 'সিটি কর্পোরেশন বহির্ভূত পৌরসভা / অন্যান্য এলাকা', amount: 3000 },
};

export const DEFAULT_INCOMES: IncomeSourceInputs = {
  monthlyBasicSalary: 60000,
  monthlyHouseRent: 25000,
  monthlyMedicalAllowance: 5000,
  monthlyConveyance: 5000,
  festivalBonuses: 120000, // 2 Eid bonuses (1 basic each)
  otherSalaryAllowance: 0,
  businessFreelanceAnnual: 0,
  housePropertyAnnual: 0,
  bankInterestAnnual: 15000,
  otherIncomeAnnual: 0,
};

export const DEFAULT_INVESTMENTS: InvestmentRebateInputs = {
  dpsAnnual: 120000, // ৳10,000/mo
  sanchayPatraAnnual: 200000,
  stockMarketAnnual: 50000,
  lifeInsurancePremium: 30000,
  providentFundGpf: 60000,
  otherApprovedInvestments: 0,
};

export const DEFAULT_PROFILE: TaxProfile = {
  taxpayerCategory: 'GENERAL_MALE',
  hasDisabledChild: false,
  region: 'DHAKA_CHATTOGRAM_CITY',
  incomes: DEFAULT_INCOMES,
  investments: DEFAULT_INVESTMENTS,
  autoSyncFromVault: true,
  updatedAt: Date.now(),
};

// Pure Calculation Engine
export function computeBangladeshTax(profile: TaxProfile): TaxCalculationResult {
  const { taxpayerCategory, hasDisabledChild, region, incomes, investments } = profile;

  // 1. Gross Annual Salary
  const monthlyGross =
    incomes.monthlyBasicSalary +
    incomes.monthlyHouseRent +
    incomes.monthlyMedicalAllowance +
    incomes.monthlyConveyance;

  const grossAnnualSalary =
    monthlyGross * 12 + incomes.festivalBonuses + incomes.otherSalaryAllowance;

  // Salary exemption rule: Lower of 1/3 of salary or ৳4,50,000 (Income Tax Act 2023)
  const salaryExemptAmount = Math.min(Math.round(grossAnnualSalary / 3), 450000);
  const taxableSalary = Math.max(0, grossAnnualSalary - salaryExemptAmount);

  // 2. Other Incomes
  const totalOtherTaxableIncome =
    incomes.businessFreelanceAnnual +
    incomes.housePropertyAnnual +
    incomes.bankInterestAnnual +
    incomes.otherIncomeAnnual;

  const totalTaxableIncome = taxableSalary + totalOtherTaxableIncome;

  // 3. Tax-Free Limit
  let taxFreeLimit = TAX_FREE_LIMITS[taxpayerCategory]?.limit || 350000;
  if (hasDisabledChild) {
    taxFreeLimit += 50000; // Extra ৳50,000 limit for parents of disabled child
  }

  // 4. Progressive Slabs
  const slabs: TaxSlabBreakdown[] = [];
  let remainingIncome = totalTaxableIncome;
  let grossTaxLiability = 0;

  // Slab 1: Tax-Free (0%)
  const inSlab1 = Math.min(remainingIncome, taxFreeLimit);
  slabs.push({
    slabLabel: `First ৳${(taxFreeLimit / 100000).toFixed(1)}L (Tax Free)`,
    slabRate: 0,
    taxableAmountInSlab: inSlab1,
    taxForSlab: 0,
  });
  remainingIncome = Math.max(0, remainingIncome - inSlab1);

  // Slab 2: Next ৳1,00,000 (5%)
  if (remainingIncome > 0) {
    const inSlab2 = Math.min(remainingIncome, 100000);
    const tax2 = Math.round(inSlab2 * 0.05);
    slabs.push({
      slabLabel: 'Next ৳1,00,000 (5%)',
      slabRate: 5,
      taxableAmountInSlab: inSlab2,
      taxForSlab: tax2,
    });
    grossTaxLiability += tax2;
    remainingIncome = Math.max(0, remainingIncome - inSlab2);
  }

  // Slab 3: Next ৳4,00,000 (10%)
  if (remainingIncome > 0) {
    const inSlab3 = Math.min(remainingIncome, 400000);
    const tax3 = Math.round(inSlab3 * 0.1);
    slabs.push({
      slabLabel: 'Next ৳4,00,000 (10%)',
      slabRate: 10,
      taxableAmountInSlab: inSlab3,
      taxForSlab: tax3,
    });
    grossTaxLiability += tax3;
    remainingIncome = Math.max(0, remainingIncome - inSlab3);
  }

  // Slab 4: Next ৳5,00,000 (15%)
  if (remainingIncome > 0) {
    const inSlab4 = Math.min(remainingIncome, 500000);
    const tax4 = Math.round(inSlab4 * 0.15);
    slabs.push({
      slabLabel: 'Next ৳5,00,000 (15%)',
      slabRate: 15,
      taxableAmountInSlab: inSlab4,
      taxForSlab: tax4,
    });
    grossTaxLiability += tax4;
    remainingIncome = Math.max(0, remainingIncome - inSlab4);
  }

  // Slab 5: Next ৳5,00,000 (20%)
  if (remainingIncome > 0) {
    const inSlab5 = Math.min(remainingIncome, 500000);
    const tax5 = Math.round(inSlab5 * 0.2);
    slabs.push({
      slabLabel: 'Next ৳5,00,000 (20%)',
      slabRate: 20,
      taxableAmountInSlab: inSlab5,
      taxForSlab: tax5,
    });
    grossTaxLiability += tax5;
    remainingIncome = Math.max(0, remainingIncome - inSlab5);
  }

  // Slab 6: Balance / Remaining (25%)
  if (remainingIncome > 0) {
    const tax6 = Math.round(remainingIncome * 0.25);
    slabs.push({
      slabLabel: 'Remaining Balance (25%)',
      slabRate: 25,
      taxableAmountInSlab: remainingIncome,
      taxForSlab: tax6,
    });
    grossTaxLiability += tax6;
    remainingIncome = 0;
  }

  // 5. Investment Tax Rebate (৩য় তফসিল কর রেয়াত)
  // Actual eligible investment (DPS capped at ৳1.2L as per law)
  const actualDps = Math.min(investments.dpsAnnual, 120000);
  const actualInvestmentTotal =
    actualDps +
    investments.sanchayPatraAnnual +
    investments.stockMarketAnnual +
    investments.lifeInsurancePremium +
    investments.providentFundGpf +
    investments.otherApprovedInvestments;

  // Allowable investment ceiling: Lower of Actual, 20% of Taxable income, or ৳10,00,000
  const maxAllowableByIncome = Math.round(totalTaxableIncome * 0.2);
  const allowableInvestmentCeiling = Math.min(maxAllowableByIncome, 1000000);
  const eligibleForRebate = Math.min(actualInvestmentTotal, allowableInvestmentCeiling);

  // 15% Rebate on allowable investment
  const rawRebate = Math.round(eligibleForRebate * 0.15);
  const taxRebateAmount = Math.min(rawRebate, grossTaxLiability);
  const maxPossibleRebate = Math.round(allowableInvestmentCeiling * 0.15);
  const optimalInvestmentGap = Math.max(0, allowableInvestmentCeiling - actualInvestmentTotal);

  // 6. Minimum Tax & Net Payable
  const minTaxObj = MINIMUM_TAX_RATES[region] || MINIMUM_TAX_RATES.DHAKA_CHATTOGRAM_CITY;
  const minimumTax = minTaxObj.amount;

  let netTaxPayable = 0;
  if (totalTaxableIncome > taxFreeLimit) {
    const afterRebate = Math.max(0, grossTaxLiability - taxRebateAmount);
    netTaxPayable = Math.max(minimumTax, afterRebate);
  }

  const monthlyTdsRecommended = Math.round(netTaxPayable / 12);
  const effectiveTaxRate =
    totalTaxableIncome > 0 ? Math.round((netTaxPayable / totalTaxableIncome) * 1000) / 10 : 0;

  return {
    grossAnnualSalary,
    salaryExemptAmount,
    taxableSalary,
    totalOtherTaxableIncome,
    totalTaxableIncome,
    taxpayerCategory,
    taxFreeLimit,
    grossTaxLiability,
    slabs,
    actualInvestmentTotal,
    allowableInvestmentCeiling,
    taxRebateAmount,
    maxPossibleRebate,
    optimalInvestmentGap,
    minimumTax,
    netTaxPayable,
    monthlyTdsRecommended,
    effectiveTaxRate,
  };
}

interface TaxState {
  profile: TaxProfile;
  isLoading: boolean;

  // Lifecycle
  loadData: () => Promise<void>;
  updateProfile: (updates: Partial<TaxProfile>) => Promise<void>;
  updateIncomes: (incomes: Partial<IncomeSourceInputs>) => Promise<void>;
  updateInvestments: (investments: Partial<InvestmentRebateInputs>) => Promise<void>;
  syncWithInvestmentVault: () => void;

  // Analytics
  calculateTax: () => TaxCalculationResult;
}

export const useTaxStore = create<TaxState>((set, get) => ({
  profile: DEFAULT_PROFILE,
  isLoading: false,

  loadData: async () => {
    try {
      set({ isLoading: true });
      const raw = await getStorageItem(TAX_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as TaxProfile;
        set({ profile: parsed, isLoading: false });
      } else {
        await setStorageItem(TAX_STORAGE_KEY, JSON.stringify(DEFAULT_PROFILE));
        set({ profile: DEFAULT_PROFILE, isLoading: false });
      }

      // Auto sync with investment store if enabled
      get().syncWithInvestmentVault();
    } catch (err) {
      console.warn('Failed to load tax profile:', err);
      set({ profile: DEFAULT_PROFILE, isLoading: false });
    }
  },

  updateProfile: async (updates) => {
    const updated = {
      ...get().profile,
      ...updates,
      updatedAt: Date.now(),
    };
    set({ profile: updated });
    await setStorageItem(TAX_STORAGE_KEY, JSON.stringify(updated));
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },

  updateIncomes: async (incomesUpdate) => {
    const current = get().profile;
    const updated: TaxProfile = {
      ...current,
      incomes: { ...current.incomes, ...incomesUpdate },
      updatedAt: Date.now(),
    };
    set({ profile: updated });
    await setStorageItem(TAX_STORAGE_KEY, JSON.stringify(updated));
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },

  updateInvestments: async (invUpdate) => {
    const current = get().profile;
    const updated: TaxProfile = {
      ...current,
      investments: { ...current.investments, ...invUpdate },
      updatedAt: Date.now(),
    };
    set({ profile: updated });
    await setStorageItem(TAX_STORAGE_KEY, JSON.stringify(updated));
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },

  syncWithInvestmentVault: () => {
    try {
      const investments = useInvestmentStore.getState().investments;
      let dpsTotal = 0;
      let sanchayTotal = 0;
      let stocksTotal = 0;

      investments.forEach((inv) => {
        if (inv.status === 'ACTIVE') {
          if (inv.category === 'DPS') {
            dpsTotal += (inv.monthlyDeposit || 0) * 12;
          } else if (inv.category === 'SANCHAY_PATRA') {
            sanchayTotal += inv.purchaseAmount || 0;
          } else if (inv.category === 'STOCKS') {
            stocksTotal += inv.purchaseAmount || 0;
          }
        }
      });

      if (dpsTotal > 0 || sanchayTotal > 0 || stocksTotal > 0) {
        const current = get().profile;
        const updated: TaxProfile = {
          ...current,
          investments: {
            ...current.investments,
            dpsAnnual: dpsTotal > 0 ? dpsTotal : current.investments.dpsAnnual,
            sanchayPatraAnnual: sanchayTotal > 0 ? sanchayTotal : current.investments.sanchayPatraAnnual,
            stockMarketAnnual: stocksTotal > 0 ? stocksTotal : current.investments.stockMarketAnnual,
          },
        };
        set({ profile: updated });
      }
    } catch (e) {
      console.warn('Failed to auto-sync investment vault into tax profile:', e);
    }
  },

  calculateTax: () => {
    return computeBangladeshTax(get().profile);
  },
}));
