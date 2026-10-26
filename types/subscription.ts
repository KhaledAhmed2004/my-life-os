export type BillingCycle = 'MONTHLY' | 'YEARLY' | 'WEEKLY';

export type SubscriptionCategory =
  | 'FITNESS'
  | 'STREAMING'
  | 'HOUSING'
  | 'UTILITIES'
  | 'SOFTWARE'
  | 'COMMUTE'
  | 'EDUCATION'
  | 'OTHER';

export interface Subscription {
  id: string;
  name: string;
  icon: string;
  amount: number;
  category: SubscriptionCategory;
  billingCycle: BillingCycle;
  dueDay: number; // Day of the month (1-31)
  autoLog: boolean;
  notes?: string;
  color: string;
  lastPaidMonth?: string; // Format: 'YYYY-MM'
  createdAt: number;
  updatedAt: number;
}

export interface SubscriptionSummary {
  totalMonthlyCommitment: number;
  totalAnnualCommitment: number;
  activeCount: number;
  paidThisMonthCount: number;
  upcomingThisWeekCount: number;
}
