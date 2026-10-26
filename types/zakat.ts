export type ZakatNisabStandard = 'GOLD' | 'SILVER';

export type ZakatAssetCategory =
  | 'CASH'
  | 'SAVINGS_VAULTS'
  | 'GOLD_JEWELRY'
  | 'SILVER'
  | 'INVESTMENTS_STOCKS'
  | 'BUSINESS_GOODS'
  | 'MONEY_RECEIVABLE'
  | 'OTHER_ASSET';

export type ZakatDeductionCategory =
  | 'ACTIVE_LOANS'
  | 'MONEY_BORROWED'
  | 'IMMEDIATE_EXPENSES'
  | 'OTHER_DEDUCTION';

export interface ZakatManualItem {
  id: string;
  name: string;
  category: ZakatAssetCategory | ZakatDeductionCategory;
  amount: number;
  isDeduction: boolean;
  isEnabled: boolean;
  weightGrams?: number;
  note?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ZakatResult {
  totalZakatableAssets: number;
  totalDeductions: number;
  netZakatableWealth: number;
  nisabThreshold: number;
  isNisabReached: boolean;
  zakatDue: number; // 2.5% of netZakatableWealth if isNisabReached is true
  nisabPercentage: number; // (netZakatableWealth / nisabThreshold) * 100
  goldPricePerGram: number;
  silverPricePerGram: number;
  nisabStandard: ZakatNisabStandard;
  hawlCompleted: boolean;
}

export interface ZakatStateData {
  goldPricePerGram: number;
  silverPricePerGram: number;
  nisabStandard: ZakatNisabStandard;
  hawlCompleted: boolean;
  includeSavingsVaults: boolean;
  includeDebtsReceivable: boolean;
  includeActiveLoans: boolean;
  includeDebtsPayable: boolean;
  manualItems: ZakatManualItem[];
  lastUpdated: number;
}
