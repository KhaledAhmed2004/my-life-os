import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import {
  ZAKAT_CATEGORIES_META,
  ZAKAT_COLORS,
} from '@/components/zakat/zakat-constants';
import { Vital } from '@/constants/vital-theme';
import { useZakatStore } from '@/stores/zakat-store';
import { ZakatManualItem } from '@/types/zakat';

const C = Vital.colors;
const F = Vital.fonts;

interface ZakatManualAssetsSectionProps {
  onOpenAddItem: (isDeduction: boolean) => void;
  onEditItem: (item: ZakatManualItem) => void;
}

export function ZakatManualAssetsSection({
  onOpenAddItem,
  onEditItem,
}: ZakatManualAssetsSectionProps) {
  const { manualItems, toggleManualItem, deleteManualItem } = useZakatStore();

  const assetItems = manualItems.filter((i) => !i.isDeduction);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="inventory" size={16} color={ZAKAT_COLORS.gold} />
          <Text style={styles.headerTitle}>MANUAL ASSETS & JEWELRY</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            onOpenAddItem(false);
          }}
          style={styles.addBtn}>
          <MaterialIcons name="add" size={14} color={ZAKAT_COLORS.gold} />
          <Text style={styles.addBtnText}>Add Asset</Text>
        </TouchableOpacity>
      </View>

      {assetItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No manual assets added. Tap &quot;Add Asset&quot; to include Gold, Silver, Cash or Stocks.
          </Text>
        </View>
      ) : (
        <View style={styles.itemsList}>
          {assetItems.map((item) => {
            const meta = ZAKAT_CATEGORIES_META[item.category] || {
              icon: 'attach-money',
              color: ZAKAT_COLORS.gold,
            };

            return (
              <View
                key={item.id}
                style={[
                  styles.itemCard,
                  !item.isEnabled && styles.itemCardDisabled,
                ]}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => void toggleManualItem(item.id)}
                  style={styles.checkBtn}>
                  <MaterialIcons
                    name={item.isEnabled ? 'check-box' : 'check-box-outline-blank'}
                    size={18}
                    color={item.isEnabled ? ZAKAT_COLORS.gold : C.onSurfaceVariant}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => onEditItem(item)}
                  style={styles.itemMain}>
                  <View style={styles.itemIconCircle}>
                    <MaterialIcons
                      name={meta.icon as any}
                      size={15}
                      color={meta.color}
                    />
                  </View>
                  <View style={styles.itemDetails}>
                    <View style={styles.titleRow}>
                      <Text style={styles.itemTitle}>{item.name}</Text>
                      {item.weightGrams ? (
                        <View style={styles.weightBadge}>
                          <Text style={styles.weightBadgeText}>
                            {item.weightGrams}g
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    {item.note ? (
                      <Text style={styles.itemSubtitle}>{item.note}</Text>
                    ) : null}
                  </View>
                </TouchableOpacity>

                <View style={styles.itemRight}>
                  <Text
                    style={[
                      styles.itemAmount,
                      !item.isEnabled && styles.itemAmountDisabled,
                    ]}>
                    ৳{item.amount.toLocaleString()}
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => void deleteManualItem(item.id)}
                    style={styles.deleteBtn}>
                    <MaterialIcons name="delete-outline" size={14} color={C.onSurfaceVariant} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: ZAKAT_COLORS.tileBg,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontFamily: F.bold,
    fontSize: 10,
    color: ZAKAT_COLORS.gold,
    letterSpacing: 0.7,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ZAKAT_COLORS.goldGlow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 2,
  },
  addBtnText: {
    fontFamily: F.bold,
    fontSize: 10,
    color: ZAKAT_COLORS.gold,
  },
  emptyState: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
    textAlign: 'center',
  },
  itemsList: {
    gap: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ZAKAT_COLORS.tileInner,
    borderRadius: 12,
    padding: 10,
    gap: 8,
  },
  itemCardDisabled: {
    opacity: 0.5,
  },
  checkBtn: {
    padding: 2,
  },
  itemMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#13191C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDetails: {
    flex: 1,
    gap: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemTitle: {
    fontFamily: F.bold,
    fontSize: 11,
    color: C.onSurface,
  },
  weightBadge: {
    backgroundColor: ZAKAT_COLORS.goldGlow,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  weightBadgeText: {
    fontFamily: F.bold,
    fontSize: 8,
    color: ZAKAT_COLORS.gold,
  },
  itemSubtitle: {
    fontFamily: F.regular,
    fontSize: 9,
    color: C.onSurfaceVariant,
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  itemAmount: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  itemAmountDisabled: {
    color: C.onSurfaceVariant,
  },
  deleteBtn: {
    padding: 2,
  },
});
