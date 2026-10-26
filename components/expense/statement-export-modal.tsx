import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Vital } from '@/constants/vital-theme';
import { useExpenseStore } from '@/stores/expense-store';
import { useSavingsStore } from '@/stores/savings-store';

const C = Vital.colors;
const F = Vital.fonts;

interface StatementExportModalProps {
  visible: boolean;
  onClose: () => void;
}

export function StatementExportModal({ visible, onClose }: StatementExportModalProps) {
  const insets = useSafeAreaInsets();
  const transactions = useExpenseStore((s) => s.transactions);
  const getTotals = useExpenseStore((s) => s.getTotals);
  const getCategoryBreakdown = useExpenseStore((s) => s.getCategoryBreakdown);
  const savingsGoals = useSavingsStore((s) => s.goals);
  const getPortfolioStats = useSavingsStore((s) => s.getPortfolioStats);

  const [copied, setCopied] = useState(false);

  const { totalIncome, totalExpense, netBalance } = getTotals();
  const savingsStats = getPortfolioStats();
  const breakdown = getCategoryBreakdown();

  const formattedCsv = useMemo(() => {
    const headers = 'ID,Date,Title,Type,Category,Amount_RUB,PaymentMethod,Notes\n';
    const rows = transactions
      .map((t) => {
        const cleanTitle = `"${t.title.replace(/"/g, '""')}"`;
        const cleanNotes = `"${(t.notes || '').replace(/"/g, '""')}"`;
        return `${t.id},${t.date},${cleanTitle},${t.type},${t.categoryId},${t.amount},${t.paymentMethod},${cleanNotes}`;
      })
      .join('\n');
    return headers + rows;
  }, [transactions]);

  const fullStatementSummary = useMemo(() => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const incomeVal = totalIncome || 0;
    const expenseVal = totalExpense || 0;
    const balanceVal = netBalance || 0;
    const savedVal = savingsStats?.totalSaved || 0;
    const netWorthVal = balanceVal + savedVal;

    let text = `=====================================\n`;
    text += `📊 TRACKME / VITAL FINANCIAL STATEMENT\n`;
    text += `Generated: ${dateStr}\n`;
    text += `=====================================\n\n`;

    text += `💰 CAPITAL SUMMARY:\n`;
    text += `• Total Income: +${incomeVal.toLocaleString('en-US')} ৳\n`;
    text += `• Total Expenses: -${expenseVal.toLocaleString('en-US')} ৳\n`;
    text += `• Spendable Wallet Balance: ${balanceVal.toLocaleString('en-US')} ৳\n`;
    text += `• Stored in Wealth Vaults: ${savedVal.toLocaleString('en-US')} ৳\n`;
    text += `• Total Net Worth: ${netWorthVal.toLocaleString('en-US')} ৳\n\n`;

    text += `🏷️ TOP EXPENSE CATEGORIES:\n`;
    if (breakdown && breakdown.length > 0) {
      breakdown.forEach((c) => {
        const catName = c?.category?.name || 'Category';
        const total = c?.totalAmount || 0;
        const pct = (c?.percentage || 0).toFixed(0);
        text += `• ${catName}: ${total.toLocaleString('en-US')} ৳ (${pct}% of total)\n`;
      });
    } else {
      text += `• No expense records\n`;
    }

    text += `\n🐷 SAVINGS GOALS PROGRESS:\n`;
    if (savingsGoals && savingsGoals.length > 0) {
      savingsGoals.forEach((g) => {
        const current = g?.currentAmount || 0;
        const target = g?.targetAmount || 0;
        const pct = target > 0 ? ((current / target) * 100).toFixed(0) : '0';
        text += `• ${g?.icon || '🎯'} ${g?.name || 'Goal'}: ${current.toLocaleString('en-US')} / ${target.toLocaleString('en-US')} ৳ (${pct}%)\n`;
      });
    } else {
      text += `• No active vaults\n`;
    }

    text += `\n=====================================\n`;
    text += `📄 RAW CSV TRANSACTION DATA:\n`;
    text += `=====================================\n`;
    text += formattedCsv;

    return text;
  }, [totalIncome, totalExpense, netBalance, savingsStats, breakdown, savingsGoals, formattedCsv]);

  const handleShare = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    try {
      await Share.share({
        title: 'TrackMe Financial Statement',
        message: fullStatementSummary,
      });
    } catch {}
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheetContainer,
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}>
          {/* HEADER */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.sheetTitle}>Export Financial Statement</Text>
              <Text style={styles.sheetSubtitle}>
                Download, share, or backup CSV & financial summary
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={10}>
              <MaterialIcons name="close" size={20} color={C.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {/* STATEMENT AUDIT STATS BENTO */}
            <View style={styles.auditBento}>
              <View style={styles.auditCol}>
                <Text style={styles.auditLabel}>TRANSACTIONS</Text>
                <Text style={styles.auditValue}>{transactions.length} Records</Text>
              </View>
              <View style={styles.auditCol}>
                <Text style={styles.auditLabel}>SPENDABLE CASH</Text>
                <Text style={styles.auditValueGreen}>
                  {netBalance.toLocaleString('en-US').replace(/,/g, ' ')} ৳
                </Text>
              </View>
              <View style={styles.auditCol}>
                <Text style={styles.auditLabel}>VAULT ASSETS</Text>
                <Text style={styles.auditValueLime}>
                  {savingsStats.totalSaved.toLocaleString('en-US').replace(/,/g, ' ')} ৳
                </Text>
              </View>
            </View>

            {/* CSV PREVIEW SNIPPET */}
            <Text style={styles.sectionTitle}>PREVIEW STATEMENT & CSV DATA</Text>
            <View style={styles.previewBox}>
              <ScrollView nestedScrollEnabled style={styles.previewScroll}>
                <Text style={styles.previewCode}>{fullStatementSummary}</Text>
              </ScrollView>
            </View>
          </ScrollView>

          {/* ACTION BUTTONS */}
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleShare}
              style={styles.shareBtn}>
              <MaterialIcons name="ios-share" size={18} color="#101416" />
              <Text style={styles.shareBtnText}>Share / Export Statement</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#161A1D',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  sheetTitle: {
    fontFamily: F.sansBold,
    fontSize: 18,
    color: C.onSurface,
  },
  sheetSubtitle: {
    fontFamily: F.sans,
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  auditBento: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: C.surfaceContainer,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: C.glassBorder,
  },
  auditCol: {
    gap: 2,
  },
  auditLabel: {
    fontFamily: F.sansBold,
    fontSize: 9,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  auditValue: {
    fontFamily: F.sansBold,
    fontSize: 14,
    color: C.onSurface,
  },
  auditValueGreen: {
    fontFamily: F.sansBold,
    fontSize: 14,
    color: '#20C997',
  },
  auditValueLime: {
    fontFamily: F.sansBold,
    fontSize: 14,
    color: '#C8F135',
  },
  sectionTitle: {
    fontFamily: F.sansBold,
    fontSize: 10,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  previewBox: {
    backgroundColor: '#0D1013',
    borderRadius: 16,
    padding: 12,
    maxHeight: 220,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  previewScroll: {
    flex: 1,
  },
  previewCode: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: 15,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C8F135',
    borderRadius: 18,
    paddingVertical: 14,
    gap: 8,
    shadowColor: '#C8F135',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  shareBtnText: {
    fontFamily: F.sansBold,
    fontSize: 15,
    color: '#101416',
  },
});
