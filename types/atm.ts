export type BankCode =
  | 'DBBL'
  | 'BRAC'
  | 'CITY'
  | 'IBBL'
  | 'EBL'
  | 'SCB'
  | 'UCB'
  | 'SONALI'
  | 'BKASH_PRIORITY';

export type AtmCapability =
  | 'CASH_WITHDRAWAL'
  | 'CASH_DEPOSIT_CRM'
  | 'FAST_TRACK'
  | 'NPSB'
  | 'VISA_MASTERCARD'
  | 'AMEX'
  | 'OPEN_24_7'
  | 'WHEELCHAIR_ACCESSIBLE';

export type AtmCashStatus =
  | 'CASH_AVAILABLE'
  | 'LOW_CASH'
  | 'OUT_OF_CASH'
  | 'UNKNOWN';

export interface AtmLocation {
  id: string;
  name: string;
  bank: BankCode;
  address: string;
  area: string; // e.g. "Dhanmondi, Dhaka"
  latitude: number;
  longitude: number;
  capabilities: AtmCapability[];
  cashStatus: AtmCashStatus;
  boothCount: number;
  helplinePhone: string;
  distanceMeters?: number; // Dynamically calculated from user GPS
  lastReportedTime?: number;
}

export interface AtmFilterOptions {
  selectedBanks: BankCode[];
  maxDistanceKm: number; // 0.5, 1, 2, 5, 10, 0 (all)
  onlyCrmDeposit: boolean;
  onlyFastTrack: boolean;
  searchQuery: string;
}

export interface UserCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}
