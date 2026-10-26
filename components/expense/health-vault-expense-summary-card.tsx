import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useHealthVaultStore } from '@/stores/health-vault-store';
import { Vital } from '@/constants/vital-theme';

const C = Vital.colors;
const F = Vital.fonts;

interface HealthVaultExpenseSummaryCardProps {
  onOpenHealthStudio: () => void;
}

export function HealthVaultExpenseSummaryCard({
  onOpenHealthStudio,
}: HealthVaultExpenseSummaryCardProps) {
  const getMedicalSpendingSummary = useHealthVaultStore((s) => s.getMedicalSpendingSummary);
  const expenses = useHealthVaultStore((s) => s.expenses);
  const members = useHealthVaultStore((s) => s.members);

  const summary = useMemo(
    () => getMedicalSpendingSummary('ALL'),
    [getMedicalSpendingSummary, expenses]
  );

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onOpenHealthStudio();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handlePress}
      style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="local-hospital" size={18} color="#F43F5E" />
          </View>
          <View>
            <Text style={styles.title}>FAMILY MEDICAL & HEALTH SPEND</Text>
            <Text style={styles.subtitle}>
              Doctor Visits, Lab Tests & Pharmacy Audit
            </Text>
          </View>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            ৳{summary.totalSpend.toLocaleString()} Total
          </Text>
        </View>
      </View>

      {/* Bento Breakdown */}
      <View style={styles.bentoRow}>
        <View style={styles.bentoItem}>
          <Text style={styles.bentoLabel}>DOCTOR FEES</Text>
          <Text style={[styles.bentoVal, { color: '#38BDF8' }]}>
            ৳{summary.doctorVisitsTotal.toLocaleString()}
          </Text>
          <Text style={styles.bentoSub}>Consultations</Text>
        </View>

        <View style={styles.bentoItem}>
          <Text style={styles.bentoLabel}>LAB DIAGNOSTICS</Text>
          <Text style={[styles.bentoVal, { color: '#20C997' }]}>
            ৳{summary.diagnosticTestsTotal.toLocaleString()}
          </Text>
          <Text style={styles.bentoSub}>CBC, Lipid & X-Rays</Text>
        </View>

        <View style={styles.bentoItem}>
          <Text style={styles.bentoLabel}>PHARMACY / MEDS</Text>
          <Text style={[styles.bentoVal, { color: '#FF922B' }]}>
            ৳{summary.medicinesTotal.toLocaleString()}
          </Text>
          <Text style={styles.bentoSub}>Prescribed Meds</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footerRow}>
        <View style={styles.footerTip}>
          <MaterialIcons name="health-and-safety" size={14} color="#F43F5E" />
          <Text style={styles.footerTipText} numberOfLines={1}>
            Full Care Timeline with 1-Tap Expense Sync
          </Text>
        </View>

        <View style={styles.chevronRow}>
          <Text style={styles.manageText}>Health Studio</Text>
          <MaterialIcons name="chevron-right" size={16} color="#F43F5E" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#13191C',
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  subtitle: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  badge: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#F43F5E',
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  bentoItem: {
    flex: 1,
    backgroundColor: '#181F23',
    borderRadius: 12,
    padding: 10,
    gap: 2,
  },
  bentoLabel: {
    fontFamily: F.bold,
    fontSize: 8,
    color: C.onSurfaceVariant,
    letterSpacing: 0.3,
  },
  bentoVal: {
    fontFamily: F.bold,
    fontSize: 13,
    marginTop: 2,
  },
  bentoSub: {
    fontFamily: F.regular,
    fontSize: 8,
    color: C.onSurfaceVariant,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  footerTip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  footerTipText: {
    fontFamily: F.medium,
    fontSize: 10,
    color: C.onSurfaceVariant,
    flex: 1,
  },
  chevronRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  manageText: {
    fontFamily: F.bold,
    fontSize: 11,
    color: '#F43F5E',
  },
});
