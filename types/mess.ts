export interface MessMember {
  id: string;
  name: string;
  phone?: string;
  role: 'MANAGER' | 'MEMBER';
  totalMeals: number; // Sum of breakfast (0.5/1) + lunch + dinner + guest
  totalDeposited: number; // Sum of advance money given
  roomRentShare?: number; // Custom room rent if not equal
  notes?: string;
}

export interface MessBazaarEntry {
  id: string;
  date: string; // YYYY-MM-DD
  shopperMemberId: string;
  shopperName: string;
  amount: number;
  itemsSummary: string; // e.g. "চাল, ডাল, মুরগির মাংস, সবজি"
}

export type MessUtilityCategory =
  | 'RENT'
  | 'ELECTRICITY'
  | 'INTERNET'
  | 'MAID'
  | 'GAS'
  | 'SERVICE_CHARGE'
  | 'OTHER';

export interface MessUtilityItem {
  id: string;
  title: string; // e.g. "বাসা ভাড়া", "বিদ্যুৎ বিল", "ওয়াই-ফাই", "কাজের বুয়ার বেতন"
  amount: number;
  category: MessUtilityCategory;
  splitMode: 'EQUAL' | 'CUSTOM';
}

export interface DailyMealEntry {
  id: string;
  date: string; // YYYY-MM-DD
  memberId: string;
  breakfast: number; // 0, 0.5, 1
  lunch: number; // 0, 1, 2
  dinner: number; // 0, 1, 2
  guestMeals: number;
}

export interface MessMonthSession {
  id: string;
  monthTitle: string; // e.g. "সেপ্টেম্বর ২০২৬"
  yearMonth: string; // e.g. "2026-09"
  isActive: boolean;
  members: MessMember[];
  bazaarEntries: MessBazaarEntry[];
  utilityBills: MessUtilityItem[];
  dailyMeals: DailyMealEntry[];
  notes?: string;
  updatedAt: number;
}

export interface MemberMonthlySettlement {
  memberId: string;
  memberName: string;
  phone?: string;
  role: 'MANAGER' | 'MEMBER';
  totalMeals: number;
  mealCost: number;
  utilityShare: number;
  totalCost: number;
  totalDeposited: number;
  balance: number; // deposited - totalCost (+ = পাবে/Refundable, - = দিতে হবে/Due)
  status: 'REFUNDABLE' | 'DUE' | 'SETTLED';
  linkedDebtId?: string;
}

export interface MessSummaryStats {
  totalBazaar: number;
  totalMeals: number;
  mealRate: number;
  totalUtilities: number;
  totalMessExpenditure: number;
  totalDepositsCollected: number;
  cashInHand: number;
  totalDueReceivables: number;
}
