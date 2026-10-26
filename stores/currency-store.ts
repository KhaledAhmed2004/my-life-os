import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

import { FALLBACK_USD_RATES } from '@/components/currency/currency-constants';
import { ConversionResult, CurrencyCode, ExchangeRatesData } from '@/types/currency';

const CURRENCY_STORAGE_KEY = 'vital_currency_rates_v2';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours cache

async function setStorageItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getStorageItem(key: string) {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

interface CurrencyState {
  rates: Record<string, number>;
  lastUpdated: number;
  isLoading: boolean;
  isOffline: boolean;
  selectedFrom: CurrencyCode;
  selectedTo: CurrencyCode;
  amount: string;
  includeIncentive: boolean;

  loadData: () => Promise<void>;
  fetchRates: (forceRefresh?: boolean) => Promise<boolean>;
  setFromCurrency: (code: CurrencyCode) => void;
  setToCurrency: (code: CurrencyCode) => void;
  swapCurrencies: () => void;
  setAmount: (amt: string) => void;
  toggleIncentive: () => void;

  convert: (
    amountVal: number,
    from: CurrencyCode,
    to: CurrencyCode,
    withIncentive?: boolean
  ) => ConversionResult;
  getRateInBDT: (code: CurrencyCode) => number;
}

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  rates: { ...FALLBACK_USD_RATES },
  lastUpdated: Date.now(),
  isLoading: false,
  isOffline: false,
  selectedFrom: 'USD',
  selectedTo: 'BDT',
  amount: '100',
  includeIncentive: false,

  loadData: async () => {
    try {
      const raw = await getStorageItem(CURRENCY_STORAGE_KEY);
      if (raw) {
        const cached: ExchangeRatesData = JSON.parse(raw);
        const isFresh = Date.now() - cached.lastUpdated < CACHE_TTL_MS;
        set({
          rates: { ...FALLBACK_USD_RATES, ...cached.rates },
          lastUpdated: cached.lastUpdated,
        });

        if (!isFresh) {
          void get().fetchRates(false);
        }
      } else {
        void get().fetchRates(false);
      }
    } catch {
      void get().fetchRates(false);
    }
  },

  fetchRates: async (forceRefresh = false) => {
    if (get().isLoading && !forceRefresh) return false;

    set({ isLoading: true });

    try {
      // Primary API: Open ER-API (reliable, free, CORS-friendly)
      const res = await fetch('https://open.er-api.com/v6/latest/USD', {
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}`);
      }

      const data = await res.json();
      if (data && data.rates && typeof data.rates === 'object') {
        const newRates: Record<string, number> = {
          ...FALLBACK_USD_RATES,
          ...data.rates,
        };

        const cacheData: ExchangeRatesData = {
          base: 'USD',
          rates: newRates,
          lastUpdated: Date.now(),
          isOfflineFallback: false,
        };

        await setStorageItem(CURRENCY_STORAGE_KEY, JSON.stringify(cacheData));

        set({
          rates: newRates,
          lastUpdated: Date.now(),
          isLoading: false,
          isOffline: false,
        });

        if (forceRefresh) {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        }
        return true;
      }
      throw new Error('Invalid rates format');
    } catch (e) {
      console.warn('[CurrencyStore] Failed to fetch live exchange rates, falling back to cache:', e);

      // Fallback secondary API
      try {
        const fallbackRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (fallbackData && fallbackData.rates) {
            const merged = { ...FALLBACK_USD_RATES, ...fallbackData.rates };
            set({
              rates: merged,
              lastUpdated: Date.now(),
              isLoading: false,
              isOffline: false,
            });
            await setStorageItem(
              CURRENCY_STORAGE_KEY,
              JSON.stringify({ base: 'USD', rates: merged, lastUpdated: Date.now() })
            );
            return true;
          }
        }
      } catch {
        // Ignored secondary error
      }

      set({
        isLoading: false,
        isOffline: true,
      });

      if (forceRefresh) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      }
      return false;
    }
  },

  setFromCurrency: (code) => {
    void Haptics.selectionAsync().catch(() => {});
    set({ selectedFrom: code });
  },

  setToCurrency: (code) => {
    void Haptics.selectionAsync().catch(() => {});
    set({ selectedTo: code });
  },

  swapCurrencies: () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const currentFrom = get().selectedFrom;
    const currentTo = get().selectedTo;
    set({
      selectedFrom: currentTo,
      selectedTo: currentFrom,
    });
  },

  setAmount: (amt) => {
    set({ amount: amt.replace(/[^0-9.]/g, '') });
  },

  toggleIncentive: () => {
    void Haptics.selectionAsync().catch(() => {});
    set((s) => ({ includeIncentive: !s.includeIncentive }));
  },

  convert: (amountVal, from, to, withIncentive = false) => {
    const rates = get().rates;
    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;

    let rate = 1;
    if (from === to) {
      rate = 1;
    } else {
      rate = toRate / fromRate;
    }

    const inverseRate = rate > 0 ? 1 / rate : 0;
    const toAmount = amountVal * rate;

    let remittanceIncentiveBonus = 0;
    let totalWithIncentive = toAmount;

    // Bangladesh Government 2.5% Cash Incentive for inbound foreign remittances
    if (to === 'BDT' && from !== 'BDT' && withIncentive) {
      remittanceIncentiveBonus = toAmount * 0.025;
      totalWithIncentive = toAmount + remittanceIncentiveBonus;
    }

    return {
      fromAmount: amountVal,
      fromCode: from,
      toAmount: Math.round(toAmount * 100) / 100,
      toCode: to,
      rate: Math.round(rate * 10000) / 10000,
      inverseRate: Math.round(inverseRate * 10000) / 10000,
      remittanceIncentiveBonus: Math.round(remittanceIncentiveBonus),
      totalWithIncentive: Math.round(totalWithIncentive),
    };
  },

  getRateInBDT: (code: CurrencyCode) => {
    if (code === 'BDT') return 1;
    const rates = get().rates;
    const usdToBdt = rates.BDT || 121.5;
    const usdToCode = rates[code] || 1;
    return Math.round((usdToBdt / usdToCode) * 100) / 100;
  },
}));
