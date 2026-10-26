import { ComponentProps } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { MessUtilityCategory } from '@/types/mess';

export const UTILITY_PRESETS: {
  category: MessUtilityCategory;
  title: string;
  defaultAmount: number;
  icon: ComponentProps<typeof MaterialIcons>['name'];
  color: string;
}[] = [
  {
    category: 'RENT',
    title: 'বাসা ভাড়া (Flat Rent)',
    defaultAmount: 22000,
    icon: 'home',
    color: '#38BDF8',
  },
  {
    category: 'MAID',
    title: 'কাজের বুয়ার বেতন (Cook/Maid)',
    defaultAmount: 3500,
    icon: 'cleaning-services',
    color: '#A78BFA',
  },
  {
    category: 'ELECTRICITY',
    title: 'বিদ্যুৎ বিল (DESCO/Prepaid)',
    defaultAmount: 2500,
    icon: 'bolt',
    color: '#FCC419',
  },
  {
    category: 'INTERNET',
    title: 'ওয়াই-ফাই ইন্টারনেট (Wi-Fi)',
    defaultAmount: 1200,
    icon: 'wifi',
    color: '#20C997',
  },
  {
    category: 'GAS',
    title: 'গ্যাস বিল / সিলিন্ডার (Gas)',
    defaultAmount: 1500,
    icon: 'local-fire-department',
    color: '#FF7849',
  },
  {
    category: 'SERVICE_CHARGE',
    title: 'ময়লা ও গার্ড (Service Charge)',
    defaultAmount: 800,
    icon: 'security',
    color: '#FF922B',
  },
];

export const MESS_THEME_COLORS = {
  emerald: '#20C997',
  amber: '#FF922B',
  sky: '#38BDF8',
  red: '#FF6B6B',
  gold: '#D4A017',
  surface: '#13191C',
  surfaceLight: '#181F23',
};
