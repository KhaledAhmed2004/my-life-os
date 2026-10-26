import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Vital } from '@/constants/vital-theme';
import { TaxSlabBreakdown } from '@/types/tax';

const C = Vital.colors;
const F = Vital.fonts;

const SLAB_COLORS: Record<number, string> = {
  0: '#20C997', // Emerald for tax free
  5: '#38BDF8', // Sky Blue
  10: '#FCC419', // Gold
  15: '#FF922B', // Warm Orange
  20: '#FF6B6B', // Red
  25: '#C084FC', // Purple
};

interface TaxSlabProgressBarProps {
  slabs: TaxSlabBreakdown[];
  totalTaxableIncome: number;
}

export function TaxSlabProgressBar({ slabs, totalTaxableIncome }: TaxSlabProgressBarProps) {
  if (!slabs || slabs.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <MaterialIcons name="auto-graph" size={14} color="#38BDF8" />
          <Text style={styles.headerTitle}>PROGRESSIVE TAX SLABS BREAKDOWN</Text>
        </View>
        <Text style={styles.taxableTotal}>
          Taxable: ৳{totalTaxableIncome.toLocaleString()}
        </Text>
      </View>

      {/* Visual Multi-Segment Bar */}
      <View style={styles.multiBar}>
        {slabs.map((s, idx) => {
          const flexVal = Math.max(1, s.taxableAmountInSlab);
          const color = SLAB_COLORS[s.slabRate] || '#20C997';
          return (
            <View
              key={idx}
              style={[
                styles.barSegment,
                {
                  flex: flexVal,
                  backgroundColor: color,
                },
              ]}
            />
          );
        })}
      </View>

      {/* Slabs List Breakdown */}
      <View style={styles.slabsList}>
        {slabs.map((s, idx) => {
          const color = SLAB_COLORS[s.slabRate] || '#20C997';
          return (
            <View key={idx} style={styles.slabRow}>
              <View style={styles.slabLeft}>
                <View style={[styles.colorDot, { backgroundColor: color }]} />
                <Text style={styles.slabLabel}>{s.slabLabel}</Text>
              </View>

              <View style={styles.slabRight}>
                <Text style={styles.slabTaxable}>
                  ৳{s.taxableAmountInSlab.toLocaleString()}
                </Text>
                <Text style={[styles.slabTax, { color: s.taxForSlab > 0 ? color : C.onSurfaceVariant }]}>
                  {s.taxForSlab > 0 ? `+৳${s.taxForSlab.toLocaleString()}` : '৳০ (Free)'}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#181F23',
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#38BDF8',
    letterSpacing: 0.6,
  },
  taxableTotal: {
    fontFamily: F.medium,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  multiBar: {
    height: 8,
    flexDirection: 'row',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#263035',
    gap: 2,
  },
  barSegment: {
    height: '100%',
    borderRadius: 2,
  },
  slabsList: {
    gap: 6,
    paddingTop: 4,
  },
  slabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  slabLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  colorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  slabLabel: {
    fontFamily: F.medium,
    fontSize: 11,
    color: C.onSurface,
  },
  slabRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  slabTaxable: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  slabTax: {
    fontFamily: F.bold,
    fontSize: 11,
    minWidth: 60,
    textAlign: 'right',
  },
});
