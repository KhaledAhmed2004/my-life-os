import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

import {
  DEFAULT_GOLD_PRICE_PER_GRAM,
  DEFAULT_SILVER_PRICE_PER_GRAM,
  GOLD_NISAB_GRAMS,
  SILVER_NISAB_GRAMS,
  ZAKAT_RATE,
} from '@/components/zakat/zakat-constants';
import {
  ZakatManualItem,
  ZakatNisabStandard,
  ZakatResult,
  ZakatStateData,
} from '@/types/zakat';

const ZAKAT_STORAGE_KEY = 'vital_zakat_vault_v1';

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

const DEFAULT_MANUAL_ITEMS: ZakatManualItem[] = [
  {
    id: 'gold_sample',
    name: 'Gold Jewelry (Personal/Investment)',
    category: 'GOLD_JEWELRY',
    amount: 126000,
    weightGrams: 11.664, // 1 Bhori
    isDeduction: false,
    isEnabled: false,
    note: '1 Bhori (11.66g) 22K Gold',
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 30,
  },
  {
    id: 'cash_sample',
    name: 'Cash in Hand & Bank Accounts',
    category: 'CASH',
    amount: 50000,
    isDeduction: false,
    isEnabled: false,
    note: 'Unencumbered cash held over 1 year',
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now() - 86400000 * 20,
  },
];

interface ZakatState {
  goldPricePerGram: number;
  silverPricePerGram: number;
  nisabStandard: ZakatNisabStandard;
  hawlCompleted: boolean;
  includeSavingsVaults: boolean;
  includeDebtsReceivable: boolean;
  includeActiveLoans: boolean;
  includeDebtsPayable: boolean;
  manualItems: ZakatManualItem[];
  isLoading: boolean;

  loadData: () => Promise<void>;
  setGoldPricePerGram: (price: number) => void;
  setSilverPricePerGram: (price: number) => void;
  setNisabStandard: (std: ZakatNisabStandard) => void;
  setHawlCompleted: (completed: boolean) => void;
  setIncludeStoreItem: (
    key:
      | 'includeSavingsVaults'
      | 'includeDebtsReceivable'
      | 'includeActiveLoans'
      | 'includeDebtsPayable',
    enabled: boolean
  ) => void;

