import type { ComponentProps } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LoanCategory, LoanStatus } from '@/types/loan';

export interface LoanCategoryMeta {
  label: string;
  icon: ComponentProps<typeof MaterialIcons>['name'];
  color: string;
  bg: string;
}

export const LOAN_CATEGORIES: Record<LoanCategory, LoanCategoryMeta> = {
  HOME_LOAN: {
    label: 'Home Mortgage',
    icon: 'home',
    color: '#4DABF7',
    bg: 'rgba(77, 171, 247, 0.16)',
  },
  CAR_LOAN: {
    label: 'Auto / Vehicle Loan',
    icon: 'directions-car',
    color: '#FF922B',
    bg: 'rgba(255, 146, 43, 0.16)',
  },
  PERSONAL_LOAN: {
    label: 'Personal Loan',
    icon: 'person',
    color: '#A78BFA',
    bg: 'rgba(167, 139, 250, 0.16)',
  },
  EDUCATION_LOAN: {
    label: 'Education / Student Loan',
    icon: 'school',
    color: '#20C997',
    bg: 'rgba(32, 201, 151, 0.16)',
  },
  BUSINESS_LOAN: {
    label: 'Business Commercial Loan',
    icon: 'business-center',
    color: '#FCC419',
    bg: 'rgba(252, 196, 25, 0.16)',
  },
  CREDIT_CARD_EMI: {
    label: 'Credit Card EMI',
    icon: 'credit-card',
    color: '#F43F5E',
    bg: 'rgba(244, 63, 94, 0.16)',
  },
  DEVICE_FINANCING: {
    label: 'Gadget / Device EMI',
    icon: 'devices',
    color: '#38BDF8',
    bg: 'rgba(56, 189, 248, 0.16)',
  },
  OTHER: {
    label: 'General Financing',
    icon: 'receipt-long',
    color: '#ADB5BD',
    bg: 'rgba(173, 181, 189, 0.16)',
  },
};

export const LOAN_STATUS_THEMES: Record<
  LoanStatus,
  { label: string; color: string; bg: string; icon: ComponentProps<typeof MaterialIcons>['name'] }
> = {
  ACTIVE: {
    label: 'Active Loan',
    color: '#38BDF8',
    bg: 'rgba(56, 189, 248, 0.15)',
    icon: 'sync',
  },
  PAID_OFF: {
    label: 'Paid Off',
    color: '#20C997',
    bg: 'rgba(32, 201, 151, 0.15)',
    icon: 'check-circle',
  },
  DEFAULTED: {
    label: 'Overdue Alert',
    color: '#F43F5E',
    bg: 'rgba(244, 63, 94, 0.15)',
    icon: 'warning',
  },
};
