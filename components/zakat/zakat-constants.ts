import { ZakatAssetCategory, ZakatDeductionCategory, ZakatNisabStandard } from '@/types/zakat';

export const GOLD_NISAB_GRAMS = 87.48; // 7.5 Tolas / Bhori (87.48 g)
export const SILVER_NISAB_GRAMS = 612.36; // 52.5 Tolas / Bhori (612.36 g)
export const GRAMS_PER_BHORI = 11.664; // 1 Bhori / Tola in Bangladesh

export const DEFAULT_GOLD_PRICE_PER_GRAM = 10800; // ~৳10,800 BDT per gram (approx ৳126,000 per Bhori)
export const DEFAULT_SILVER_PRICE_PER_GRAM = 180; // ~৳180 BDT per gram

export const ZAKAT_RATE = 0.025; // 2.5%

export const ZAKAT_COLORS = {
  gold: '#D4A017',
  goldLight: '#F59F00',
  goldGlow: 'rgba(212, 160, 23, 0.15)',
  goldBackground: '#1C1811',
  emerald: '#20C997',
  emeraldLight: 'rgba(32, 201, 151, 0.15)',
  coral: '#FA5252',
  coralLight: 'rgba(250, 82, 82, 0.15)',
  cardBg: '#13191C',
  tileBg: '#181F23',
  tileInner: '#20282D',
};

export interface ZakatCategoryMeta {
  key: ZakatAssetCategory | ZakatDeductionCategory;
  label: string;
  subtitle: string;
  icon: string;
  isDeduction: boolean;
  color: string;
}

export const ZAKAT_CATEGORIES_META: Record<
  ZakatAssetCategory | ZakatDeductionCategory,
  ZakatCategoryMeta
> = {
  CASH: {
    key: 'CASH',
    label: 'Cash in Hand & Bank',
    subtitle: 'Liquid wallet, checking and savings accounts',
    icon: 'account-balance-wallet',
    isDeduction: false,
    color: '#20C997',
  },
  SAVINGS_VAULTS: {
    key: 'SAVINGS_VAULTS',
    label: 'Savings Vaults',
    subtitle: 'Target goals and emergency funds in app',
    icon: 'savings',
    isDeduction: false,
    color: '#339AF0',
  },
  GOLD_JEWELRY: {
    key: 'GOLD_JEWELRY',
    label: 'Gold & Jewelry',
    subtitle: 'Bars, coins, and unworn/investment gold',
    icon: 'stars',
    isDeduction: false,
    color: '#D4A017',
  },
  SILVER: {
    key: 'SILVER',
    label: 'Silver & Silverware',
    subtitle: 'Bullion, silver coins, and ornaments',
    icon: 'lens',
    isDeduction: false,
    color: '#ADB5BD',
  },
  INVESTMENTS_STOCKS: {
    key: 'INVESTMENTS_STOCKS',
    label: 'Shares, Mutual Funds & Crypto',
    subtitle: 'Market value of tradable financial assets',
    icon: 'trending-up',
    isDeduction: false,
    color: '#7950F2',
  },
  BUSINESS_GOODS: {
    key: 'BUSINESS_GOODS',
    label: 'Business Inventory / Stock',
    subtitle: 'Goods for sale at current wholesale value',
    icon: 'storefront',
    isDeduction: false,
    color: '#FF922B',
  },
  MONEY_RECEIVABLE: {
    key: 'MONEY_RECEIVABLE',
    label: 'Money Lent (Udhaar Given)',
    subtitle: 'Expected recoverable debts from others',
    icon: 'call-made',
    isDeduction: false,
    color: '#51CF66',
  },
  OTHER_ASSET: {
    key: 'OTHER_ASSET',
    label: 'Other Zakatable Assets',
    subtitle: 'Rental income, pension payouts, etc.',
    icon: 'add-circle-outline',
    isDeduction: false,
    color: '#20C997',
  },

  // Deductions
  ACTIVE_LOANS: {
    key: 'ACTIVE_LOANS',
    label: 'Active Loan Balances',
    subtitle: 'Outstanding bank loans and EMI debt',
    icon: 'receipt-long',
    isDeduction: true,
    color: '#FA5252',
  },
  MONEY_BORROWED: {
    key: 'MONEY_BORROWED',
    label: 'Debts Owed (Udhaar Taken)',
    subtitle: 'Money borrowed from friends and family',
    icon: 'call-received',
    isDeduction: true,
    color: '#FF6B6B',
  },
  IMMEDIATE_EXPENSES: {
    key: 'IMMEDIATE_EXPENSES',
    label: 'Immediate Due Expenses',
    subtitle: 'Pending bills, rent, and staff salaries',
    icon: 'pending-actions',
    isDeduction: true,
    color: '#FFA94D',
  },
  OTHER_DEDUCTION: {
    key: 'OTHER_DEDUCTION',
    label: 'Other Deductions',
    subtitle: 'Urgent immediate liabilities',
    icon: 'remove-circle-outline',
    isDeduction: true,
    color: '#FA5252',
  },
};
