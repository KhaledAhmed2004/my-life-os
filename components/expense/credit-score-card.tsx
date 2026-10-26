import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Vital } from '@/constants/vital-theme';
import { useExpenseStore } from '@/stores/expense-store';

const C = Vital.colors;
const F = Vital.fonts;

/** Maps a raw factor score to a percentage for the mini progress bar. */
function factorPct(value: number, max: number) {
  return Math.min(100, Math.round((value / max) * 100));
}

/** Draws a simple segmented meter with 5 tiers as colored bands. */
function ScoreMeter({ score, color }: { score: number; color: string }) {
  // Score range: 300–850, split into 5 bands
  const bands = [
    { min: 300, max: 580, label: 'Poor', color: '#FA5252' },
    { min: 580, max: 670, label: 'Fair', color: '#FCC419' },
    { min: 670, max: 740, label: 'Good', color: '#74C0FC' },
    { min: 740, max: 800, label: 'Very Good', color: '#20C997' },
    { min: 800, max: 850, label: 'Exceptional', color: '#C8F135' },
  ];

  const totalRange = 850 - 300; // 550
  const fillPct = ((score - 300) / totalRange) * 100;

  return (
    <View style={meter.wrapper}>
      {/* Banded track */}
      <View style={meter.track}>
        {bands.map((band, i) => {
          const bandWidth = ((band.max - band.min) / totalRange) * 100;
          return (
            <View
              key={i}
              style={[
                meter.bandSegment,
                {
                  width: `${bandWidth}%`,
                  backgroundColor:
                    score >= band.min ? band.color + 'CC' : 'rgba(255,255,255,0.07)',
                },
              ]}
            />
          );
        })}
      </View>
      {/* Needle marker */}
      <View style={[meter.needle, { left: `${Math.min(98, Math.max(1, fillPct))}%` }]}>
        <View style={[meter.needlePip, { backgroundColor: color }]} />
      </View>
      {/* Range labels */}
      <View style={meter.rangeRow}>
        <Text style={meter.rangeLabel}>300</Text>
        <Text style={meter.rangeLabel}>850</Text>
      </View>
    </View>
  );
}

