export type TaxpayerCategory =
  | 'GENERAL_MALE'
  | 'FEMALE_SENIOR_65'
  | 'PHYSICALLY_CHALLENGED'
  | 'FREEDOM_FIGHTER';

export type TaxRegion =
  | 'DHAKA_CHATTOGRAM_CITY'
  | 'OTHER_CITY_CORP'
  | 'NON_CITY_MUNICIPAL';

export interface IncomeSourceInputs {
  monthlyBasicSalary: number;
  monthlyHouseRent: number;
  monthlyMedicalAllowance: number;
  monthlyConveyance: number;
  festivalBonuses: number; // Total yearly bonus
  otherSalaryAllowance: number;
  businessFreelanceAnnual: number;
  housePropertyAnnual: number;
  bankInterestAnnual: number;
  otherIncomeAnnual: number;
}

export interface InvestmentRebateInputs {
  dpsAnnual: number; // Max ৳1,20,000 eligible
  sanchayPatraAnnual: number; // Max ৳5,00,000
  stockMarketAnnual: number;
  lifeInsurancePremium: number;
  providentFundGpf: number;
  otherApprovedInvestments: number;
}

export interface TaxSlabBreakdown {
  slabLabel: string;
  slabRate: number; // e.g. 0, 5, 10, 15, 20, 25
  taxableAmountInSlab: number;
  taxForSlab: number;
}

export interface TaxProfile {
  taxpayerCategory: TaxpayerCategory;
  hasDisabledChild: boolean;
  region: TaxRegion;
  incomes: IncomeSourceInputs;
  investments: InvestmentRebateInputs;
  autoSyncFromVault: boolean;
  updatedAt: number;
}

export interface TaxCalculationResult {
  grossAnnualSalary: number;
  salaryExemptAmount: number;
  taxableSalary: number;
  totalOtherTaxableIncome: number;
  totalTaxableIncome: number;
  taxpayerCategory: TaxpayerCategory;
  taxFreeLimit: number;
  grossTaxLiability: number;
  slabs: TaxSlabBreakdown[];

  // Investment Rebate
  actualInvestmentTotal: number;
  allowableInvestmentCeiling: number;
  taxRebateAmount: number;
  maxPossibleRebate: number;
  optimalInvestmentGap: number; // How much more to invest to maximize 15% rebate

  // Final Settlement
  minimumTax: number;
  netTaxPayable: number;
  monthlyTdsRecommended: number;
  effectiveTaxRate: number; // in %
}
