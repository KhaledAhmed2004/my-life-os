export type WarrantyCategory =
  | 'ELECTRONICS'
  | 'APPLIANCES'
  | 'VEHICLES'
  | 'FURNITURE'
  | 'GADGETS'
  | 'OTHER';

export type WarrantyType =
  | 'MANUFACTURER'
  | 'EXTENDED'
  | 'STORE_WARRANTY'
  | 'LIFETIME';

export type WarrantyStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';

export type ClaimStatus = 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'RESOLVED' | 'REJECTED';

export interface WarrantyClaim {
  id: string;
  claimDate: string; // YYYY-MM-DD
  issueDescription: string;
  status: ClaimStatus;
  repairCenter?: string;
  costCovered?: number;
  outOfPocketCost?: number;
  claimNotes?: string;
  resolvedDate?: string;
}

export interface WarrantyItem {
  id: string;
  productName: string;
  brand: string;
  modelNumber?: string;
  serialNumber?: string;
  category: WarrantyCategory;
  purchaseDate: string; // YYYY-MM-DD
  purchasePrice: number;
  storeName?: string;
  warrantyDurationMonths: number;
  warrantyStartDate: string; // YYYY-MM-DD
  warrantyEndDate: string; // YYYY-MM-DD
  warrantyType: WarrantyType;
  notes?: string;
  receiptImageUri?: string;
  warrantyCardImageUri?: string;
  claims: WarrantyClaim[];
  createdAt: string;
  updatedAt: string;
}

export interface WarrantyStats {
  totalItems: number;
  activeCount: number;
  expiringSoonCount: number;
  expiredCount: number;
  totalProtectedValue: number;
  totalClaimsCount: number;
  totalClaimsSaved: number;
}
