import type { ComponentProps } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ClaimStatus, WarrantyCategory, WarrantyStatus, WarrantyType } from '@/types/warranty';

export interface CategoryMeta {
  label: string;
  icon: ComponentProps<typeof MaterialIcons>['name'];
  color: string;
  bgColor: string;
}

export const WARRANTY_CATEGORY_CONFIG: Record<WarrantyCategory, CategoryMeta> = {
  ELECTRONICS: {
    label: 'Electronics',
    icon: 'devices',
    color: '#38BDF8',
    bgColor: 'rgba(56, 189, 248, 0.12)',
  },
  APPLIANCES: {
    label: 'Appliances',
    icon: 'kitchen',
    color: '#A78BFA',
    bgColor: 'rgba(167, 139, 250, 0.12)',
  },
  GADGETS: {
    label: 'Gadgets & Audio',
    icon: 'headphones',
    color: '#FF922B',
    bgColor: 'rgba(255, 146, 43, 0.12)',
  },
  VEHICLES: {
    label: 'Vehicles & Auto',
    icon: 'directions-car',
    color: '#20C997',
    bgColor: 'rgba(32, 201, 151, 0.12)',
  },
  FURNITURE: {
    label: 'Furniture & Decor',
    icon: 'chair',
    color: '#FCC419',
    bgColor: 'rgba(252, 196, 25, 0.12)',
  },
  OTHER: {
    label: 'Other Items',
    icon: 'category',
    color: '#94A3B8',
    bgColor: 'rgba(148, 163, 184, 0.12)',
  },
};

export const WARRANTY_TYPE_LABELS: Record<WarrantyType, string> = {
  MANUFACTURER: 'Manufacturer Warranty',
  EXTENDED: 'Extended Protection Plan',
  STORE_WARRANTY: 'Store / Dealer Warranty',
  LIFETIME: 'Lifetime Guarantee',
};

export const STATUS_THEME: Record<
  WarrantyStatus,
  { label: string; color: string; bg: string; border: string; icon: ComponentProps<typeof MaterialIcons>['name'] }
> = {
  ACTIVE: {
    label: 'ACTIVE',
    color: '#20C997',
    bg: 'rgba(32, 201, 151, 0.12)',
    border: 'rgba(32, 201, 151, 0.28)',
    icon: 'verified',
  },
  EXPIRING_SOON: {
    label: 'EXPIRING SOON',
    color: '#FCC419',
    bg: 'rgba(252, 196, 25, 0.12)',
    border: 'rgba(252, 196, 25, 0.28)',
    icon: 'timer',
  },
  EXPIRED: {
    label: 'EXPIRED',
    color: '#FA5252',
    bg: 'rgba(250, 82, 82, 0.12)',
    border: 'rgba(250, 82, 82, 0.28)',
    icon: 'error-outline',
  },
};

export const CLAIM_STATUS_CONFIG: Record<
  ClaimStatus,
  { label: string; color: string; bg: string }
> = {
  PENDING: { label: 'Pending', color: '#FCC419', bg: 'rgba(252, 196, 25, 0.14)' },
  IN_REVIEW: { label: 'In Review', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.14)' },
  APPROVED: { label: 'Approved', color: '#20C997', bg: 'rgba(32, 201, 151, 0.14)' },
  RESOLVED: { label: 'Resolved', color: '#C8F135', bg: 'rgba(200, 241, 53, 0.14)' },
  REJECTED: { label: 'Rejected', color: '#FA5252', bg: 'rgba(250, 82, 82, 0.14)' },
};
