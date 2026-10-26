export type CurrencyCode =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'SAR'
  | 'AED'
  | 'MYR'
  | 'CAD'
  | 'AUD'
  | 'SGD'
  | 'INR'
  | 'JPY'
  | 'BDT';

export interface CurrencyInfo {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string; // Emoji flag or country icon
  country: string;
}

export interface ExchangeRatesData {
  base: string;
  rates: Record<string, number>;
  lastUpdated: number;
  isOfflineFallback?: boolean;
}

export interface ConversionResult {
  fromAmount: number;
  fromCode: CurrencyCode;
  toAmount: number;
  toCode: CurrencyCode;
  rate: number;
  inverseRate: number;
  remittanceIncentiveBonus?: number; // 2.5% Bangladesh govt incentive
  totalWithIncentive?: number;
}
