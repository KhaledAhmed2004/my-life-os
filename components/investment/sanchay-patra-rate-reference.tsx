import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { SANCHAY_PATRA_RATES } from '@/stores/investment-store';
import { SanchayPatraSubtype } from '@/types/investment';
import { Vital } from '@/constants/vital-theme';

const C = Vital.colors;
const F = Vital.fonts;

export function SanchayPatraRateReference() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          void Haptics.selectionAsync().catch(() => {});
          setIsExpanded(!isExpanded);
        }}
        style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="account-balance" size={16} color="#FF922B" />
          </View>
          <View>
            <Text style={styles.headerTitle}>BANGLADESH SANCHAY PATRA RATES</Text>
            <Text style={styles.headerSub}>Official Directorate of National Savings rates</Text>
          </View>
        </View>

        <View style={styles.togglePill}>
          <Text style={styles.toggleText}>{isExpanded ? 'Hide Rates' : 'View Rates'}</Text>
          <MaterialIcons
            name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={16}
            color="#FF922B"
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.bodyContent}>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.colHeader, { flex: 2 }]}>SCHEME</Text>
              <Text style={[styles.colHeader, { flex: 1, textAlign: 'center' }]}>TENURE</Text>
              <Text style={[styles.colHeader, { flex: 1, textAlign: 'right' }]}>RATE %</Text>
            </View>

            {(Object.keys(SANCHAY_PATRA_RATES) as SanchayPatraSubtype[]).map((key) => {
              const item = SANCHAY_PATRA_RATES[key];
              return (
                <View key={key} style={styles.tableRow}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.schemeName}>{item.label}</Text>
                    <Text style={styles.schemePayout}>{item.payout}</Text>
                  </View>
                  <Text style={styles.tenureText}>{item.defaultMonths / 12} Yrs</Text>
                  <View style={styles.rateBadge}>
                    <Text style={styles.rateText}>{item.rate}%</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.infoNote}>
            <MaterialIcons name="info-outline" size={14} color="#FF922B" />
            <Text style={styles.infoText}>
              Note: Tax at source (উৎসে কর) is usually 5% on profit up to ৳৫ লাখ, and 10% on profit exceeding ৳৫ লাখ with TIN.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#13191C',
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  headerRow: {
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
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 146, 43, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#FF922B',
    letterSpacing: 0.6,
  },
  headerSub: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  togglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 146, 43, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 2,
  },
  toggleText: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#FF922B',
  },
  bodyContent: {
    paddingTop: 8,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  table: {
    gap: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  colHeader: {
    fontFamily: F.bold,
    fontSize: 9,
    color: C.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  schemeName: {
    fontFamily: F.medium,
    fontSize: 12,
    color: C.onSurface,
  },
  schemePayout: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  tenureText: {
    flex: 1,
    fontFamily: F.medium,
    fontSize: 11,
    color: C.onSurfaceVariant,
    textAlign: 'center',
  },
  rateBadge: {
    flex: 1,
    alignItems: 'flex-end',
  },
  rateText: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#FF922B',
    backgroundColor: 'rgba(255, 146, 43, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  infoNote: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#181F23',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
    lineHeight: 14,
  },
});