  addManualItem: (
    data: Omit<ZakatManualItem, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<ZakatManualItem>;
  updateManualItem: (id: string, updates: Partial<ZakatManualItem>) => Promise<void>;
  deleteManualItem: (id: string) => Promise<void>;
  toggleManualItem: (id: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;

  calculateZakat: (params: {
    savingsBalance: number;
    receivableDebts: number;
    activeLoans: number;
    payableDebts: number;
  }) => ZakatResult;
}

export const useZakatStore = create<ZakatState>((set, get) => ({
  goldPricePerGram: DEFAULT_GOLD_PRICE_PER_GRAM,
  silverPricePerGram: DEFAULT_SILVER_PRICE_PER_GRAM,
  nisabStandard: 'GOLD',
  hawlCompleted: true,
  includeSavingsVaults: true,
  includeDebtsReceivable: true,
  includeActiveLoans: true,
  includeDebtsPayable: true,
  manualItems: DEFAULT_MANUAL_ITEMS,
  isLoading: false,

  loadData: async () => {
    set({ isLoading: true });
    try {
      const raw = await getStorageItem(ZAKAT_STORAGE_KEY);
      if (raw) {
        const data: ZakatStateData = JSON.parse(raw);
        set({
          goldPricePerGram: data.goldPricePerGram || DEFAULT_GOLD_PRICE_PER_GRAM,
          silverPricePerGram: data.silverPricePerGram || DEFAULT_SILVER_PRICE_PER_GRAM,
          nisabStandard: data.nisabStandard || 'GOLD',
          hawlCompleted: data.hawlCompleted ?? true,
          includeSavingsVaults: data.includeSavingsVaults ?? true,
          includeDebtsReceivable: data.includeDebtsReceivable ?? true,
          includeActiveLoans: data.includeActiveLoans ?? true,
          includeDebtsPayable: data.includeDebtsPayable ?? true,
          manualItems: Array.isArray(data.manualItems) ? data.manualItems : DEFAULT_MANUAL_ITEMS,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  setGoldPricePerGram: (price: number) => {
    const val = Math.max(100, Math.round(price));
    set({ goldPricePerGram: val });
    void persistStore(get());
  },

  setSilverPricePerGram: (price: number) => {
    const val = Math.max(10, Math.round(price));
    set({ silverPricePerGram: val });
    void persistStore(get());
  },

  setNisabStandard: (std: ZakatNisabStandard) => {
    void Haptics.selectionAsync().catch(() => {});
    set({ nisabStandard: std });
    void persistStore(get());
  },

  setHawlCompleted: (completed: boolean) => {
    void Haptics.selectionAsync().catch(() => {});
    set({ hawlCompleted: completed });
    void persistStore(get());
  },

  setIncludeStoreItem: (key, enabled) => {
    void Haptics.selectionAsync().catch(() => {});
    set({ [key]: enabled } as unknown as Partial<ZakatState>);
    void persistStore(get());
  },

  addManualItem: async (data) => {
    const newItem: ZakatManualItem = {
      ...data,
      id: `zakat_item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updated = [newItem, ...get().manualItems];
    set({ manualItems: updated });
    await persistStore(get());
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    return newItem;
  },

  updateManualItem: async (id, updates) => {
    const updated = get().manualItems.map((item) =>
      item.id === id ? { ...item, ...updates, updatedAt: Date.now() } : item
    );
    set({ manualItems: updated });
    await persistStore(get());
  },

  deleteManualItem: async (id) => {
    const updated = get().manualItems.filter((item) => item.id !== id);
    set({ manualItems: updated });
    await persistStore(get());
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  },

  toggleManualItem: async (id) => {
    void Haptics.selectionAsync().catch(() => {});
    const updated = get().manualItems.map((item) =>
      item.id === id ? { ...item, isEnabled: !item.isEnabled, updatedAt: Date.now() } : item
    );
    set({ manualItems: updated });
    await persistStore(get());
  },

  resetToDefaults: async () => {
    set({
      goldPricePerGram: DEFAULT_GOLD_PRICE_PER_GRAM,
      silverPricePerGram: DEFAULT_SILVER_PRICE_PER_GRAM,
      nisabStandard: 'GOLD',
      hawlCompleted: true,
      includeSavingsVaults: true,
      includeDebtsReceivable: true,
      includeActiveLoans: true,
      includeDebtsPayable: true,
      manualItems: DEFAULT_MANUAL_ITEMS,
    });
    await persistStore(get());
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },

  calculateZakat: ({ savingsBalance, receivableDebts, activeLoans, payableDebts }) => {
    const {
      goldPricePerGram,
      silverPricePerGram,
      nisabStandard,
      hawlCompleted,
      includeSavingsVaults,
      includeDebtsReceivable,
      includeActiveLoans,
      includeDebtsPayable,
      manualItems,
    } = get();

    // 1. Auto Assets from other stores
    const autoSavings = includeSavingsVaults ? Math.max(0, savingsBalance) : 0;
    const autoReceivable = includeDebtsReceivable ? Math.max(0, receivableDebts) : 0;

    // 2. Manual Assets
    const manualAssets = manualItems
      .filter((i) => !i.isDeduction && i.isEnabled)
      .reduce((sum, i) => sum + Math.max(0, i.amount), 0);

    const totalZakatableAssets = autoSavings + autoReceivable + manualAssets;

    // 3. Deductions
    const autoLoans = includeActiveLoans ? Math.max(0, activeLoans) : 0;
    const autoPayable = includeDebtsPayable ? Math.max(0, payableDebts) : 0;

    const manualDeductions = manualItems
      .filter((i) => i.isDeduction && i.isEnabled)
      .reduce((sum, i) => sum + Math.max(0, i.amount), 0);

    const totalDeductions = autoLoans + autoPayable + manualDeductions;

    // 4. Net Zakatable Wealth
    const netZakatableWealth = Math.max(0, totalZakatableAssets - totalDeductions);

    // 5. Nisab Threshold Calculation
    const nisabThreshold =
      nisabStandard === 'GOLD'
        ? Math.round(GOLD_NISAB_GRAMS * goldPricePerGram)
        : Math.round(SILVER_NISAB_GRAMS * silverPricePerGram);

    const isNisabReached = netZakatableWealth >= nisabThreshold;
    const zakatDue = isNisabReached && hawlCompleted ? Math.round(netZakatableWealth * ZAKAT_RATE) : 0;
    const nisabPercentage =
      nisabThreshold > 0 ? Math.round((netZakatableWealth / nisabThreshold) * 100) : 0;

    return {
      totalZakatableAssets,
      totalDeductions,
      netZakatableWealth,
      nisabThreshold,
      isNisabReached,
      zakatDue,
      nisabPercentage,
      goldPricePerGram,
      silverPricePerGram,
      nisabStandard,
      hawlCompleted,
    };
  },
}));

async function persistStore(state: ZakatState) {
  try {
    const data: ZakatStateData = {
      goldPricePerGram: state.goldPricePerGram,
      silverPricePerGram: state.silverPricePerGram,
      nisabStandard: state.nisabStandard,
      hawlCompleted: state.hawlCompleted,
      includeSavingsVaults: state.includeSavingsVaults,
      includeDebtsReceivable: state.includeDebtsReceivable,
      includeActiveLoans: state.includeActiveLoans,
      includeDebtsPayable: state.includeDebtsPayable,
      manualItems: state.manualItems,
      lastUpdated: Date.now(),
    };
    await setStorageItem(ZAKAT_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[ZakatStore] Failed to persist zakat store:', e);
  }
}
