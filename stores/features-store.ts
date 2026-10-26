import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { ComponentProps } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type FeatureKey =
  | 'nutrition'
  | 'fasting'
  | 'running'
  | 'deepFocus'
  | 'expenses'
  | 'routines'
  | 'todos'
  | 'medicine'
  | 'warranty'
  | 'loans'
  | 'debts'
  | 'currency'
  | 'zakat'
  | 'investments'
  | 'splitBill'
  | 'taxEstimator'
  | 'messManager'
  | 'atmRadar'
  | 'healthVault';

export interface FeatureMeta {
  key: FeatureKey;
  label: string;
  subtitle: string;
  category: 'Health & Wellness' | 'Productivity' | 'Lifestyle & Finance';
  icon: ComponentProps<typeof MaterialIcons>['name'];
  color: string;
  bgColor: string;
  badge?: string;
}

export const FEATURES_METADATA: FeatureMeta[] = [
  {
    key: 'nutrition',
    label: 'Nutrition & Macros',
    subtitle: 'Meal calories, protein targets & food logging',
    category: 'Health & Wellness',
    icon: 'restaurant',
    color: '#00B4D8',
    bgColor: 'rgba(0, 180, 216, 0.15)',
  },
  {
    key: 'fasting',
    label: 'Intermittent Fasting',
    subtitle: 'Live fast countdown, stages & milestones',
    category: 'Health & Wellness',
    icon: 'timer',
    color: '#89FE00',
    bgColor: 'rgba(137, 254, 0, 0.15)',
  },
  {
    key: 'running',
    label: 'Training & Running',
    subtitle: 'GPS pace, cardio telemetry & workout sessions',
    category: 'Health & Wellness',
    icon: 'directions-run',
    color: '#FF7849',
    bgColor: 'rgba(255, 120, 73, 0.15)',
  },
  {
    key: 'medicine',
    label: 'Medicine Cabinet',
    subtitle: 'Dose schedules, cabinet stock & reminders',
    category: 'Health & Wellness',
    icon: 'medication',
    color: '#F43F5E',
    bgColor: 'rgba(244, 63, 94, 0.15)',
  },
  {
    key: 'deepFocus',
    label: 'Deep Focus Timer',
    subtitle: 'Pomodoro intervals, soundscapes & heatmap',
    category: 'Productivity',
    icon: 'center-focus-strong',
    color: '#FCC419',
    bgColor: 'rgba(252, 196, 25, 0.18)',
  },
  {
    key: 'todos',
    label: 'Tasks & Todos',
    subtitle: 'Priority checklist, daily matrix & task planner',
    category: 'Productivity',
    icon: 'checklist',
    color: '#38BDF8',
    bgColor: 'rgba(56, 189, 248, 0.15)',
  },
  {
    key: 'routines',
    label: 'Habits & Routines',
    subtitle: 'Daily rituals, streak counters & auto logs',
    category: 'Lifestyle & Finance',
    icon: 'fact-check',
    color: '#A78BFA',
    bgColor: 'rgba(167, 139, 250, 0.15)',
  },
  {
    key: 'expenses',
    label: 'Expenses & Budget',
    subtitle: 'Monthly limits, spending heatmap & savings',
    category: 'Lifestyle & Finance',
    icon: 'account-balance-wallet',
    color: '#20C997',
    bgColor: 'rgba(32, 201, 151, 0.15)',
  },
  {
    key: 'warranty',
    label: 'Warranty Wallet',
    subtitle: 'Receipt vaults, claim trackers & expiry countdowns',
    category: 'Lifestyle & Finance',
    icon: 'verified-user',
    color: '#FF922B',
    bgColor: 'rgba(255, 146, 43, 0.15)',
  },
  {
    key: 'loans',
    label: 'Loans & EMI Manager',
    subtitle: 'Interactive EMI calculator, amortization & loan tracker',
    category: 'Lifestyle & Finance',
    icon: 'calculate',
    color: '#339AF0',
    bgColor: 'rgba(51, 154, 240, 0.15)',
  },
  {
    key: 'debts',
    label: 'Debt & Udhaar Tracker',
    subtitle: 'Track money lent and borrowed with repayment logs',
    category: 'Lifestyle & Finance',
    icon: 'swap-horiz',
    color: '#51CF66',
    bgColor: 'rgba(81, 207, 102, 0.15)',
  },
  {
    key: 'currency',
    label: 'Currency & Remittance',
    subtitle: 'Live exchange rates, BDT conversion & remittance bonus',
    category: 'Lifestyle & Finance',
    icon: 'currency-exchange',
    color: '#FF922B',
    bgColor: 'rgba(255, 146, 43, 0.15)',
  },
  {
    key: 'zakat',
    label: 'Zakat & Nisab Calculator',
    subtitle: 'Nisab thresholds, gold rates & 2.5% Islamic charity engine',
    category: 'Lifestyle & Finance',
    icon: 'auto-awesome',
    color: '#D4A017',
    bgColor: 'rgba(212, 160, 23, 0.15)',
  },
  {
    key: 'investments',
    label: 'Investment Vault & DPS',
    subtitle: 'DPS, Fixed Deposits, Sanchay Patra & Stocks portfolio',
    category: 'Lifestyle & Finance',
    icon: 'insights',
    color: '#20C997',
    bgColor: 'rgba(32, 201, 151, 0.15)',
  },
  {
    key: 'splitBill',
    label: 'Group Bill Splitter',
    subtitle: 'Restaurant VAT, Service charge, dish split & Udhaar sync',
    category: 'Lifestyle & Finance',
    icon: 'call-split',
    color: '#38BDF8',
    bgColor: 'rgba(56, 189, 248, 0.15)',
  },
  {
    key: 'taxEstimator',
    label: 'Income Tax & Rebate',
    subtitle: 'Finance Act 2024-25, 15% investment rebate & salary TDS',
    category: 'Lifestyle & Finance',
    icon: 'account-balance',
    color: '#D4A017',
    bgColor: 'rgba(212, 160, 23, 0.15)',
  },
  {
    key: 'messManager',
    label: 'Bachelor Mess & Flat',
    subtitle: 'Dynamic meal rate, grocery bazaar, flat rent & roommate ledger',
    category: 'Lifestyle & Finance',
    icon: 'apartment',
    color: '#38BDF8',
    bgColor: 'rgba(56, 189, 248, 0.15)',
  },
  {
    key: 'atmRadar',
    label: 'Nearby ATM & Cash Radar',
    subtitle: 'Live GPS distance, CRM deposit booths & 1-tap navigation',
    category: 'Lifestyle & Finance',
    icon: 'local-atm',
    color: '#20C997',
    bgColor: 'rgba(32, 201, 151, 0.15)',
  },
  {
    key: 'healthVault',
    label: 'Family Health Vault & OS',
    subtitle: 'Prescriptions, care timeline, doctor directory & medical spend',
    category: 'Health & Wellness',
    icon: 'health-and-safety',
    color: '#38BDF8',
    bgColor: 'rgba(56, 189, 248, 0.15)',
  },
];


