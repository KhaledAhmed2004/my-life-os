/**
 * Financial Wellness & Expense Tracker Types and Models
 */

export type TransactionType = 'INCOME' | 'EXPENSE';

export type PaymentMethod = 'CASH' | 'CARD' | 'BANK' | 'WALLET' | 'OTHER';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  bgColor: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: number; // Timestamp
}

export interface MonthlyBudget {
  month: string; // e.g. "2026-08"
  limit: number;
}

export interface CategoryExpenseSummary {
  category: Category;
  totalAmount: number;
  percentage: number;
  transactionCount: number;
}

export interface ExpenseState {
  transactions: Transaction[];
  monthlyBudget: number;
  isLoading: boolean;
}
