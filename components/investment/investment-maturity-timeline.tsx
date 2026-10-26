import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { INVESTMENT_CATEGORY_META } from '@/components/investment/investment-constants';
import { Vital } from '@/constants/vital-theme';
import { InvestmentItem } from '@/types/investment';

const C = Vital.colors;
const F = Vital.fonts;

interface InvestmentMaturityTimelineProps {
  items: InvestmentItem[];
  onSelectItem: (item: InvestmentItem) => void;
}

export function InvestmentMaturityTimeline({
  items,
  onSelectItem,
}: InvestmentMaturityTimelineProps) {
  const maturingItems = items
    .filter((item) => item.status === 'ACTIVE' && item.maturityDate && item.maturityDate > Date.now())
    .sort((a, b) => (a.maturityDate || 0) - (b.maturityDate || 0));

  if (maturingItems.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerTitleRow}>
          <MaterialIcons name="timeline" size={16} color="#339AF0" />
          <Text style={styles.headerLabel}>MATURITY HORIZON & SCHEDULE</Text>
        </View>
        <Text style={styles.badgeText}>{maturingItems.length} Schemes</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScroll}>
        {maturingItems.map((item) => {
          const meta = INVESTMENT_CATEGORY_META[item.category] || INVESTMENT_CATEGORY_META.OTHER;
          const daysLeft = Math.ceil(((item.maturityDate || Date.now()) - Date.now()) / (1000 * 60 * 60 * 24));
          const isSoon = daysLeft <= 90;

          const dateStr = item.maturityDate
            ? new Date(item.maturityDate).toLocaleDateString('en-GB', {
                month: 'short',
                year: 'numeric',
              })
            : '';

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => {
                void Haptics.selectionAsync().catch(() => {});
                onSelectItem(item);
              }}
              style={[
                styles.timelineCard,
                isSoon && styles.timelineCardSoon,
              ]}>
              <View style={styles.cardTop}>
                <View style={[styles.miniDot, { backgroundColor: meta.color }]} />
                <Text style={styles.catLabel}>{meta.label.split(' ')[0]}</Text>
                {isSoon && (
                  <View style={styles.soonTag}>
                    <Text style={styles.soonTagText}>SOON</Text>
                  </View>
                )}
              </View>

              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>

              <View style={styles.cardBottom}>
                <View>
                  <Text style={styles.bottomSub}>MATURITY</Text>
                  <Text style={styles.bottomVal}>৳{item.currentValue.toLocaleString()}</Text>
                </View>
                <View style={styles.daysBox}>
                  <Text style={styles.daysNumber}>{daysLeft}</Text>
                  <Text style={styles.daysSub}>days ({dateStr})</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#13191C',
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerLabel: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#339AF0',
    letterSpacing: 0.6,
  },
  badgeText: {
    fontFamily: F.medium,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  horizontalScroll: {
    gap: 10,
    paddingVertical: 2,
  },
  timelineCard: {
    width: 200,
    backgroundColor: '#181F23',
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  timelineCardSoon: {
    backgroundColor: 'rgba(255, 146, 43, 0.08)',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  catLabel: {
    fontFamily: F.bold,
    fontSize: 10,
    color: C.onSurfaceVariant,
    flex: 1,
  },
  soonTag: {
    backgroundColor: 'rgba(255, 146, 43, 0.2)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  soonTagText: {
    fontFamily: F.bold,
    fontSize: 8,
    color: '#FF922B',
  },
  itemName: {
    fontFamily: F.bold,
    fontSize: 12,
    color: C.onSurface,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  bottomSub: {
    fontFamily: F.regular,
    fontSize: 8,
    color: C.onSurfaceVariant,
    letterSpacing: 0.4,
  },
  bottomVal: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#20C997',
  },
  daysBox: {
    alignItems: 'flex-end',
  },
  daysNumber: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  daysSub: {
    fontFamily: F.regular,
    fontSize: 8,
    color: C.onSurfaceVariant,
  },
});