export const DEFAULT_ENABLED_FEATURES: Record<FeatureKey, boolean> = {
  nutrition: true,
  fasting: true,
  running: true,
  deepFocus: true,
  expenses: true,
  routines: true,
  todos: true,
  medicine: true,
  warranty: true,
  loans: true,
  debts: true,
  currency: true,
  zakat: true,
  investments: true,
  splitBill: true,
  taxEstimator: true,
  messManager: true,
  atmRadar: true,
  healthVault: true,
};

const FEATURES_STORAGE_KEY = 'vital_app_enabled_features_v1';

async function getStoredFeatures(): Promise<Record<FeatureKey, boolean>> {
  try {
    let raw: string | null = null;
    if (Platform.OS === 'web') {
      raw = localStorage.getItem(FEATURES_STORAGE_KEY);
    } else {
      raw = await SecureStore.getItemAsync(FEATURES_STORAGE_KEY);
    }
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_ENABLED_FEATURES, ...parsed };
    }
    return { ...DEFAULT_ENABLED_FEATURES };
  } catch {
    return { ...DEFAULT_ENABLED_FEATURES };
  }
}

async function saveStoredFeatures(features: Record<FeatureKey, boolean>): Promise<void> {
  try {
    const raw = JSON.stringify(features);
    if (Platform.OS === 'web') {
      localStorage.setItem(FEATURES_STORAGE_KEY, raw);
      return;
    }
    await SecureStore.setItemAsync(FEATURES_STORAGE_KEY, raw);
  } catch (err) {
    console.warn('Failed to save features preferences to storage:', err);
  }
}

interface FeaturesState {
  features: Record<FeatureKey, boolean>;
  isLoading: boolean;

  // Actions
  loadFeatures: () => Promise<void>;
  toggleFeature: (key: FeatureKey) => void;
  setFeature: (key: FeatureKey, enabled: boolean) => void;
  enableAll: () => void;
  resetDefaults: () => void;
  isFeatureEnabled: (key: FeatureKey) => boolean;
}

export const useFeaturesStore = create<FeaturesState>((set, get) => ({
  features: { ...DEFAULT_ENABLED_FEATURES },
  isLoading: true,

  loadFeatures: async () => {
    try {
      const stored = await getStoredFeatures();
      set({ features: stored, isLoading: false });
    } catch {
      set({ features: { ...DEFAULT_ENABLED_FEATURES }, isLoading: false });
    }
  },

  toggleFeature: (key: FeatureKey) => {
    const current = get().features;
    const updated = { ...current, [key]: !current[key] };

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    set({ features: updated });
    void saveStoredFeatures(updated);
  },

  setFeature: (key: FeatureKey, enabled: boolean) => {
    const current = get().features;
    const updated = { ...current, [key]: enabled };

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    set({ features: updated });
    void saveStoredFeatures(updated);
  },

  enableAll: () => {
    const updated: Record<FeatureKey, boolean> = {
      nutrition: true,
      fasting: true,
      running: true,
      deepFocus: true,
      expenses: true,
      routines: true,
      todos: true,
      medicine: true,
      warranty: true,
      loans: true,
      debts: true,
      currency: true,
      zakat: true,
      investments: true,
      splitBill: true,
      taxEstimator: true,
      messManager: true,
      atmRadar: true,
      healthVault: true,
    };
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    set({ features: updated });
    void saveStoredFeatures(updated);
  },

  resetDefaults: () => {
    const updated = { ...DEFAULT_ENABLED_FEATURES };
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    set({ features: updated });
    void saveStoredFeatures(updated);
  },

  isFeatureEnabled: (key: FeatureKey) => {
    return Boolean(get().features[key]);
  },
}));
