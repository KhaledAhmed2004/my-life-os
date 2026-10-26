export type LoanCategory =
  | 'HOME_LOAN'
  | 'CAR_LOAN'
  | 'PERSONAL_LOAN'
  | 'EDUCATION_LOAN'
  | 'BUSINESS_LOAN'
  | 'CREDIT_CARD_EMI'
  | 'DEVICE_FINANCING'
  | 'OTHER';

export type LoanStatus = 'ACTIVE' | 'PAID_OFF' | 'DEFAULTED';

export interface AmortizationMonth {
  monthIndex: number;
  paymentDate: number;
  emi: number;
  principal: number;
  interest: number;
  balanceRemaining: number;
}

export interface LoanPaymentLog {
  id: string;
  loanId: string;
  paymentDate: number;
  amount: number;
  principalPart: number;
  interestPart: number;
  remainingBalanceAfter: number;
  note?: string;
}

export interface LoanItem {
  id: string;
  name: string;
  lender: string;
  category: LoanCategory;
  principalAmount: number;
  interestRate: number; // Annual interest rate in percent (e.g. 9.5)
  tenureMonths: number;
  startDate: number;
  monthlyEmi: number;
  totalPayment: number;
  totalInterest: number;
  paymentsMade: number;
  totalPaidAmount: number;
  remainingBalance: number;
  nextDueDate: number;
  status: LoanStatus;
  notes?: string;
  paymentLogs: LoanPaymentLog[];
  createdAt: number;
  updatedAt: number;
}

export interface LoanStats {
  totalOutstanding: number;
  totalOriginalPrincipal: number;
  totalMonthlyEmi: number;
  activeLoansCount: number;
  totalInterestPaid: number;
  totalInterestProjected: number;
  nextEmiDueDate: number | null;
  nextEmiAmount: number;
  overallProgressPercent: number;
}

export interface EmiCalculationResult {
  monthlyEmi: number;
  totalPayment: number;
  totalInterest: number;
  principalPercentage: number;
  interestPercentage: number;
  schedule: AmortizationMonth[];
}