export function CreditScoreCard() {
  const getCreditScore = useExpenseStore((s) => s.getCreditScore);
  const credit = getCreditScore();

  const [expanded, setExpanded] = useState(false);

  const tierIcon: Record<string, string> = {
    EXCEPTIONAL: 'diamond',
    VERY_GOOD: 'bolt',
    GOOD: 'thumb-up',
    FAIR: 'warning-amber',
    POOR: 'shield',
  };

  const factors = [
    { label: 'Budget Discipline', value: credit.paymentScore, max: 35 },
    { label: 'Budget Utilization', value: credit.utilizationScore, max: 30 },
    { label: 'Savings Rate', value: credit.savingsScore, max: 20 },
    { label: 'Spending Consistency', value: credit.consistencyScore, max: 10 },
    { label: 'Income Diversity', value: credit.diversityScore, max: 5 },
  ];

  return (
    <View style={styles.card}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBox, { backgroundColor: credit.color + '1F' }]}>
            <MaterialIcons name="credit-score" size={14} color={credit.color} />
          </View>
          <View>
            <Text style={styles.cardTitle}>FINANCIAL CREDIT SCORE</Text>
            <Text style={styles.cardSubtitle}>Based on your spending behavior</Text>
          </View>
        </View>

        {/* Tier badge — tap to expand */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            setExpanded(!expanded);
          }}
          style={[
            styles.tierBadge,
            { backgroundColor: credit.color + '1F' },
          ]}>
          <MaterialIcons
            name={tierIcon[credit.tier] as any}
            size={12}
            color={credit.color}
          />
          <Text style={[styles.tierText, { color: credit.color }]}>{credit.label}</Text>
          <MaterialIcons
            name={expanded ? 'expand-less' : 'expand-more'}
            size={14}
            color={credit.color}
          />
        </TouchableOpacity>
      </View>

      {/* BIG SCORE */}
      <View style={styles.scoreBlock}>
        <Text style={[styles.scoreBig, { color: credit.color }]}>{credit.score}</Text>
        <Text style={styles.scoreRange}> / 850</Text>
      </View>

      {/* METER */}
      <ScoreMeter score={credit.score} color={credit.color} />

      {/* TIP CALLOUT */}
      <View style={styles.tipRow}>
        <MaterialIcons name="tips-and-updates" size={13} color="#FCC419" style={{ flexShrink: 0 }} />
        <Text style={styles.tipText}>{credit.tip}</Text>
      </View>

      {/* EXPANDED FACTOR BREAKDOWN */}
      {expanded && (
        <View style={styles.breakdownBox}>
          <View style={styles.breakdownHeader}>
            <Text style={styles.breakdownTitle}>SCORE BREAKDOWN</Text>
            <Text style={styles.breakdownTotal}>{credit.score} / 850</Text>
          </View>

          {factors.map((f, i) => (
            <View key={i} style={styles.factorItem}>
              <View style={styles.factorMeta}>
                <Text style={styles.factorLabel}>{f.label}</Text>
                <Text style={styles.factorVal}>
                  {f.value} / {f.max}
                </Text>
              </View>
              <View style={styles.factorTrack}>
                <View
                  style={[
                    styles.factorFill,
                    {
                      width: `${factorPct(f.value, f.max)}%`,
                      backgroundColor: credit.color,
                    },
                  ]}
                />
              </View>
            </View>
          ))}

          {/* Legend */}
          <View style={styles.legend}>
            {[
              { label: 'Poor', color: '#FA5252' },
              { label: 'Fair', color: '#FCC419' },
              { label: 'Good', color: '#74C0FC' },
              { label: 'Very Good', color: '#20C997' },
              { label: 'Exceptional', color: '#C8F135' },
            ].map((item) => (
              <View key={item.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

/* ─── Meter sub-styles ──────────────────────────────────────────────── */
const meter = StyleSheet.create({
  wrapper: {
    gap: 5,
    position: 'relative',
    paddingBottom: 2,
  },
  track: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    gap: 2,
  },
  bandSegment: {
    height: '100%',
    borderRadius: 2,
  },
  needle: {
    position: 'absolute',
    top: -3,
    alignItems: 'center',
    transform: [{ translateX: -4 }],
  },
  needlePip: {
    width: 8,
    height: 14,
    borderRadius: 2,
    opacity: 0.9,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  rangeLabel: {
    fontFamily: Vital.fonts.sansMedium,
    fontSize: 10,
    color: Vital.colors.onSurfaceVariant,
  },
});

/* ─── Card styles ───────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#13191C',
    borderRadius: 20,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flex: 1,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: Vital.fonts.sansBold,
    fontSize: 11,
    color: Vital.colors.onSurfaceVariant,
    letterSpacing: 0.7,
  },
  cardSubtitle: {
    fontFamily: Vital.fonts.sans,
    fontSize: 10,
    color: Vital.colors.onSurfaceVariant,
    marginTop: 1,
    opacity: 0.7,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9,
  },
  tierText: {
    fontFamily: Vital.fonts.sansBold,
    fontSize: 11,
  },
  scoreBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  scoreBig: {
    fontFamily: Vital.fonts.sansBold,
    fontSize: 52,
    letterSpacing: -2,
    lineHeight: 56,
  },
  scoreRange: {
    fontFamily: Vital.fonts.sansMedium,
    fontSize: 16,
    color: Vital.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  tipText: {
    fontFamily: Vital.fonts.sans,
    fontSize: 12,
    color: Vital.colors.onSurfaceVariant,
    flex: 1,
    lineHeight: 17,
  },
  breakdownBox: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    gap: 10,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownTitle: {
    fontFamily: Vital.fonts.sansBold,
    fontSize: 10,
    color: Vital.colors.onSurfaceVariant,
    letterSpacing: 0.8,
  },
  breakdownTotal: {
    fontFamily: Vital.fonts.sansBold,
    fontSize: 11,
    color: Vital.colors.onSurface,
  },
  factorItem: {
    gap: 5,
  },
  factorMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  factorLabel: {
    fontFamily: Vital.fonts.sans,
    fontSize: 12,
    color: Vital.colors.onSurface,
  },
  factorVal: {
    fontFamily: Vital.fonts.sansBold,
    fontSize: 11,
    color: Vital.colors.onSurfaceVariant,
  },
  factorTrack: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  factorFill: {
    height: '100%',
    borderRadius: 3,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontFamily: Vital.fonts.sansMedium,
    fontSize: 10,
    color: Vital.colors.onSurfaceVariant,
  },
});
