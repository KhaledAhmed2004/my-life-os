import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { getCategoryById } from '@/constants/expense-categories';
import { Spacing } from '@/constants/theme';
import { Transaction } from '@/types/expense';
import { formatCurrency, formatDate } from '@/lib/formatters';

interface TransactionItemProps {
  transaction: Transaction;
  onDelete?: (id: string) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onDelete }) => {
  const category = getCategoryById(transaction.categoryId);
  const isIncome = transaction.type === 'INCOME';

  return (
    <View style={styles.container}>
      {/* Category Icon Badge */}
      <View style={[styles.iconContainer, { backgroundColor: category.bgColor }]}>
        <ThemedText style={styles.categoryEmoji}>{category.icon}</ThemedText>
      </View>

      {/* Main Details */}
      <View style={styles.content}>
        <ThemedText type="smallBold" numberOfLines={1} style={styles.title}>
          {transaction.title}
        </ThemedText>
        <View style={styles.metaRow}>
          <ThemedText themeColor="textSecondary" style={styles.dateText}>
            {formatDate(transaction.date)}
          </ThemedText>
          <View style={styles.badge}>
            <ThemedText style={styles.badgeText}>{transaction.paymentMethod}</ThemedText>
          </View>
        </View>
      </View>

      {/* Amount & Delete */}
      <View style={styles.rightSection}>
        <ThemedText style={[styles.amountText, isIncome ? styles.incomeText : styles.expenseText]}>
          {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
        </ThemedText>

        {onDelete && (
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => onDelete(transaction.id)}
            style={styles.deleteButton}>
            <ThemedText style={styles.deleteIcon}>×</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two + 4,
    paddingHorizontal: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 128, 128, 0.15)',
    gap: Spacing.two,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    gap: Spacing.one,
  },
  title: {
    fontSize: 15,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  dateText: {
    fontSize: 12,
  },
  badge: {
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#868E96',
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
  },
  incomeText: {
    color: '#51CF66',
  },
  expenseText: {
    color: '#FF6B6B',
  },
  deleteButton: {
    paddingHorizontal: 4,
  },
  deleteIcon: {
    fontSize: 16,
    color: '#ADB5BD',
    fontWeight: '700',
  },
});
