export type SplitMode = 'EQUAL' | 'ITEMIZED' | 'CUSTOM_AMOUNT';

export interface BillItem {
  id: string;
  name: string;
  price: number;
  assignedMemberIds: string[];
}

export interface SplitMember {
  id: string;
  name: string;
  phone?: string;
  isPayer: boolean; // True if this member paid the upfront restaurant bill
  subtotalShare: number; // Raw dish / food cost
  vatShare: number; // Proportional VAT share
  serviceChargeShare: number; // Proportional Service Charge share
  discountShare: number; // Proportional discount deduction
  tipShare: number; // Proportional tip share
  totalShare: number; // Final payable amount
  isSettled: boolean; // Has this friend reimbursed their share
  linkedDebtId?: string; // If synced to Debt/Udhaar store
}

export interface SplitSession {
  id: string;
  title: string;
  venue?: string;
  date: number;
  mode: SplitMode;
  subtotal: number;
  vatPercent: number; // e.g. 5, 7.5, 15
  serviceChargePercent: number; // e.g. 0, 5, 10
  discountAmount: number;
  tipAmount: number;
  totalBill: number;
  items: BillItem[];
  members: SplitMember[];
  myPaymentNumber?: string; // bKash / Nagad number for receiving payback
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SplitBillStats {
  totalSessionsCount: number;
  totalBillsVolume: number;
  totalUnsettledReceivable: number;
  unsettledFriendsCount: number;
}
