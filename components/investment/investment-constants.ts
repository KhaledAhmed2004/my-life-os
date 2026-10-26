import type { ComponentProps } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { InvestmentCategory } from '@/types/investment';

export interface CategoryMetadata {
  label: string;
  banglaLabel: string;
  icon: ComponentProps<typeof MaterialIcons>['name'];
  color: string;
  bgColor: string;
  accentColor: string;
  description: string;
}

export const INVESTMENT_CATEGORY_META: Record<InvestmentCategory, CategoryMetadata> = {
  SANCHAY_PATRA: {
    label: 'Sanchay Patra',
    banglaLabel: 'জাতীয় সঞ্চয়পত্র',
    icon: 'account-balance',
    color: '#FF922B', // Saffron / Warm Orange
    bgColor: 'rgba(255, 146, 43, 0.15)',
    accentColor: '#FFA94D',
    description: 'Government-backed fixed-yield savings certificates',
  },
  DPS: {
    label: 'DPS (Pension Scheme)',
    banglaLabel: 'ডিপিএস ডিপোজিট',
    icon: 'savings',
    color: '#20C997', // Teal Emerald
    bgColor: 'rgba(32, 201, 151, 0.15)',
    accentColor: '#38D9A9',
    description: 'Monthly recurring bank deposit pension scheme',
  },
  FIXED_DEPOSIT: {
    label: 'Fixed Deposit (FDR)',
    banglaLabel: 'স্থায়ী আমানত (FDR)',
    icon: 'lock-clock',
    color: '#339AF0', // Royal Blue
    bgColor: 'rgba(51, 154, 240, 0.15)',
    accentColor: '#4DABF7',
    description: 'Term deposit with compounded or periodic interest payout',
  },
  STOCKS: {
    label: 'Stocks & Equities',
    banglaLabel: 'শেয়ার বাজার (DSE/CSE)',
    icon: 'show-chart',
    color: '#51CF66', // Vibrant Green
    bgColor: 'rgba(81, 207, 102, 0.15)',
    accentColor: '#69DB7C',
    description: 'Stock shares, capital gains & dividend portfolio',
  },
  MUTUAL_FUND: {
    label: 'Mutual Funds & Unit',
    banglaLabel: 'মিউচুয়াল ফান্ড',
    icon: 'pie-chart',
    color: '#845EF7', // Violet
    bgColor: 'rgba(132, 94, 247, 0.15)',
    accentColor: '#9775FA',
    description: 'Diversified professionally managed open & closed funds',
  },
  CRYPTO: {
    label: 'Crypto Assets',
    banglaLabel: 'ক্রিপ্টো পোর্টফোলিও',
    icon: 'currency-bitcoin',
    color: '#FCC419', // Amber / Gold
    bgColor: 'rgba(252, 196, 25, 0.15)',
    accentColor: '#FFE066',
    description: 'Digital currencies and token holdings',
  },
  US_BONDS: {
    label: 'Bonds & Sukuk',
    banglaLabel: 'বন্ড ও ইসলামিক সুকুক',
    icon: 'receipt-long',
    color: '#22B8CF', // Cyan
    bgColor: 'rgba(34, 184, 207, 0.15)',
    accentColor: '#3BC9DB',
    description: 'Corporate bonds, treasury bills & sovereign Sukuk',
  },
  OTHER: {
    label: 'Other Investment',
    banglaLabel: 'অন্যান্য বিনিয়োগ',
    icon: 'workspaces',
    color: '#ADB5BD', // Cool Gray
    bgColor: 'rgba(173, 181, 189, 0.15)',
    accentColor: '#CED4DA',
    description: 'Real estate share, commodities, gold, or business capital',
  },
};
