import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  WarrantyCategory,
  WarrantyClaim,
  WarrantyItem,
  WarrantyStats,
  WarrantyStatus,
} from '@/types/warranty';

const WARRANTY_STORAGE_KEY = 'vital_warranty_items_v1';

const generateId = () =>
  'warr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

const generateClaimId = () =>
  'claim_' + Math.random().toString(36).substring(2, 7) + Date.now().toString(36);

// Helper date offsets
const getDateWithOffsetDays = (daysOffset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

const getDateWithOffsetMonths = (monthsOffset: number): string => {
  const d = new Date();
  d.setMonth(d.getMonth() + monthsOffset);
  return d.toISOString().split('T')[0];
};

const SEED_WARRANTIES: WarrantyItem[] = [
  {
    id: 'warr_demo_1',
    productName: 'MacBook Pro 16" M3 Max',
    brand: 'Apple',
    modelNumber: 'A2991 - Space Black',
    serialNumber: 'C02G80X0MD6R',
    category: 'ELECTRONICS',
    purchaseDate: getDateWithOffsetMonths(-8),
    purchasePrice: 385000,
    storeName: 'Apple Store Regent St',
    warrantyDurationMonths: 36,
    warrantyStartDate: getDateWithOffsetMonths(-8),
    warrantyEndDate: getDateWithOffsetMonths(28),
    warrantyType: 'EXTENDED', // AppleCare+
    notes: 'Includes accidental damage protection with ৳ 9,500 service fee.',
    claims: [
      {
        id: 'claim_1',
        claimDate: getDateWithOffsetMonths(-2),
        issueDescription: 'Keycap mechanism sticking on spacebar',
        status: 'RESOLVED',
        repairCenter: 'Apple Authorized Service Provider',
        costCovered: 14500,
        outOfPocketCost: 0,
        claimNotes: 'Top case replaced under warranty at zero cost.',
        resolvedDate: getDateWithOffsetMonths(-2),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'warr_demo_2',
    productName: 'Sony WH-1000XM5 Headphones',
    brand: 'Sony',
    modelNumber: 'WH-1000XM5/S',
    serialNumber: 'S01-982412-B',
    category: 'GADGETS',
    purchaseDate: getDateWithOffsetDays(-350),
    purchasePrice: 38000,
    storeName: 'Gadget & Gear BD',
    warrantyDurationMonths: 12,
    warrantyStartDate: getDateWithOffsetDays(-350),
    warrantyEndDate: getDateWithOffsetDays(15), // Expiring in 15 days!
    warrantyType: 'MANUFACTURER',
    notes: 'Official Bangladesh distributor warranty card kept inside original box.',
    claims: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'warr_demo_3',
    productName: 'LG OLED evo C3 65" 4K TV',
    brand: 'LG Electronics',
    modelNumber: 'OLED65C3PSA',
    serialNumber: '304RMKV90214',
    category: 'APPLIANCES',
    purchaseDate: getDateWithOffsetMonths(-14),
    purchasePrice: 225000,
    storeName: 'Butterfly Electronics',
    warrantyDurationMonths: 24,
    warrantyStartDate: getDateWithOffsetMonths(-14),
    warrantyEndDate: getDateWithOffsetMonths(10),
    warrantyType: 'MANUFACTURER',
    notes: 'Includes 2 years panel replacement guarantee & free in-home technician visits.',
    claims: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'warr_demo_4',
    productName: 'Dyson V15 Detect Cordless Vacuum',
    brand: 'Dyson',
    modelNumber: 'SV22 Total Clean',
    serialNumber: 'DY-883192-EU',
    category: 'APPLIANCES',
    purchaseDate: getDateWithOffsetMonths(-26),
    purchasePrice: 79000,
    storeName: 'Dubai Duty Free',
    warrantyDurationMonths: 24,
    warrantyStartDate: getDateWithOffsetMonths(-26),
    warrantyEndDate: getDateWithOffsetMonths(-2), // Expired 2 months ago
    warrantyType: 'MANUFACTURER',
    notes: 'Standard international 2-year warranty expired.',
    claims: [
      {
        id: 'claim_2',
        claimDate: getDateWithOffsetMonths(-10),
        issueDescription: 'Battery trigger sensor contact failure',
        status: 'RESOLVED',
        repairCenter: 'Dyson Direct Support',
        costCovered: 12000,
        outOfPocketCost: 0,
        claimNotes: 'Brand new motorhead and battery pack shipped.',
        resolvedDate: getDateWithOffsetMonths(-10),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'warr_demo_5',
    productName: 'Herman Miller Aeron Chair',
    brand: 'Herman Miller',
    modelNumber: 'Aeron Size B Carbon',
    serialNumber: 'HM-AE-2023-9941',
    category: 'FURNITURE',
    purchaseDate: getDateWithOffsetMonths(-6),
    purchasePrice: 145000,
    storeName: 'Ergonomic Workspace Ltd',
    warrantyDurationMonths: 144, // 12 years warranty!
    warrantyStartDate: getDateWithOffsetMonths(-6),
    warrantyEndDate: getDateWithOffsetMonths(138),
    warrantyType: 'MANUFACTURER',
    notes: 'Legendary 12-year full mechanism warranty covers cylinder and pellicle mesh.',
    claims: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

async function getStoredWarranties(): Promise<WarrantyItem[]> {
  try {
    let raw: string | null = null;
    if (Platform.OS === 'web') {
      raw = localStorage.getItem(WARRANTY_STORAGE_KEY);
    } else {
      raw = await SecureStore.getItemAsync(WARRANTY_STORAGE_KEY);
    }
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('[WarrantyStore] Failed to load warranties:', e);
  }
  return SEED_WARRANTIES;
}

async function saveStoredWarranties(items: WarrantyItem[]): Promise<void> {
  try {
    const raw = JSON.stringify(items);
    if (Platform.OS === 'web') {
      localStorage.setItem(WARRANTY_STORAGE_KEY, raw);
    } else {
      await SecureStore.setItemAsync(WARRANTY_STORAGE_KEY, raw);
    }
  } catch (e) {
    console.warn('[WarrantyStore] Failed to save warranties:', e);
  }
}

interface WarrantyState {
  items: WarrantyItem[];
  isLoading: boolean;

  // Actions
  loadData: () => Promise<void>;
  addItem: (
    item: Omit<WarrantyItem, 'id' | 'createdAt' | 'updatedAt' | 'claims'> & {
      claims?: WarrantyClaim[];
    }
  ) => Promise<WarrantyItem>;
  updateItem: (id: string, updates: Partial<WarrantyItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  addClaim: (itemId: string, claim: Omit<WarrantyClaim, 'id'>) => Promise<void>;
  updateClaim: (itemId: string, claimId: string, updates: Partial<WarrantyClaim>) => Promise<void>;
  deleteClaim: (itemId: string, claimId: string) => Promise<void>;
  resetToDemoData: () => Promise<void>;
  clearAllData: () => Promise<void>;

  // Selectors & Calculations
  computeStatus: (item: WarrantyItem) => {
    status: WarrantyStatus;
    daysRemaining: number;
    daysPassed: number;
    totalDays: number;
    progressPct: number;
    isExpiringSoon: boolean;
    isExpired: boolean;
  };
  getStats: () => WarrantyStats;
  getExpiringSoonItems: (withinDays?: number) => WarrantyItem[];
}

export const useWarrantyStore = create<WarrantyState>((set, get) => ({
  items: SEED_WARRANTIES,
  isLoading: false,

  loadData: async () => {
    set({ isLoading: true });
    const stored = await getStoredWarranties();
    set({ items: stored, isLoading: false });
  },

  addItem: async (itemData) => {
    const now = new Date().toISOString();
    const newItem: WarrantyItem = {
      ...itemData,
      id: generateId(),
      claims: itemData.claims || [],
      createdAt: now,
      updatedAt: now,
    };

    const updated = [newItem, ...get().items];
    set({ items: updated });
    await saveStoredWarranties(updated);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    return newItem;
  },

  updateItem: async (id, updates) => {
    const now = new Date().toISOString();
    const updated = get().items.map((item) =>
      item.id === id ? { ...item, ...updates, updatedAt: now } : item
    );
    set({ items: updated });
    await saveStoredWarranties(updated);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },

  deleteItem: async (id) => {
    const updated = get().items.filter((item) => item.id !== id);
    set({ items: updated });
    await saveStoredWarranties(updated);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  },

  addClaim: async (itemId, claimData) => {
    const newClaim: WarrantyClaim = {
      ...claimData,
      id: generateClaimId(),
    };
    const now = new Date().toISOString();
    const updated = get().items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            claims: [newClaim, ...(item.claims || [])],
            updatedAt: now,
          }
        : item
    );
    set({ items: updated });
    await saveStoredWarranties(updated);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },

  updateClaim: async (itemId, claimId, updates) => {
    const now = new Date().toISOString();
    const updated = get().items.map((item) => {
      if (item.id !== itemId) return item;
      const updatedClaims = (item.claims || []).map((c) =>
        c.id === claimId ? { ...c, ...updates } : c
      );
      return { ...item, claims: updatedClaims, updatedAt: now };
    });
    set({ items: updated });
    await saveStoredWarranties(updated);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },

  deleteClaim: async (itemId, claimId) => {
    const now = new Date().toISOString();
    const updated = get().items.map((item) => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        claims: (item.claims || []).filter((c) => c.id !== claimId),
        updatedAt: now,
      };
    });
    set({ items: updated });
    await saveStoredWarranties(updated);
  },

  resetToDemoData: async () => {
    set({ items: SEED_WARRANTIES });
    await saveStoredWarranties(SEED_WARRANTIES);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },

  clearAllData: async () => {
    set({ items: [] });
    await saveStoredWarranties([]);
  },

  computeStatus: (item: WarrantyItem) => {
    const now = new Date();
    const start = new Date(item.warrantyStartDate || item.purchaseDate);
    const end = new Date(item.warrantyEndDate);

    const msPerDay = 1000 * 60 * 60 * 24;
    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / msPerDay));
    const daysPassed = Math.round((now.getTime() - start.getTime()) / msPerDay);
    const daysRemaining = Math.round((end.getTime() - now.getTime()) / msPerDay);

    const progressPct = Math.min(100, Math.max(0, Math.round((daysPassed / totalDays) * 100)));

    const isExpired = daysRemaining < 0;
    const isExpiringSoon = daysRemaining >= 0 && daysRemaining <= 30;

    let status: WarrantyStatus = 'ACTIVE';
    if (isExpired) {
      status = 'EXPIRED';
    } else if (isExpiringSoon) {
      status = 'EXPIRING_SOON';
    }

    return {
      status,
      daysRemaining,
      daysPassed,
      totalDays,
      progressPct,
      isExpiringSoon,
      isExpired,
    };
  },

  getStats: () => {
    const items = get().items;
    let activeCount = 0;
    let expiringSoonCount = 0;
    let expiredCount = 0;
    let totalProtectedValue = 0;
    let totalClaimsCount = 0;
    let totalClaimsSaved = 0;

    const now = new Date();

    for (const item of items) {
      const end = new Date(item.warrantyEndDate);
      const msRemaining = end.getTime() - now.getTime();
      const daysRemaining = Math.round(msRemaining / (1000 * 60 * 60 * 24));

      if (daysRemaining < 0) {
        expiredCount++;
      } else {
        totalProtectedValue += item.purchasePrice || 0;
        if (daysRemaining <= 30) {
          expiringSoonCount++;
        } else {
          activeCount++;
        }
      }

      if (item.claims && item.claims.length > 0) {
        totalClaimsCount += item.claims.length;
        for (const claim of item.claims) {
          totalClaimsSaved += claim.costCovered || 0;
        }
      }
    }

    return {
      totalItems: items.length,
      activeCount,
      expiringSoonCount,
      expiredCount,
      totalProtectedValue,
      totalClaimsCount,
      totalClaimsSaved,
    };
  },

  getExpiringSoonItems: (withinDays = 30) => {
    const items = get().items;
    const now = new Date();
    return items.filter((item) => {
      const end = new Date(item.warrantyEndDate);
      const daysRemaining = Math.round((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysRemaining >= 0 && daysRemaining <= withinDays;
    });
  },
}));
