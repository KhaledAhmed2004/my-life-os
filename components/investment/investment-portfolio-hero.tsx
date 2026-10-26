import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { INVESTMENT_CATEGORY_META } from '@/components/investment/investment-constants';
import { RollingNumber } from '@/components/ui/rolling-number';
import { Vital } from '@/constants/vital-theme';
import { InvestmentStats } from '@/types/investment';

const C = Vital.colors;
const F = Vital.fonts;

interface InvestmentPortfolioHeroProps {
  stats: InvestmentStats;
}

export function InvestmentPortfolioHero({ stats }: InvestmentPortfolioHeroProps) {
  const isGain = stats.totalPnL >= 0;

  return (
    <View style={styles.container}>
      {/* 1. TOP TITLE */}
      <View style={styles.topHeader}>
        <View style={styles.titleRow}>
          <MaterialIcons name="insights" size={16} color="#20C997" />
          <Text style={styles.headerLabel}>PORTFOLIO MARKET VALUATION</Text>
        </View>
        <View
          style={[
            styles.pnlBadge,
            { backgroundColor: isGain ? 'rgba(32, 201, 151, 0.15)' : 'rgba(255, 107, 107, 0.15)' },
          ]}>
          <MaterialIcons
            name={isGain ? 'trending-up' : 'trending-down'}
            size={12}
            color={isGain ? '#20C997' : '#FF6B6B'}
          />
          <Text style={[styles.pnlText, { color: isGain ? '#20C997' : '#FF6B6B' }]}>
            {isGain ? '+' : ''}
            {stats.totalPnLPercent}% ({isGain ? '+' : ''}৳{Math.abs(stats.totalPnL).toLocaleString()})
          </Text>
        </View>
      </View>

      {/* 2. HERO TOTAL VALUE */}
      <View style={styles.heroValueBox}>
        <View style={styles.amountRow}>
          <Text style={styles.takaSymbol}>৳</Text>
          <RollingNumber
            value={stats.currentMarketValue}
            style={styles.heroAmountText}
          />
        </View>
        <Text style={styles.subtext}>
          Principal Invested: ৳{stats.totalInvested.toLocaleString()} • {stats.activeCount} Holdings
        </Text>
      </View>

      {/* 3. DIVERSIFICATION MULTI-SEGMENT BAR */}
      {stats.currentMarketValue > 0 && stats.categoryBreakdown.length > 0 && (
        <View style={styles.diversificationSection}>
          <View style={styles.barLabelRow}>
            <Text style={styles.diversificationTitle}>PORTFOLIO ALLOCATION</Text>
            <Text style={styles.diversificationSub}>
              {stats.categoryBreakdown.length} Asset Classes
            </Text>
          </View>

          <View style={styles.multiBar}>
            {stats.categoryBreakdown.map((cat) => {
              const meta = INVESTMENT_CATEGORY_META[cat.category] || INVESTMENT_CATEGORY_META.OTHER;
              const widthPct = Math.max(2, cat.percentage);
              return (
                <View
                  key={cat.category}
                  style={[
                    styles.barSegment,
                    {
                      flex: widthPct,
                      backgroundColor: meta.color,
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Allocation Pills */}
          <View style={styles.pillsRow}>
            {stats.categoryBreakdown.slice(0, 4).map((cat) => {
              const meta = INVESTMENT_CATEGORY_META[cat.category] || INVESTMENT_CATEGORY_META.OTHER;
              return (
                <View key={cat.category} style={styles.allocPill}>
                  <View style={[styles.pillDot, { backgroundColor: meta.color }]} />
                  <Text style={styles.pillLabel}>{meta.label.split(' ')[0]}</Text>
                  <Text style={styles.pillPct}>{cat.percentage}%</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* 4. DUAL MINI TILES (PROJECTED INTEREST & MATURITY) */}
      <View style={styles.miniTilesRow}>
        <View style={styles.miniTile}>
          <MaterialIcons name="auto-graph" size={14} color="#339AF0" />
          <Text style={styles.miniTileLabel}>PROJECTED RETURNS</Text>
          <Text style={styles.miniTileVal}>
            +৳{stats.totalInterestProjected.toLocaleString()}
          </Text>
        </View>

        <View style={styles.miniTile}>
          <MaterialIcons name="event-available" size={14} color="#FF922B" />
          <Text style={styles.miniTileLabel}>NEXT MATURITY</Text>
          <Text style={styles.miniTileVal}>
            {stats.nextMaturingItem
              ? `${stats.nextMaturingItem.daysLeft} Days`
              : 'No Term Scheme'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#13191C',
    borderRadius: 20,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerLabel: {
    fontFamily: F.bold,
    fontSize: 10,
    color: '#20C997',
    letterSpacing: 0.8,
  },
  pnlBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pnlText: {
    fontFamily: F.bold,
    fontSize: 10,
    letterSpacing: 0.4,
  },
  heroValueBox: {
    backgroundColor: '#182024',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  takaSymbol: {
    fontFamily: F.bold,
    fontSize: 24,
    color: '#20C997',
  },
  heroAmountText: {
    fontFamily: F.bold,
    fontSize: 32,
    color: '#FFFFFF',
  },
  subtext: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  diversificationSection: {
    gap: 6,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diversificationTitle: {
    fontFamily: F.bold,
    fontSize: 9,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  diversificationSub: {
    fontFamily: F.medium,
    fontSize: 9,
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
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  allocPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#181F23',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pillLabel: {
    fontFamily: F.medium,
    fontSize: 10,
    color: C.onSurface,
  },
  pillPct: {
    fontFamily: F.bold,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  miniTilesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  miniTile: {
    flex: 1,
    backgroundColor: '#181F23',
    borderRadius: 12,
    padding: 10,
    gap: 2,
  },
  miniTileLabel: {
    fontFamily: F.bold,
    fontSize: 9,
    color: C.onSurfaceVariant,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  miniTileVal: {
    fontFamily: F.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
});
