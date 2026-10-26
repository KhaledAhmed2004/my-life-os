import { TaxpayerCategory, TaxRegion } from '@/types/tax';

export const TAXPAYER_OPTIONS: { id: TaxpayerCategory; label: string; limitText: string; sub: string }[] = [
  {
    id: 'GENERAL_MALE',
    label: 'General (Male)',
    limitText: '৳৩.৫০ লাখ করমুক্ত',
    sub: 'Standard individual taxpayer',
  },
  {
    id: 'FEMALE_SENIOR_65',
    label: 'Female / Senior (65+)',
    limitText: '৳৪.০০ লাখ করমুক্ত',
    sub: 'Female or aged 65 and above',
  },
  {
    id: 'PHYSICALLY_CHALLENGED',
    label: 'Physically Challenged / 3rd Gender',
    limitText: '৳৪.৭৫ লাখ করমুক্ত',
    sub: 'Persons with disability / transgender',
  },
  {
    id: 'FREEDOM_FIGHTER',
    label: 'War-wounded Freedom Fighter',
    limitText: '৳৫.০০ লাখ করমুক্ত',
    sub: 'Gazetted war-wounded freedom fighters',
  },
];

export const REGION_OPTIONS: { id: TaxRegion; label: string; minTax: string }[] = [
  {
    id: 'DHAKA_CHATTOGRAM_CITY',
    label: 'Dhaka & Chattogram City Corp',
    minTax: '৳৫,০০০',
  },
  {
    id: 'OTHER_CITY_CORP',
    label: 'Other City Corporations (Rajshahi, Sylhet, Khulna etc.)',
    minTax: '৳৪,০০০',
  },
  {
    id: 'NON_CITY_MUNICIPAL',
    label: 'District Municipalities & Other Areas',
    minTax: '৳৩,০০০',
  },
];

export const TAX_COLORS = {
  emerald: '#20C997',
  gold: '#D4A017',
  cyan: '#38BDF8',
  amber: '#FF922B',
  red: '#FF6B6B',
  surface: '#13191C',
  surfaceLight: '#181F23',
};
