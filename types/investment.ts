export type InvestmentCategory =
  | 'DPS'
  | 'FIXED_DEPOSIT'
  | 'SANCHAY_PATRA'
  | 'STOCKS'
  | 'MUTUAL_FUND'
  | 'CRYPTO'
  | 'US_BONDS'
  | 'OTHER';

export type SanchayPatraSubtype =
  | 'THREE_YEAR'
  | 'FIVE_YEAR'
  | 'PARIBAR'
  | 'PENSIONERS';

export type CompoundingFrequency =
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'HALF_YEARLY'
  | 'YEARLY';

export type InvestmentStatus = 'ACTIVE' | 'MATURED' | 'WITHDRAWN';

export interface InvestmentItem {
  id: string;
  name: string;
  category: InvestmentCategory;
  institution?: string;
  status: InvestmentStatus;
  startDate: number;
  maturityDate?: number;
  tenureMonths?: number;
  purchaseAmount: number; // Total principal or cost basis
  currentValue: number; // Current market value or accumulated balance
  interestRate?: number; // Annual rate in % (e.g. 11.76)

  // DPS fields
  monthlyDeposit?: number;
  dpsBonusRate?: number;

  // Fixed Deposit fields
  compoundingFrequency?: CompoundingFrequency;

  // Sanchay Patra fields
  sanchaySubtype?: SanchayPatraSubtype;

  // Stocks & Crypto fields
  tickerSymbol?: string;
  quantity?: number;
  buyPrice?: number;
  currentPrice?: number;

  // Metadata
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface InvestmentCategoryStat {
  category: InvestmentCategory;
  invested: number;
  current: number;
  pnl: number;
  count: number;
  percentage: number;
}

export interface InvestmentStats {
  totalInvested: number;
  currentMarketValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  totalInterestProjected: number;
  activeCount: number;
  maturedCount: number;
  categoryBreakdown: InvestmentCategoryStat[];
  nextMaturingItem: {
    id: string;
    name: string;
    date: number;
    daysLeft: number;
    amount: number;
  } | null;
}

export interface MaturityProjection {
  maturityDate: number;
  maturityAmount: number;
  totalInterest: number;
  annualYield: number;
}
