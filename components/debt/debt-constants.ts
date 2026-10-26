import type { ComponentProps } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { DebtStatus, DebtType } from '@/types/debt';

export interface DebtTypeMeta {
  label: string;
  sublabel: string;
  badgeText: string;
  icon: ComponentProps<typeof MaterialIcons>['name'];
  color: string;
  bg: string;
}

export const DEBT_TYPE_METAS: Record<DebtType, DebtTypeMeta> = {
  I_LENT: {
    label: 'I Lent Money',
    sublabel: 'Someone owes you money (Asset/Receivable)',
    badgeText: 'YOU ARE OWED',
    icon: 'call-made',
    color: '#20C997', // Emerald green
    bg: 'rgba(32, 201, 151, 0.15)',
  },
  I_BORROWED: {
    label: 'I Borrowed Money',
    sublabel: 'You owe someone money (Liability/Payable)',
    badgeText: 'YOU OWE',
    icon: 'call-received',
    color: '#FF6B6B', // Coral red
    bg: 'rgba(255, 107, 107, 0.15)',
  },
};

export const DEBT_STATUS_METAS: Record<
  DebtStatus,
  { label: string; color: string; bg: string; icon: ComponentProps<typeof MaterialIcons>['name'] }
> = {
  PENDING: {
    label: 'Pending',
    color: '#FCC419',
    bg: 'rgba(252, 196, 25, 0.15)',
    icon: 'hourglass-empty',
  },
  PARTIALLY_PAID: {
    label: 'Partially Repaid',
    color: '#38BDF8',
    bg: 'rgba(56, 189, 248, 0.15)',
    icon: 'timelapse',
  },
  SETTLED: {
    label: 'Settled & Cleared',
    color: '#20C997',
    bg: 'rgba(32, 201, 151, 0.15)',
    icon: 'check-circle',
  },
};
