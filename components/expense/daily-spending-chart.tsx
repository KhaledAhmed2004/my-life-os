import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Vital } from '@/constants/vital-theme';
import {
  DailySpendingPoint,
  HeatmapDayCell,
  useExpenseStore,
} from '@/stores/expense-store';

const C = Vital.colors;
const F = Vital.fonts;

type ViewMode = 'BARS' | 'MATRIX' | 'MOOD';
type BarDays = 7 | 14;

export function DailySpendingChart() {
  const [viewMode, setViewMode] = useState<ViewMode>('BARS');
  const [barDays, setBarDays] = useState<BarDays>(7);
  const [selectedBar, setSelectedBar] = useState<DailySpendingPoint | null>(null);
  const [selectedCell, setSelectedCell] = useState<HeatmapDayCell | null>(null);

  const getDailySpendingSeries = useExpenseStore((s) => s.getDailySpendingSeries);
  const getMonthlySpendingHeatmap = useExpenseStore((s) => s.getMonthlySpendingHeatmap);
  const getDailySpendingStats = useExpenseStore((s) => s.getDailySpendingStats);
  const isPrivacyMode = useExpenseStore((s) => s.isPrivacyMode);

  const series = useMemo(
    () => getDailySpendingSeries(barDays),
    [getDailySpendingSeries, barDays]
  );
  const heatmapCells = useMemo(
    () => getMonthlySpendingHeatmap(),
    [getMonthlySpendingHeatmap]
  );
  const stats = useMemo(() => getDailySpendingStats(), [getDailySpendingStats]);

  // Max amount in series for bar scaling
  const maxBarAmount = useMemo(() => {
    const max = Math.max(...series.map((s) => s.amount), 1);
    return max;
  }, [series]);

  const handleSelectBar = (item: DailySpendingPoint) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (selectedBar?.date === item.date) {
      setSelectedBar(null);
    } else {
      setSelectedBar(item);
    }
  };

  const handleSelectCell = (cell: HeatmapDayCell) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (selectedCell?.date === cell.date) {
      setSelectedCell(null);
    } else {
      setSelectedCell(cell);
    }
  };

  // MATRIX MODE (Original GitHub-style Green Intensity)
  const getIntensityBgColor = (level: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return 'rgba(255, 255, 255, 0.02)';
    switch (level) {
      case 4:
        return '#C8F135'; // Glowing Neon Lime
      case 3:
        return '#89FE00'; // Bright Green
      case 2:
        return '#20C997'; // Emerald
      case 1:
        return '#17402B'; // Subtle Forest
      default:
        return 'rgba(255, 255, 255, 0.05)'; // Zero
    }
  };

  const getIntensityTextColor = (level: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return 'rgba(255, 255, 255, 0.15)';
    if (level >= 3) return '#101416';
    return C.onSurface;
  };

  // MOOD MODE (Interactive Sentiment Calendar)
  const getDayMoodConfig = (cell: HeatmapDayCell) => {
    if (!cell.isCurrentMonth) {
      return {
        bg: 'transparent',
        border: 'transparent',
        icon: null,
        color: 'transparent',
        isFuture: false,
      };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const isFuture = cell.date > todayStr && !cell.isToday;

    if (isFuture) {
      return {
        bg: 'rgba(255, 255, 255, 0.03)',
        border: 'rgba(255, 255, 255, 0.06)',
        icon: null,
        color: 'rgba(255, 255, 255, 0.2)',
        isFuture: true,
      };
    }

    if (cell.amount === 0) {
      return {
        bg: '#F5D76E', // Warm Sunshine Yellow (Zero Spend / Best Day 🏆)
        border: '#E5C453',
        icon: 'sentiment-very-satisfied',
        color: '#1E293B',
        isFuture: false,
      };
    }

    switch (cell.intensityLevel) {
      case 1:
        return {
          bg: '#A9DFBF', // Light Mint Green
          border: 'rgba(169, 223, 191, 0.4)',
          icon: 'sentiment-satisfied',
          color: '#064E3B',
          isFuture: false,
        };
      case 2:
        return {
          bg: '#52BE80', // Balanced Emerald Green
          border: 'rgba(82, 190, 128, 0.4)',
          icon: 'sentiment-satisfied',
          color: '#065F46',
          isFuture: false,
        };
      case 3:
        return {
          bg: '#1E8449', // Deep Forest Green
          border: 'rgba(30, 132, 73, 0.4)',
          icon: 'sentiment-neutral',
          color: '#FFFFFF',
          isFuture: false,
        };
      case 4:
      default:
        return {
          bg: '#334155', // Slate Charcoal with alert face
          border: '#475569',
          icon: 'sentiment-very-dissatisfied',
          color: '#FFFFFF',
          isFuture: false,
        };
    }
  };

  const activeInspector = selectedBar || (selectedCell ? {
    date: selectedCell.date,
    dayLabel: '',
    fullDateLabel: selectedCell.date,
    amount: selectedCell.amount,
    transactionCount: selectedCell.transactionCount,
    isToday: selectedCell.isToday,
  } : null);

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      {/* HEADER ROW */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleBox}>
          <ThemedText themeColor="textSecondary" type="smallBold">
            DAILY SPENDING & ACTIVITY
          </ThemedText>
        </View>

        {/* VIEW MODE TOGGLE PILLS (3 OPTIONS) */}
        <View style={styles.modeToggleGroup}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setViewMode('BARS');
            }}
            style={[styles.modePill, viewMode === 'BARS' && styles.modePillActive]}>
            <MaterialIcons
              name="bar-chart"
              size={13}
              color={viewMode === 'BARS' ? '#101416' : C.onSurfaceVariant}
            />
            <Text
              style={[
                styles.modePillText,
                viewMode === 'BARS' && styles.modePillTextActive,
              ]}>
              Bars
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setViewMode('MATRIX');
            }}
            style={[styles.modePill, viewMode === 'MATRIX' && styles.modePillActive]}>
            <MaterialIcons
              name="grid-view"
              size={13}
              color={viewMode === 'MATRIX' ? '#101416' : C.onSurfaceVariant}
            />
            <Text
              style={[
                styles.modePillText,
                viewMode === 'MATRIX' && styles.modePillTextActive,
              ]}>
              Matrix
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setViewMode('MOOD');
            }}
            style={[styles.modePill, viewMode === 'MOOD' && styles.modePillActive]}>
            <MaterialIcons
              name="sentiment-satisfied"
              size={13}
              color={viewMode === 'MOOD' ? '#101416' : C.onSurfaceVariant}
            />
            <Text
              style={[
                styles.modePillText,
                viewMode === 'MOOD' && styles.modePillTextActive,
              ]}>
              Mood
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* METRIC PILLS SUMMARY */}
      <View style={styles.metricsRow}>
        <View style={styles.metricPill}>
          <Text style={styles.metricPillLabel}>Daily Avg</Text>
          <Text style={styles.metricPillValue}>
            {isPrivacyMode ? '••••' : `৳ ${stats.dailyAvg.toLocaleString('en-US')}`}
          </Text>
        </View>

        <View style={styles.metricPill}>
          <Text style={styles.metricPillLabel}>Peak Day</Text>
          <Text style={styles.metricPillValue}>
            {stats.peakDay.dayLabel} ({isPrivacyMode ? '••••' : `৳ ${stats.peakDay.amount.toLocaleString('en-US')}`})
          </Text>
        </View>

        <View style={styles.metricPill}>
          <Text style={styles.metricPillLabel}>Zero-Spend</Text>
          <Text style={styles.metricPillValueGreen}>
            {stats.zeroSpendDays} Days 🏆
          </Text>
        </View>
      </View>

      {/* ACTIVE DAY DETAIL INSPECTOR BANNER */}
      {activeInspector && (
        <View style={styles.inspectorBanner}>
          <View style={styles.inspectorIconCol}>
            <MaterialIcons name="info-outline" size={18} color="#C8F135" />
          </View>
          <View style={styles.inspectorDetailsCol}>
            <Text style={styles.inspectorDateText}>
              {activeInspector.fullDateLabel} {activeInspector.isToday ? '(Today)' : ''}
            </Text>
            <Text style={styles.inspectorAmountText}>
              Spent: {isPrivacyMode ? '••••' : `৳ ${activeInspector.amount.toLocaleString('en-US')}`}
              {activeInspector.transactionCount > 0
                ? ` • ${activeInspector.transactionCount} transaction${
                    activeInspector.transactionCount > 1 ? 's' : ''
                  }`
                : ' • Zero spend day ✨'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setSelectedBar(null);
              setSelectedCell(null);
            }}
            style={styles.inspectorCloseBtn}>
            <MaterialIcons name="close" size={16} color={C.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      )}

      {/* VIEW 1: DAILY BAR CHART */}
      {viewMode === 'BARS' && (
        <View style={styles.chartContainer}>
          {/* BAR CHART DURATION TOGGLE (7D vs 14D) */}
          <View style={styles.barDurationRow}>
            <Text style={styles.chartSubLabel}>
              {barDays === 7 ? 'Last 7 Days' : 'Last 14 Days'} Outflow
            </Text>
            <View style={styles.daysToggleBox}>
              <TouchableOpacity
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setBarDays(7);
                  setSelectedBar(null);
                }}
                style={[styles.daysToggleBtn, barDays === 7 && styles.daysToggleBtnActive]}>
                <Text
                  style={[
                    styles.daysToggleBtnText,
                    barDays === 7 && styles.daysToggleBtnTextActive,
                  ]}>
                  7D
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setBarDays(14);
                  setSelectedBar(null);
                }}
                style={[styles.daysToggleBtn, barDays === 14 && styles.daysToggleBtnActive]}>
                <Text
                  style={[
                    styles.daysToggleBtnText,
                    barDays === 14 && styles.daysToggleBtnTextActive,
                  ]}>
                  14D
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* BARS GRAPH ROW */}
          <View style={styles.barsArea}>
            {series.map((item) => {
              const isSelected = selectedBar?.date === item.date;
              const ratio = maxBarAmount > 0 ? item.amount / maxBarAmount : 0;
              const barHeight = Math.max(8, Math.round(ratio * 110));

              return (
                <TouchableOpacity
                  key={item.date}
                  activeOpacity={0.8}
                  onPress={() => handleSelectBar(item)}
                  style={styles.barCol}>
                  {/* AMOUNT LABEL ON TOP IF SELECTED OR HIGHEST */}
                  {isSelected && (
                    <View style={styles.barTopBadge}>
                      <Text style={styles.barTopBadgeText}>
                        {item.amount >= 1000
                          ? `${Math.round(item.amount / 1000)}k`
                          : item.amount}
                      </Text>
                    </View>
                  )}

                  {/* VERTICAL PILLAR */}
                  <View style={styles.barPillarTrack}>
                    <View
                      style={[
                        styles.barPillarFill,
                        { height: barHeight },
                        item.amount === 0 && styles.barPillarZero,
                        item.isToday && styles.barPillarToday,
                        isSelected && styles.barPillarSelected,
                      ]}
                    />
                  </View>

                  {/* DAY LABEL */}
                  <Text
                    style={[
                      styles.barDayText,
                      item.isToday && styles.barDayTextToday,
                      isSelected && styles.barDayTextSelected,
                    ]}>
                    {item.dayLabel.slice(0, barDays === 14 ? 1 : 3)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* VIEW 2: ORIGINAL GITHUB-STYLE MONTHLY MATRIX (OPTION 1) */}
      {viewMode === 'MATRIX' && (
        <View style={styles.matrixContainer}>
          <Text style={styles.chartSubLabel}>Monthly Spending Matrix</Text>

          {/* WEEKDAYS HEADER (MON - SUN) */}
          <View style={styles.matrixWeekdaysRow}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
              <Text key={idx} style={styles.matrixWeekdayLabel}>
                {day}
              </Text>
            ))}
          </View>

          {/* MATRIX CELLS (7 COLUMNS) */}
          <View style={styles.matrixGrid}>
            {heatmapCells.map((cell, idx) => {
              const isSelected = selectedCell?.date === cell.date;
              const bg = getIntensityBgColor(cell.intensityLevel, cell.isCurrentMonth);
              const textCol = getIntensityTextColor(
                cell.intensityLevel,
                cell.isCurrentMonth
              );

              return (
                <TouchableOpacity
                  key={`matrix-${cell.date}-${idx}`}
                  activeOpacity={0.7}
                  onPress={() => handleSelectCell(cell)}
                  style={[
                    styles.matrixCell,
                    { backgroundColor: bg },
                    cell.isToday && styles.matrixCellToday,
                    isSelected && styles.matrixCellSelected,
                  ]}>
                  <Text style={[styles.matrixCellText, { color: textCol }]}>
                    {cell.dayNum}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* MATRIX LEGEND SCALE */}
          <View style={styles.matrixLegendRow}>
            <Text style={styles.legendText}>Zero</Text>
            <View style={[styles.matrixLegendSquare, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
            <View style={[styles.matrixLegendSquare, { backgroundColor: '#17402B' }]} />
            <View style={[styles.matrixLegendSquare, { backgroundColor: '#20C997' }]} />
            <View style={[styles.matrixLegendSquare, { backgroundColor: '#89FE00' }]} />
            <View style={[styles.matrixLegendSquare, { backgroundColor: '#C8F135' }]} />
            <Text style={styles.legendText}>High</Text>
          </View>
        </View>
      )}

      {/* VIEW 3: MOOD & HABIT SPENDING CALENDAR (OPTION 2) */}
      {viewMode === 'MOOD' && (
        <View style={styles.heatmapContainer}>
          <View style={styles.heatmapHeaderRow}>
            <Text style={styles.chartSubLabel}>Daily Spend Mood Calendar</Text>
            <View style={styles.streakBadge}>
              <Text style={styles.streakBadgeText}>
                ✨ {stats.zeroSpendDays} No-Spend Days
              </Text>
            </View>
          </View>

          {/* WEEKDAYS HEADER (MON - SUN) */}
          <View style={styles.heatmapWeekdaysRow}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
              <Text key={idx} style={styles.weekdayLabel}>
                {day}
              </Text>
            ))}
          </View>

          {/* HEATMAP CELLS MATRIX (7 COLUMNS) */}
          <View style={styles.heatmapGrid}>
            {heatmapCells.map((cell, idx) => {
              const isSelected = selectedCell?.date === cell.date;
              const mood = getDayMoodConfig(cell);

              if (!cell.isCurrentMonth) {
                return (
                  <View key={`empty-${idx}`} style={styles.dayMoodCol}>
                    <View style={styles.moodBubblePlaceholder} />
                    <Text style={styles.dayNumEmpty}> </Text>
                  </View>
                );
              }

              return (
                <TouchableOpacity
                  key={`mood-${cell.date}-${idx}`}
                  activeOpacity={0.7}
                  onPress={() => handleSelectCell(cell)}
                  style={[
                    styles.dayMoodCol,
                    isSelected && styles.dayMoodColSelected,
                  ]}>
                  {/* ROUND MOOD BUBBLE */}
                  <View
                    style={[
                      styles.moodBubble,
                      { backgroundColor: mood.bg, borderColor: mood.border },
                      cell.isToday && styles.moodBubbleToday,
                      isSelected && styles.moodBubbleSelected,
                    ]}>
                    {mood.isFuture ? (
                      <View style={styles.futureDot} />
                    ) : mood.icon ? (
                      <MaterialIcons name={mood.icon as any} size={20} color={mood.color} />
                    ) : null}
                  </View>

                  {/* DAY NUMBER / TODAY BADGE */}
                  {cell.isToday ? (
                    <View style={styles.todayPill}>
                      <Text style={styles.todayPillText}>{cell.dayNum}</Text>
                    </View>
                  ) : (
                    <Text style={[styles.dayNumText, isSelected && styles.dayNumTextSelected]}>
                      {cell.dayNum}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* HEATMAP LEGEND SCALE */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F5D76E' }]} />
              <Text style={styles.legendText}>Zero Spend</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#A9DFBF' }]} />
              <Text style={styles.legendText}>Light</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#52BE80' }]} />
              <Text style={styles.legendText}>Moderate</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#1E8449' }]} />
              <Text style={styles.legendText}>High</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#334155' }]} />
              <Text style={styles.legendText}>Heavy</Text>
            </View>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: C.glassBorder,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleBox: {
    flex: 1,
  },
  modeToggleGroup: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  modePillActive: {
    backgroundColor: '#C8F135',
  },
  modePillText: {
    fontFamily: F.sansSemiBold,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  modePillTextActive: {
    color: '#101416',
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricPill: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  metricPillLabel: {
    fontFamily: F.sansMedium,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  metricPillValue: {
    fontFamily: F.sansBold,
    fontSize: 12,
    color: C.onSurface,
  },
  metricPillValueGreen: {
    fontFamily: F.sansBold,
    fontSize: 12,
    color: '#89FE00',
  },
  inspectorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(200, 241, 53, 0.12)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(200, 241, 53, 0.3)',
    gap: 10,
  },
  inspectorIconCol: {
    width: 24,
    alignItems: 'center',
  },
  inspectorDetailsCol: {
    flex: 1,
    gap: 1,
  },
  inspectorDateText: {
    fontFamily: F.sansBold,
    fontSize: 12,
    color: '#C8F135',
  },
  inspectorAmountText: {
    fontFamily: F.sansMedium,
    fontSize: 11,
    color: C.onSurface,
  },
  inspectorCloseBtn: {
    padding: 4,
  },
  chartContainer: {
    gap: 10,
    paddingTop: 4,
  },
  barDurationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartSubLabel: {
    fontFamily: F.sansSemiBold,
    fontSize: 12,
    color: C.onSurfaceVariant,
  },
  daysToggleBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 8,
    padding: 2,
  },
  daysToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  daysToggleBtnActive: {
    backgroundColor: C.onSurface,
  },
  daysToggleBtnText: {
    fontFamily: F.sansBold,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  daysToggleBtnTextActive: {
    color: C.background,
  },
  barsArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    paddingTop: 16,
    paddingHorizontal: 4,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    gap: 6,
  },
  barTopBadge: {
    position: 'absolute',
    top: 0,
    backgroundColor: '#C8F135',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 10,
  },
  barTopBadgeText: {
    fontFamily: F.sansBold,
    fontSize: 9,
    color: '#101416',
  },
  barPillarTrack: {
    width: 14,
    height: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barPillarFill: {
    width: '100%',
    backgroundColor: '#20C997',
    borderRadius: 7,
  },
  barPillarZero: {
    backgroundColor: 'transparent',
  },
  barPillarToday: {
    backgroundColor: '#C8F135',
  },
  barPillarSelected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C8F135',
  },
  barDayText: {
    fontFamily: F.sansMedium,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  barDayTextToday: {
    fontFamily: F.sansBold,
    color: '#C8F135',
  },
  barDayTextSelected: {
    fontFamily: F.sansBold,
    color: C.onSurface,
  },
  heatmapContainer: {
    gap: 12,
    paddingTop: 4,
  },
  heatmapHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakBadge: {
    backgroundColor: 'rgba(200, 241, 53, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(200, 241, 53, 0.25)',
  },
  streakBadgeText: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: '#C8F135',
  },
  heatmapWeekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  weekdayLabel: {
    fontFamily: F.sansBold,
    fontSize: 11,
    color: C.onSurfaceVariant,
    width: 36,
    textAlign: 'center',
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },
  dayMoodCol: {
    width: 36,
    alignItems: 'center',
    gap: 3,
  },
  dayMoodColSelected: {
    transform: [{ scale: 1.08 }],
  },
  moodBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1,
  },
  futureDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  moodBubblePlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'transparent',
  },
  moodBubbleToday: {
    borderWidth: 2,
    borderColor: '#C8F135',
    shadowColor: '#C8F135',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  moodBubbleSelected: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  moodEmojiText: {
    fontSize: 10,
    fontFamily: F.sansBold,
    textAlign: 'center',
  },
  dayNumText: {
    fontFamily: F.sansMedium,
    fontSize: 11,
    color: C.onSurfaceVariant,
    textAlign: 'center',
  },
  dayNumTextSelected: {
    fontFamily: F.sansBold,
    color: '#FFFFFF',
  },
  dayNumEmpty: {
    fontSize: 11,
    height: 14,
  },
  todayPill: {
    backgroundColor: '#20C997',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayPillText: {
    fontFamily: F.sansBold,
    fontSize: 10,
    color: '#101416',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: F.sans,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  matrixContainer: {
    gap: 10,
    paddingTop: 4,
  },
  matrixWeekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 2,
  },
  matrixWeekdayLabel: {
    fontFamily: F.sansBold,
    fontSize: 10,
    color: C.onSurfaceVariant,
    width: 34,
    textAlign: 'center',
  },
  matrixGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 6,
  },
  matrixCell: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  matrixCellToday: {
    borderColor: '#C8F135',
    borderWidth: 1.5,
  },
  matrixCellSelected: {
    borderColor: '#FFFFFF',
    borderWidth: 2,
    transform: [{ scale: 1.08 }],
  },
  matrixCellText: {
    fontFamily: F.sansBold,
    fontSize: 11,
  },
  matrixLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 5,
    marginTop: 4,
  },
  matrixLegendSquare: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
});
