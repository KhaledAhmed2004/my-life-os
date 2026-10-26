import { create } from 'zustand';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  AtmCashStatus,
  AtmFilterOptions,
  AtmLocation,
  BankCode,
  UserCoordinates,
} from '@/types/atm';

const ATM_STORAGE_KEY = 'vital_atm_radar_cache_v1';

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

// Haversine Distance Formula (Meters)
export function getDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function formatDistance(meters?: number): string {
  if (meters === undefined || isNaN(meters)) return '--';
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

// Default central Dhaka coordinate fallback
export const DEFAULT_USER_COORDS: UserCoordinates = {
  latitude: 23.7465,
  longitude: 90.376,
};

// Curated verified ATM & CRM locations across Bangladesh
const SEED_ATMS: AtmLocation[] = [
  {
    id: 'atm_dbbl_dhanmondi_27',
    name: 'DBBL FastTrack — Dhanmondi 27',
    bank: 'DBBL',
    address: 'House 34, Road 27 (Old), Dhanmondi R/A',
    area: 'Dhanmondi, Dhaka',
    latitude: 23.7538,
    longitude: 90.3768,
    capabilities: ['CASH_WITHDRAWAL', 'CASH_DEPOSIT_CRM', 'FAST_TRACK', 'NPSB', 'VISA_MASTERCARD', 'OPEN_24_7'],
    cashStatus: 'CASH_AVAILABLE',
    boothCount: 4,
    helplinePhone: '16216',
    lastReportedTime: Date.now() - 1000 * 60 * 20,
  },
  {
    id: 'atm_brac_dhanmondi_8a',
    name: 'BRAC Bank ATM & CRM — Road 8/A',
    bank: 'BRAC',
    address: 'Plot 42, Road 8/A, Dhanmondi',
    area: 'Dhanmondi, Dhaka',
    latitude: 23.7485,
    longitude: 90.3742,
    capabilities: ['CASH_WITHDRAWAL', 'CASH_DEPOSIT_CRM', 'NPSB', 'VISA_MASTERCARD', 'OPEN_24_7'],
    cashStatus: 'CASH_AVAILABLE',
    boothCount: 2,
    helplinePhone: '16221',
    lastReportedTime: Date.now() - 1000 * 60 * 45,
  },
  {
    id: 'atm_city_dhanmondi_2',
    name: 'City Bank ATM & Amex Lounge — Road 2',
    bank: 'CITY',
    address: 'House 12, Road 2, Dhanmondi',
    area: 'Dhanmondi, Dhaka',
    latitude: 23.7412,
    longitude: 90.3821,
    capabilities: ['CASH_WITHDRAWAL', 'AMEX', 'VISA_MASTERCARD', 'NPSB', 'OPEN_24_7'],
    cashStatus: 'CASH_AVAILABLE',
    boothCount: 3,
    helplinePhone: '16234',
    lastReportedTime: Date.now() - 1000 * 60 * 10,
  },
  {
    id: 'atm_ibbl_kalabagan',
    name: 'Islami Bank CRM Booth — Kalabagan',
    bank: 'IBBL',
    address: 'Mirpur Road, Near Kalabagan Bus Stand',
    area: 'Kalabagan, Dhaka',
    latitude: 23.7502,
    longitude: 90.3805,
    capabilities: ['CASH_WITHDRAWAL', 'CASH_DEPOSIT_CRM', 'NPSB', 'OPEN_24_7'],
    cashStatus: 'CASH_AVAILABLE',
    boothCount: 2,
    helplinePhone: '16259',
    lastReportedTime: Date.now() - 1000 * 60 * 60,
  },
  {
    id: 'atm_ebl_panthapath',
    name: 'EBL ATM & SkyLounge — Panthapath',
    bank: 'EBL',
    address: 'Square Hospital Corner, Panthapath',
    area: 'Panthapath, Dhaka',
    latitude: 23.7525,
    longitude: 90.3872,
    capabilities: ['CASH_WITHDRAWAL', 'FAST_TRACK', 'VISA_MASTERCARD', 'NPSB', 'OPEN_24_7'],
    cashStatus: 'CASH_AVAILABLE',
    boothCount: 2,
    helplinePhone: '16230',
    lastReportedTime: Date.now() - 1000 * 60 * 30,
  },
  {
    id: 'atm_bkash_sobhanbagh',
    name: 'bKash Priority Cashout & Agent Hub',
    bank: 'BKASH_PRIORITY',
    address: 'Sobhanbagh Mosque Market, Mirpur Road',
    area: 'Sobhanbagh, Dhaka',
    latitude: 23.7552,
    longitude: 90.3789,
    capabilities: ['CASH_WITHDRAWAL', 'OPEN_24_7'],
    cashStatus: 'CASH_AVAILABLE',
    boothCount: 2,
    helplinePhone: '16247',
    lastReportedTime: Date.now() - 1000 * 60 * 15,
  },
  {
    id: 'atm_dbbl_gulshan_2',
    name: 'DBBL FastTrack & CRM — Gulshan 2',
    bank: 'DBBL',
    address: 'Gulshan 2 Circle, North Avenue',
    area: 'Gulshan 2, Dhaka',
    latitude: 23.7938,
    longitude: 90.4145,
    capabilities: ['CASH_WITHDRAWAL', 'CASH_DEPOSIT_CRM', 'FAST_TRACK', 'NPSB', 'VISA_MASTERCARD', 'OPEN_24_7'],
    cashStatus: 'CASH_AVAILABLE',
    boothCount: 5,
    helplinePhone: '16216',
  },
  {
    id: 'atm_scb_gulshan_1',
    name: 'Standard Chartered Priority ATM — Gulshan 1',
    bank: 'SCB',
    address: 'Gulshan Avenue, Gulshan 1',
    area: 'Gulshan 1, Dhaka',
    latitude: 23.7785,
    longitude: 90.4168,
    capabilities: ['CASH_WITHDRAWAL', 'VISA_MASTERCARD', 'AMEX', 'OPEN_24_7'],
    cashStatus: 'CASH_AVAILABLE',
    boothCount: 3,
    helplinePhone: '16233',
  },
  {
    id: 'atm_brac_banani_11',
    name: 'BRAC Bank CRM & ATM — Banani 11',
    bank: 'BRAC',
    address: 'Block D, Road 11, Banani',
    area: 'Banani, Dhaka',
    latitude: 23.7925,
    longitude: 90.4045,
    capabilities: ['CASH_WITHDRAWAL', 'CASH_DEPOSIT_CRM', 'FAST_TRACK', 'NPSB', 'OPEN_24_7'],
    cashStatus: 'CASH_AVAILABLE',
    boothCount: 3,
    helplinePhone: '16221',
  },
  {
    id: 'atm_ucb_uttara_3',
    name: 'UCB ATM & Upay Hub — Uttara Sector 3',
    bank: 'UCB',
    address: 'Rabindra Sarani, Sector 3, Uttara',
    area: 'Uttara, Dhaka',
    latitude: 23.8685,
    longitude: 90.3995,
    capabilities: ['CASH_WITHDRAWAL', 'CASH_DEPOSIT_CRM', 'NPSB', 'OPEN_24_7'],
    cashStatus: 'CASH_AVAILABLE',
    boothCount: 2,
    helplinePhone: '16419',
  },
  {
    id: 'atm_sonali_motijheel',
    name: 'Sonali Bank Principal ATM — Motijheel',
    bank: 'SONALI',
    address: 'Motijheel Commercial Area, Dhaka',
    area: 'Motijheel, Dhaka',
    latitude: 23.7312,
    longitude: 90.4182,
    capabilities: ['CASH_WITHDRAWAL', 'NPSB', 'OPEN_24_7'],
    cashStatus: 'CASH_AVAILABLE',
    boothCount: 4,
    helplinePhone: '16639',
  },
];

export const DEFAULT_FILTERS: AtmFilterOptions = {
  selectedBanks: [],
  maxDistanceKm: 0, // 0 = unlimited / all
  onlyCrmDeposit: false,
  onlyFastTrack: false,
  searchQuery: '',
};

interface AtmState {
  atms: AtmLocation[];
  userLocation: UserCoordinates;
  isLocationPermissionGranted: boolean;
  isLoadingLocation: boolean;
  filters: AtmFilterOptions;
  selectedAtmId: string | null;

  // Actions
  loadData: () => Promise<void>;
  requestUserLocation: () => Promise<void>;
  setUserLocation: (coords: UserCoordinates) => void;
  setFilters: (filters: Partial<AtmFilterOptions>) => void;
  resetFilters: () => void;
  setSelectedAtmId: (id: string | null) => void;
  updateAtmCashStatus: (atmId: string, status: AtmCashStatus) => Promise<void>;

  // Getters
  getFilteredAtms: () => AtmLocation[];
  getNearestAtm: () => AtmLocation | null;
}

export const useAtmStore = create<AtmState>((set, get) => ({
  atms: SEED_ATMS,
  userLocation: DEFAULT_USER_COORDS,
  isLocationPermissionGranted: false,
  isLoadingLocation: false,
  filters: DEFAULT_FILTERS,
  selectedAtmId: null,

  loadData: async () => {
    try {
      const raw = await getStorageItem(ATM_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          set({ atms: parsed });
        }
      }
      // Request location quietly
      void get().requestUserLocation();
    } catch (e) {
      console.warn('Failed to load ATM cache:', e);
    }
  },

  requestUserLocation: async () => {
    try {
      set({ isLoadingLocation: true });
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        set({
          isLocationPermissionGranted: false,
          isLoadingLocation: false,
          userLocation: DEFAULT_USER_COORDS,
        });
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords: UserCoordinates = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy || undefined,
      };

      set({
        userLocation: coords,
        isLocationPermissionGranted: true,
        isLoadingLocation: false,
      });
    } catch (err) {
      console.warn('Location request error:', err);
      set({
        userLocation: DEFAULT_USER_COORDS,
        isLoadingLocation: false,
      });
    }
  },

  setUserLocation: (coords) => {
    set({ userLocation: coords });
  },

  setFilters: (newFilters) => {
    const updated = { ...get().filters, ...newFilters };
    set({ filters: updated });
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },

  resetFilters: () => {
    set({ filters: DEFAULT_FILTERS });
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },

  setSelectedAtmId: (id) => {
    set({ selectedAtmId: id });
    if (id) {
      void Haptics.selectionAsync().catch(() => {});
    }
  },

  updateAtmCashStatus: async (atmId, status) => {
    const updated = get().atms.map((a) =>
      a.id === atmId ? { ...a, cashStatus: status, lastReportedTime: Date.now() } : a
    );
    set({ atms: updated });
    await setStorageItem(ATM_STORAGE_KEY, JSON.stringify(updated));
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },

  getFilteredAtms: () => {
    const { atms, userLocation, filters } = get();
    const query = filters.searchQuery.toLowerCase().trim();

    return atms
      .map((atm) => {
        const dist = getDistanceMeters(
          userLocation.latitude,
          userLocation.longitude,
          atm.latitude,
          atm.longitude
        );
        return { ...atm, distanceMeters: dist };
      })
      .filter((atm) => {
        // Bank Filter
        if (filters.selectedBanks.length > 0) {
          if (!filters.selectedBanks.includes(atm.bank)) return false;
        }

        // CRM Filter
        if (filters.onlyCrmDeposit) {
          if (!atm.capabilities.includes('CASH_DEPOSIT_CRM')) return false;
        }

        // FastTrack Filter
        if (filters.onlyFastTrack) {
          if (!atm.capabilities.includes('FAST_TRACK')) return false;
        }

        // Distance Radius Filter
        if (filters.maxDistanceKm > 0) {
          const maxMeters = filters.maxDistanceKm * 1000;
          if ((atm.distanceMeters || 0) > maxMeters) return false;
        }

        // Search Query
        if (query) {
          const matchName = atm.name.toLowerCase().includes(query);
          const matchAddress = atm.address.toLowerCase().includes(query);
          const matchArea = atm.area.toLowerCase().includes(query);
          const matchBank = atm.bank.toLowerCase().includes(query);
          if (!matchName && !matchAddress && !matchArea && !matchBank) return false;
        }

        return true;
      })
      .sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));
  },

  getNearestAtm: () => {
    const list = get().getFilteredAtms();
    return list.length > 0 ? list[0] : null;
  },
}));
