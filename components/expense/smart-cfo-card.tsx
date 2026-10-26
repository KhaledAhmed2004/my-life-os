import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { RollingNumber } from '@/components/ui/rolling-number';
import { Vital } from '@/constants/vital-theme';
import { useExpenseStore } from '@/stores/expense-store';

const C = Vital.colors;
const F = Vital.fonts;

export function SmartCfoCard() {
  const getFinancialHealthScore = useExpenseStore((s) => s.getFinancialHealthScore);
  const getDailySafeToSpend = useExpenseStore((s) => s.getDailySafeToSpend);
  const getThreeBucketOverview = useExpenseStore((s) => s.getThreeBucketOverview);
  const isPrivacyMode = useExpenseStore((s) => s.isPrivacyMode);

  const health = getFinancialHealthScore();
  const safeSpend = getDailySafeToSpend();
  const bucketOverview = getThreeBucketOverview();

  const [expanded, setExpanded] = useState(false);

  const isZeroBurn = safeSpend.status === 'ZERO_BURN';
  const isTight = safeSpend.status === 'TIGHT';

  const getGradeTheme = () => {
    switch (health.grade) {
      case 'PRIME':
        return {
          color: '#C8F135',
          bg: 'rgba(200, 241, 53, 0.12)',
          border: 'rgba(200, 241, 53, 0.28)',
          icon: 'diamond',
        };
      case 'HEALTHY':
        return {
          color: '#20C997',
          bg: 'rgba(32, 201, 151, 0.12)',
          border: 'rgba(32, 201, 151, 0.28)',
          icon: 'bolt',
        };
      case 'CAUTION':
        return {
          color: '#FCC419',
          bg: 'rgba(252, 196, 25, 0.12)',
          border: 'rgba(252, 196, 25, 0.28)',
          icon: 'warning-amber',
        };
      case 'CRITICAL':
        return {
          color: '#FA5252',
          bg: 'rgba(250, 82, 82, 0.12)',
          border: 'rgba(250, 82, 82, 0.28)',
          icon: 'shield',
        };
    }
  };

  const theme = getGradeTheme();

  return (
    <View style={styles.card}>
      {/* 1. COMPACT PULSE HEADER */}
      <View style={styles.headerRow}>
        <View style={styles.pulseTitleBox}>
          <View style={[styles.pulseIconBox, { backgroundColor: theme.bg }]}>
            <MaterialIcons name="insights" size={14} color={theme.color} />
          </View>
          <View>
            <Text style={styles.pulseTitle}>DAILY SAFE ALLOWANCE</Text>
            <Text style={styles.pulseSubtitle}>{safeSpend.daysLeft}d left in billing cycle</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            setExpanded(!expanded);
          }}
          style={[
            styles.healthScoreBadge,
            { backgroundColor: theme.bg, borderColor: theme.border },
          ]}>
          <MaterialIcons name={theme.icon as any} size={12} color={theme.color} />
          <Text style={[styles.healthScoreText, { color: theme.color }]}>
            {health.score}/100 • {health.label}
          </Text>
          <MaterialIcons
            name={expanded ? 'expand-less' : 'expand-more'}
            size={14}
            color={theme.color}
          />
        </TouchableOpacity>
      </View>

      {/* 2. COMPACT AMOUNT & STATUS ROW */}
      <View style={styles.amountStatusRow}>
        <View style={styles.amountGroup}>
          {isPrivacyMode ? (
            <Text style={styles.heroAmount}>•••• ৳</Text>
          ) : isZeroBurn ? (
            <Text style={[styles.heroAmount, styles.heroAmountZero]}>৳ 0</Text>
          ) : (
            <RollingNumber
              value={safeSpend.safeDailyAmount}
              prefix="৳ "
              style={[styles.heroAmount, isTight && styles.heroAmountTight]}
            />
          )}
          <Text style={styles.perDayText}>/ today</Text>
        </View>

        {isZeroBurn ? (
          <View style={styles.statusPill}>
            <View style={styles.statusDotAmber} />
            <Text style={styles.statusPillText}>Limit Reached</Text>
          </View>
        ) : (
          <View style={styles.statusPillLime}>
            <View style={styles.statusDotLime} />
            <Text style={styles.statusPillTextLime}>On Pace</Text>
          </View>
        )}
      </View>

      {/* 3. SEAMLESS SMART ADVICE CALLOUT */}
      <View style={styles.adviceCallout}>
        <MaterialIcons
          name={isZeroBurn ? 'lightbulb' : 'auto-awesome'}
          size={14}
          color={isZeroBurn ? '#FCC419' : '#C8F135'}
          style={styles.adviceIcon}
        />
        <Text style={styles.adviceText}>{safeSpend.recoveryAdvice}</Text>
      </View>

      {/* 4. EXPANDABLE 3-BUCKET & HEALTH BREAKDOWN */}
      {expanded && (
        <View style={styles.breakdownSection}>
          {/* 3-BUCKET HEALTH MINI-PROGRESS */}
          <Text style={styles.sectionMiniHeader}>3-BUCKET SYSTEM OVERVIEW</Text>
          <View style={styles.bucketsContainer}>
            {/* Bucket 1: Fixed */}
            <View style={styles.bucketPillCard}>
              <View style={styles.bucketHeader}>
                <View style={styles.bucketLabelRow}>
                  <MaterialIcons name="lock" size={12} color="#748FFC" />
                  <Text style={styles.bucketLabel}>Fixed</Text>
                </View>
                <Text style={styles.bucketAmount}>
                  {isPrivacyMode ? '••••' : `৳ ${bucketOverview.fixedCommitments.totalSpent.toLocaleString('en-US')}`}
                </Text>
              </View>
              <View style={styles.bucketTrack}>
                <View
                  style={[
                    styles.bucketFill,
                    {
                      width: `${Math.min(100, bucketOverview.fixedCommitments.percentage)}%`,
                      backgroundColor: '#748FFC',
                    },
                  ]}
                />
              </View>
            </View>

            {/* Bucket 2: Savings */}
            <View style={styles.bucketPillCard}>
              <View style={styles.bucketHeader}>
                <View style={styles.bucketLabelRow}>
                  <MaterialIcons name="savings" size={12} color="#C8F135" />
                  <Text style={styles.bucketLabel}>Vaults</Text>
                </View>
                <Text style={styles.bucketAmount}>
                  {isPrivacyMode ? '••••' : `৳ ${bucketOverview.dedicatedSavings.totalSpent.toLocaleString('en-US')}`}
                </Text>
              </View>
              <View style={styles.bucketTrack}>
                <View
                  style={[
                    styles.bucketFill,
                    {
                      width: `${Math.min(100, bucketOverview.dedicatedSavings.percentage)}%`,
                      backgroundColor: '#C8F135',
                    },
                  ]}
                />
              </View>
            </View>

            {/* Bucket 3: Flexible */}
            <View style={styles.bucketPillCard}>
              <View style={styles.bucketHeader}>
                <View style={styles.bucketLabelRow}>
                  <MaterialIcons name="local-gas-station" size={12} color="#20C997" />
                  <Text style={styles.bucketLabel}>Daily</Text>
                </View>
                <Text style={styles.bucketAmount}>
                  {isPrivacyMode ? '••••' : `৳ ${bucketOverview.flexibleSpending.totalSpent.toLocaleString('en-US')}`}
                </Text>
              </View>
              <View style={styles.bucketTrack}>
                <View
                  style={[
                    styles.bucketFill,
                    {
                      width: `${Math.min(100, bucketOverview.flexibleSpending.percentage)}%`,
                      backgroundColor: '#20C997',
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* METRICS BREAKDOWN */}
          <View style={styles.breakdownHeader}>
            <Text style={styles.breakdownTitle}>HEALTH SCORE BREAKDOWN</Text>
            <Text style={styles.breakdownScoreTotal}>{health.score} / 100</Text>
          </View>

          {/* Factor 1 */}
          <View style={styles.factorItem}>
            <View style={styles.factorMeta}>
              <Text style={styles.factorName}>Budget Discipline</Text>
              <Text style={styles.factorScore}>{health.budgetScore} / 45</Text>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.trackFill,
                  {
                    width: `${Math.min(100, (health.budgetScore / 45) * 100)}%`,
                    backgroundColor: theme.color,
                  },
                ]}
              />
            </View>
          </View>

          {/* Factor 2 */}
          <View style={styles.factorItem}>
            <View style={styles.factorMeta}>
              <Text style={styles.factorName}>Cashflow & Savings Buffer</Text>
              <Text style={styles.factorScore}>{health.cashflowScore} / 30</Text>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.trackFill,
                  {
                    width: `${Math.min(100, (health.cashflowScore / 30) * 100)}%`,
                    backgroundColor: theme.color,
                  },
                ]}
              />
            </View>
          </View>

          {/* Factor 3 */}
          <View style={styles.factorItem}>
            <View style={styles.factorMeta}>
              <Text style={styles.factorName}>Expense Diversification</Text>
              <Text style={styles.factorScore}>{health.diversificationScore} / 25</Text>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.trackFill,
                  {
                    width: `${Math.min(100, (health.diversificationScore / 25) * 100)}%`,
                    backgroundColor: theme.color,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#161A1D',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pulseTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  pulseIconBox: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseTitle: {
    fontFamily: F.sansBold,
    fontSize: 10,
    color: C.onSurfaceVariant,
    letterSpacing: 0.8,
  },
  pulseSubtitle: {
    fontFamily: F.sansMedium,
    fontSize: 11,
    color: C.onSurfaceVariant,
    marginTop: 1,
  },
  healthScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  healthScoreText: {
    fontFamily: F.sansBold,
    fontSize: 11,
  },
  amountStatusRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  amountGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  heroAmount: {
    fontFamily: F.sansBold,
    fontSize: 26,
    color: C.onSurface,
    letterSpacing: -0.5,
  },
  heroAmountZero: {
    color: '#FA5252',
  },
  heroAmountTight: {
    color: '#FCC419',
  },
  perDayText: {
    fontFamily: F.sansMedium,
    fontSize: 13,
    color: C.onSurfaceVariant,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(250, 82, 82, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusDotAmber: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FA5252',
  },
  statusPillText: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: '#FA5252',
  },
  statusPillLime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(200, 241, 53, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusDotLime: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C8F135',
  },
  statusPillTextLime: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: '#C8F135',
  },
  adviceCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  adviceIcon: {
    flexShrink: 0,
  },
  adviceText: {
    fontFamily: F.sans,
    fontSize: 12,
    color: C.onSurfaceVariant,
    flex: 1,
    lineHeight: 16,
  },
  breakdownSection: {
    marginTop: 6,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
  },
  sectionMiniHeader: {
    fontFamily: F.sansBold,
    fontSize: 10,
    color: C.onSurfaceVariant,
    letterSpacing: 0.7,
  },
  bucketsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  bucketPillCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  bucketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bucketLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bucketLabel: {
    fontFamily: F.sansBold,
    fontSize: 10,
    color: C.onSurface,
  },
  bucketAmount: {
    fontFamily: F.sansMedium,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  bucketTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  bucketFill: {
    height: '100%',
    borderRadius: 2,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  breakdownTitle: {
    fontFamily: F.sansBold,
    fontSize: 10,
    color: C.onSurfaceVariant,
    letterSpacing: 0.8,
  },
  breakdownScoreTotal: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: C.onSurface,
  },
  factorItem: {
    gap: 6,
  },
  factorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  factorName: {
    fontFamily: F.sans,
    fontSize: 12,
    color: C.onSurface,
  },
  factorScore: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  track: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 3,
  },
});
