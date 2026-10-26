export type DebtType = 'I_LENT' | 'I_BORROWED';

export type DebtStatus = 'PENDING' | 'PARTIALLY_PAID' | 'SETTLED';

export interface DebtHistoryEntry {
  id: string;
  date: number;
  amount: number;
  type: 'PARTIAL_PAYMENT' | 'FULL_PAYMENT' | 'INCREASE_DEBT';
  remainingAfter: number;
  note?: string;
}

export interface DebtItem {
  id: string;
  personName: string;
  phone?: string;
  type: DebtType;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  startDate: number;
  dueDate?: number;
  status: DebtStatus;
  notes?: string;
  history: DebtHistoryEntry[];
  createdAt: number;
  updatedAt: number;
}

export interface DebtStats {
  totalLentPending: number;
  totalBorrowedPending: number;
  netBalance: number; // positive means others owe you, negative means you owe others
  activeLentCount: number;
  activeBorrowedCount: number;
  overdueCount: number;
  totalSettledCount: number;
}
