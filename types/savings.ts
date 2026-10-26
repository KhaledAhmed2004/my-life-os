export type SavingsCategory =
  | 'EMERGENCY'
  | 'TRAVEL'
  | 'GADGETS'
  | 'VEHICLE'
  | 'FITNESS'
  | 'INVESTMENT'
  | 'GENERAL';

export interface SavingsTransaction {
  id: string;
  goalId: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAW';
  note?: string;
  date: string; // ISO date string (YYYY-MM-DD)
  createdAt: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  icon: string; // Emoji e.g. 🛡️, 🚗, ✈️, 💻, 🏋️
  targetAmount: number;
  currentAmount: number;
  targetDate?: string; // ISO date string (YYYY-MM-DD)
  color: string; // Hex color for theme
  category: SavingsCategory;
  notes?: string;
  isCompleted: boolean;
  createdAt: number;
  updatedAt: number;
  history: SavingsTransaction[];
}

export interface SavingsPortfolioStats {
  totalSaved: number;
  totalTarget: number;
  overallPercentage: number;
  activeCount: number;
  completedCount: number;
  monthlyGrowth: number;
}

export interface SavingsPreset {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  defaultTarget: number;
  category: SavingsCategory;
  color: string;
  durationMonths: number;
}
