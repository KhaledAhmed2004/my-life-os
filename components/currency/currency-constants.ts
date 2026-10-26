import { CurrencyCode, CurrencyInfo } from '@/types/currency';

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸',
    country: 'United States',
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
    country: 'European Union',
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    flag: '🇬🇧',
    country: 'United Kingdom',
  },
  SAR: {
    code: 'SAR',
    name: 'Saudi Riyal',
    symbol: '﷼',
    flag: '🇸🇦',
    country: 'Saudi Arabia',
  },
  AED: {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'د.إ',
    flag: '🇦🇪',
    country: 'United Arab Emirates',
  },
  MYR: {
    code: 'MYR',
    name: 'Malaysian Ringgit',
    symbol: 'RM',
    flag: '🇲🇾',
    country: 'Malaysia',
  },
  CAD: {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'CA$',
    flag: '🇨🇦',
    country: 'Canada',
  },
  AUD: {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'AU$',
    flag: '🇦🇺',
    country: 'Australia',
  },
  SGD: {
    code: 'SGD',
    name: 'Singapore Dollar',
    symbol: 'S$',
    flag: '🇸🇬',
    country: 'Singapore',
  },
  INR: {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    flag: '🇮🇳',
    country: 'India',
  },
  JPY: {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    flag: '🇯🇵',
    country: 'Japan',
  },
  BDT: {
    code: 'BDT',
    name: 'Bangladeshi Taka',
    symbol: '৳',
    flag: '🇧🇩',
    country: 'Bangladesh',
  },
};

// Fallback rates against USD if device is completely offline on first launch
export const FALLBACK_USD_RATES: Record<string, number> = {
  USD: 1.0,
  BDT: 121.5,
  EUR: 0.92,
  GBP: 0.78,
  SAR: 3.75,
  AED: 3.67,
  MYR: 4.42,
  CAD: 1.36,
  AUD: 1.52,
  SGD: 1.33,
  INR: 84.2,
  JPY: 154.5,
};
