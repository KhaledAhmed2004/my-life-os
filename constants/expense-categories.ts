import { Category, PaymentMethod, Transaction } from '@/types/expense';

export const EXPENSE_CATEGORIES: Category[] = [
  {
    id: 'food',
    name: 'Food & Dining',
    type: 'EXPENSE',
    icon: '🍔',
    color: '#FF6B6B',
    bgColor: '#382020',
  },
  {
    id: 'supplements',
    name: 'Supplements & Health',
    type: 'EXPENSE',
    icon: '💊',
    color: '#4DABF7',
    bgColor: '#1A2938',
  },
  {
    id: 'gym',
    name: 'Gym & Fitness Gear',
    type: 'EXPENSE',
    icon: '🏋️',
    color: '#51CF66',
    bgColor: '#1C3324',
  },
  {
    id: 'shopping',
    name: 'Shopping & Apparel',
    type: 'EXPENSE',
    icon: '🛍️',
    color: '#CC5DE8',
    bgColor: '#331F3B',
  },
  {
    id: 'transport',
    name: 'Transportation',
    type: 'EXPENSE',
    icon: '🚗',
    color: '#FF922B',
    bgColor: '#3B291A',
  },
  {
    id: 'bills',
    name: 'Bills & Utilities',
    type: 'EXPENSE',
    icon: '⚡',
    color: '#FCC419',
    bgColor: '#3B3417',
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    type: 'EXPENSE',
    icon: '🎬',
    color: '#20C997',
    bgColor: '#16332A',
  },
  {
    id: 'transfer',
    name: 'Money transfer',
    type: 'INCOME',
    icon: '👤',
    color: '#89FE00',
    bgColor: '#1B331A',
  },
  {
    id: 'games',
    name: 'Games & Digital',
    type: 'EXPENSE',
    icon: '🎮',
    color: '#A78BFA',
    bgColor: '#2B1C47',
  },
  {
    id: 'jewelry',
    name: 'Jewelry & Gifts',
    type: 'EXPENSE',
    icon: '💎',
    color: '#F472B6',
    bgColor: '#381628',
  },
  {
    id: 'other_expense',
    name: 'Other Expense',
    type: 'EXPENSE',
    icon: '📦',
    color: '#ADB5BD',
    bgColor: '#26292E',
  },
];

export const INCOME_CATEGORIES: Category[] = [
  {
    id: 'transfer_in',
    name: 'Money transfer',
    type: 'INCOME',
    icon: '👤',
    color: '#89FE00',
    bgColor: '#1B331A',
  },
  {
    id: 'salary',
    name: 'Salary & Earnings',
    type: 'INCOME',
    icon: '💰',
    color: '#40C057',
    bgColor: '#183B20',
  },
  {
    id: 'freelance',
    name: 'Coaching & Freelance',
    type: 'INCOME',
    icon: '💻',
    color: '#22B8CF',
    bgColor: '#153338',
  },
  {
    id: 'investment',
    name: 'Investments & Returns',
    type: 'INCOME',
    icon: '📈',
    color: '#845EF7',
    bgColor: '#271E42',
  },
  {
    id: 'other_income',
    name: 'Other Income',
    type: 'INCOME',
    icon: '💵',
    color: '#51CF66',
    bgColor: '#1C3324',
  },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const CATEGORY_VECTOR_ICONS: Record<string, string> = {
  food: 'restaurant',
  supplements: 'medical-services',
  gym: 'fitness-center',
  shopping: 'shopping-bag',
  transport: 'directions-car',
  bills: 'bolt',
  entertainment: 'theaters',
  transfer: 'swap-horiz',
  transfer_in: 'payments',
  games: 'sports-esports',
  jewelry: 'diamond',
  other_expense: 'inventory-2',
  salary: 'account-balance-wallet',
  freelance: 'laptop-mac',
  investment: 'trending-up',
  other_income: 'attach-money',
};

export function getCategoryVectorIcon(categoryId: string): string {
  return CATEGORY_VECTOR_ICONS[categoryId] || 'category';
}

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'CASH', label: 'Cash', icon: '💵' },
  { id: 'CARD', label: 'Card', icon: '💳' },
  { id: 'BANK', label: 'Bank Transfer', icon: '🏦' },
  { id: 'WALLET', label: 'Digital Wallet', icon: '📱' },
  { id: 'OTHER', label: 'Other', icon: '🏷️' },
];

export function getCategoryById(id: string): Category {
  const found = ALL_CATEGORIES.find((cat) => cat.id === id);
  return (
    found || {
      id: 'unknown',
      name: 'General',
      type: 'EXPENSE',
      icon: '📝',
      color: '#ADB5BD',
      bgColor: '#26292E',
    }
  );
}

function getTodayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getYesterdayStr(): string {
  const d = new Date(Date.now() - 86400000);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDaysAgoStr(days: number): string {
  const d = new Date(Date.now() - days * 86400000);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const SEED_TRANSACTIONS: Transaction[] = [
  // TODAY
  {
    id: 'tx-today-1',
    title: 'Kipper A.',
    amount: 1000.0,
    type: 'INCOME',
    categoryId: 'transfer_in',
    date: getTodayStr(),
    paymentMethod: 'BANK',
    notes: 'Money transfer',
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'tx-today-2',
    title: 'Mgnet',
    amount: 3194.0,
    type: 'EXPENSE',
    categoryId: 'food',
    date: getTodayStr(),
    paymentMethod: 'CARD',
    notes: 'Supermarkets',
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'tx-today-3',
    title: 'Steam',
    amount: 2900.0,
    type: 'EXPENSE',
    categoryId: 'games',
    date: getTodayStr(),
    paymentMethod: 'CARD',
    notes: 'Games',
    createdAt: Date.now() - 3600000 * 6,
  },

  // YESTERDAY
  {
    id: 'tx-yest-1',
    title: 'Marinov P.',
    amount: 4900.0,
    type: 'INCOME',
    categoryId: 'transfer_in',
    date: getYesterdayStr(),
    paymentMethod: 'BANK',
    notes: 'Money transfer',
    createdAt: Date.now() - 86400000 - 3600000 * 2,
  },
  {
    id: 'tx-yest-2',
    title: 'GetJew',
    amount: 10120.0,
    type: 'EXPENSE',
    categoryId: 'jewelry',
    date: getYesterdayStr(),
    paymentMethod: 'CARD',
    notes: 'Jewelry',
    createdAt: Date.now() - 86400000 - 3600000 * 5,
  },

  // PREVIOUS DAYS
  {
    id: 'tx-prev-1',
    title: 'Optimum Nutrition Creatine & Whey',
    amount: 8500.0,
    type: 'EXPENSE',
    categoryId: 'supplements',
    date: getDaysAgoStr(3),
    paymentMethod: 'CARD',
    notes: 'Supplements & Health',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'tx-prev-2',
    title: 'Fitness Club Premium Membership',
    amount: 15000.0,
    type: 'EXPENSE',
    categoryId: 'gym',
    date: getDaysAgoStr(5),
    paymentMethod: 'BANK',
    notes: 'Gym & Fitness Gear',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'tx-prev-3',
    title: 'Monthly Salary Deposit',
    amount: 135434.0,
    type: 'INCOME',
    categoryId: 'salary',
    date: getDaysAgoStr(7),
    paymentMethod: 'BANK',
    notes: 'Salary & Earnings',
    createdAt: Date.now() - 86400000 * 7,
  },
];
