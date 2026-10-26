import { ComponentProps } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AtmCapability, BankCode } from '@/types/atm';

export interface BankMeta {
  code: BankCode;
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
  icon: ComponentProps<typeof MaterialIcons>['name'];
  helpline: string;
}

export const BANKS_METADATA: Record<BankCode, BankMeta> = {
  DBBL: {
    code: 'DBBL',
    name: 'Dutch-Bangla Bank',
    shortName: 'DBBL FastTrack',
    color: '#00843D',
    bgColor: 'rgba(0, 132, 61, 0.15)',
    icon: 'account-balance',
    helpline: '16216',
  },
  BRAC: {
    code: 'BRAC',
    name: 'BRAC Bank Limited',
    shortName: 'BRAC Bank',
    color: '#00529C',
    bgColor: 'rgba(0, 82, 156, 0.15)',
    icon: 'account-balance',
    helpline: '16221',
  },
  CITY: {
    code: 'CITY',
    name: 'City Bank (Amex)',
    shortName: 'City Bank',
    color: '#D71920',
    bgColor: 'rgba(215, 25, 32, 0.15)',
    icon: 'credit-card',
    helpline: '16234',
  },
  IBBL: {
    code: 'IBBL',
    name: 'Islami Bank Bangladesh',
    shortName: 'Islami Bank',
    color: '#00A651',
    bgColor: 'rgba(0, 166, 81, 0.15)',
    icon: 'account-balance',
    helpline: '16259',
  },
  EBL: {
    code: 'EBL',
    name: 'Eastern Bank Limited',
    shortName: 'EBL SkyLounge',
    color: '#E31B23',
    bgColor: 'rgba(227, 27, 35, 0.15)',
    icon: 'account-balance',
    helpline: '16230',
  },
  SCB: {
    code: 'SCB',
    name: 'Standard Chartered Bank',
    shortName: 'StanChart',
    color: '#0070BA',
    bgColor: 'rgba(0, 112, 186, 0.15)',
    icon: 'account-balance',
    helpline: '16233',
  },
  UCB: {
    code: 'UCB',
    name: 'United Commercial Bank',
    shortName: 'UCB Bank',
    color: '#F48220',
    bgColor: 'rgba(244, 130, 32, 0.15)',
    icon: 'account-balance',
    helpline: '16419',
  },
  SONALI: {
    code: 'SONALI',
    name: 'Sonali Bank (Govt)',
    shortName: 'Sonali Bank',
    color: '#FFB81C',
    bgColor: 'rgba(255, 184, 28, 0.15)',
    icon: 'account-balance',
    helpline: '16639',
  },
  BKASH_PRIORITY: {
    code: 'BKASH_PRIORITY',
    name: 'bKash Priority Cashout',
    shortName: 'bKash Point',
    color: '#E2136E',
    bgColor: 'rgba(226, 19, 110, 0.15)',
    icon: 'payments',
    helpline: '16247',
  },
};

export const CAPABILITY_METADATA: Record<
  AtmCapability,
  { label: string; icon: ComponentProps<typeof MaterialIcons>['name']; color: string }
> = {
  CASH_WITHDRAWAL: { label: 'Cash Withdrawal', icon: 'local-atm', color: '#20C997' },
  CASH_DEPOSIT_CRM: { label: 'টাকা জমা (CRM Deposit)', icon: 'savings', color: '#D4A017' },
  FAST_TRACK: { label: 'FastTrack Hub', icon: 'bolt', color: '#38BDF8' },
  NPSB: { label: 'NPSB Supported', icon: 'swap-horiz', color: '#A78BFA' },
  VISA_MASTERCARD: { label: 'Visa / Mastercard', icon: 'credit-card', color: '#FF922B' },
  AMEX: { label: 'American Express', icon: 'card-membership', color: '#38BDF8' },
  OPEN_24_7: { label: '24/7 Open', icon: 'schedule', color: '#20C997' },
  WHEELCHAIR_ACCESSIBLE: { label: 'Accessible', icon: 'accessible', color: '#38BDF8' },
};

export const RADIUS_PRESETS: { id: number; label: string }[] = [
  { id: 0, label: 'All' },
  { id: 0.5, label: '500m' },
  { id: 1, label: '1 km' },
  { id: 2, label: '2 km' },
  { id: 5, label: '5 km' },
];

export const DARK_MAP_STYLE = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#101416' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#101416' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8899A6' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d4d4d4' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#657786' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#18241e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1c2429' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#141a1d' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#2b363d' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1c2429' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#09151d' }],
  },
];
