export interface NetWorthAssetBreakdown {
  cashAndLiquid: number;
  savingsVaults: number;
  warrantyAssets: number;
  otherAssets: number;
  totalAssets: number;
}

export interface NetWorthLiabilityBreakdown {
  activeLoans: number;
  borrowedDebts: number;
  monthlySubscriptionsAnnual: number;
  totalLiabilities: number;
}

export interface NetWorthSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  debtToAssetRatio: number; // in percentage
  emergencyRunwayMonths: number; // months of expense covered by liquid assets
  financialHealthStatus: 'EXCELLENT' | 'HEALTHY' | 'MODERATE' | 'VULNERABLE';
  assets: NetWorthAssetBreakdown;
  liabilities: NetWorthLiabilityBreakdown;
}
