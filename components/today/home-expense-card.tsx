import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { Vital } from '@/constants/vital-theme';
import { useAuth } from '@/hooks/use-auth';
import { useExpenseStore } from '@/stores/expense-store';

const C = Vital.colors;
const F = Vital.fonts;

type Props = {
  onPress: () => void;
  onAddPress: () => void;
};

export function HomeExpenseCard({ onPress, onAddPress }: Props) {
  const { user } = useAuth();
  const { getTotals } = useExpenseStore();
  const { netBalance, totalExpense } = getTotals();

  // Interactive states
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [viewMode, setViewMode] = useState<'BALANCE' | 'EXPENSE'>('BALANCE');
  const [cardWidth, setCardWidth] = useState(340);

  const displayAmount =
    viewMode === 'BALANCE'
      ? netBalance > 0
        ? netBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : '25,867.40'
      : totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const labelText = viewMode === 'BALANCE' ? 'Total Balance' : 'Total Spent';
  const cardHolderName = user?.name || 'Khaled Nayeem';

  const handleToggleHide = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setIsBalanceHidden(!isBalanceHidden);
  };

  const handleToggleViewMode = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setViewMode(viewMode === 'BALANCE' ? 'EXPENSE' : 'BALANCE');
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    if (width > 0) {
      setCardWidth(width);
    }
  };

  // Dimensions for SVG geometry
  const w = cardWidth;
  const h = 185;
  const dip = 18; // smooth scoop depth
  const r = 26; // bottom corner radius

  // Main pocket curved body
  const pocketPath = `
    M 0,${dip}
    Q ${w / 2},${dip + 16} ${w},${dip}
    L ${w},${h - r}
    Q ${w},${h} ${w - r},${h}
    L ${r},${h}
    Q 0,${h} 0,${h - r}
    Z
  `;

  // Top lip highlight curve
  const topLipPath = `M 0,${dip} Q ${w / 2},${dip + 16} ${w},${dip}`;

  // Top curved stitch line
  const topStitchPath = `M 6,${dip + 5} Q ${w / 2},${dip + 21} ${w - 6},${dip + 5}`;

  // Perimeter stitch line
  const perimeterStitchPath = `
    M 8,${dip + 12}
    L 8,${h - r}
    Q 8,${h - 8} ${r},${h - 8}
    L ${w - r},${h - 8}
    Q ${w - 8},${h - 8} ${w - 8},${h - r}
    L ${w - 8},${dip + 12}
  `;

  return (
    <TouchableOpacity
      activeOpacity={0.94}
      onPress={onPress}
      onLayout={onLayout}
      style={styles.container}>
      {/* 3D WALLET SLEEVE BASE */}
      <View style={styles.walletOuterFrame}>
        {/* TOP CARD 1 (BACK CARD LIP) */}
        <View style={styles.backCardLip} />

        {/* TOP CARD 2 (METALLIC LAVENDER VISA CARD) */}
        <View style={styles.lavenderCard}>
          {/* TOP ROW: NAME & VISA */}
          <View style={styles.cardHeaderRow}>
            <Text numberOfLines={1} style={styles.cardHolderText}>
              {cardHolderName}
            </Text>
            <Text style={styles.visaWordmark}>VISA</Text>
          </View>

          {/* SECOND ROW: MASKED NUMBER & EXPIRY */}
          <View style={styles.cardSubRow}>
            <Text style={styles.cardNumberMasked}>•••• •••• •••• 5678</Text>
            <Text style={styles.validThruText}>Valid: 05/29</Text>
          </View>
        </View>

        {/* FRONT 3D LEATHER POUCH */}
        <View style={styles.pocketWrapper}>
          {/* SVG 3D LEATHER MATERIAL & LIGHTING */}
          <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
            <Defs>
              {/* PRIMARY 3D LEATHER BODY GRADIENT */}
              <LinearGradient id="leatherPouchGrad" x1="0.5" y1="0" x2="0.5" y2="1">
                <Stop offset="0%" stopColor="#6C1EBE" stopOpacity="1" />
                <Stop offset="25%" stopColor="#5B16A4" stopOpacity="1" />
                <Stop offset="65%" stopColor="#450E80" stopOpacity="1" />
                <Stop offset="100%" stopColor="#2E0858" stopOpacity="1" />
              </LinearGradient>

              {/* SPECULAR SHEEN HIGHLIGHT */}
              <RadialGradient
                id="specularSheen"
                cx="50%"
                cy="35%"
                rx="60%"
                ry="45%"
                fx="50%"
                fy="25%">
                <Stop offset="0%" stopColor="#964AF5" stopOpacity="0.45" />
                <Stop offset="60%" stopColor="#7522D6" stopOpacity="0.1" />
                <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </RadialGradient>

              {/* TOP LIP GLOSS RIM */}
              <LinearGradient id="lipGloss" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0%" stopColor="#8735EE" stopOpacity="0.6" />
                <Stop offset="50%" stopColor="#C494FF" stopOpacity="1" />
                <Stop offset="100%" stopColor="#8735EE" stopOpacity="0.6" />
              </LinearGradient>
            </Defs>

            {/* POCKET BASE LAYER */}
            <Path d={pocketPath} fill="url(#leatherPouchGrad)" />

            {/* SPECULAR LIGHTING OVERLAY */}
            <Path d={pocketPath} fill="url(#specularSheen)" />

            {/* TOP LIP GLOSS STROKE */}
            <Path
              d={topLipPath}
              stroke="url(#lipGloss)"
              strokeWidth="2.2"
              fill="none"
            />

            {/* TOP CURVED THREAD STITCHES */}
            <Path
              d={topStitchPath}
              stroke="rgba(225, 195, 255, 0.5)"
              strokeWidth="1.4"
              strokeDasharray="4,4"
              fill="none"
            />

            {/* PERIMETER THREAD STITCHES */}
            <Path
              d={perimeterStitchPath}
              stroke="rgba(225, 195, 255, 0.35)"
              strokeWidth="1.4"
              strokeDasharray="4,4"
              fill="none"
            />
          </Svg>

          {/* FOREGROUND POUCH CONTENT & CONTROLS */}
          <View style={[styles.pocketInnerContent, { paddingTop: dip + 14 }]}>
            {/* TOTAL BALANCE LABEL */}
            <Text style={styles.balanceLabel}>{labelText}</Text>

            {/* BALANCE AMOUNT */}
            <View style={styles.balanceRow}>
              <Text style={styles.balanceAmount}>
                {isBalanceHidden ? '••••••••' : displayAmount}
              </Text>
              <Text style={styles.currencyCode}>SAR</Text>
            </View>

            {/* ACTION CONTROLS */}
            <View style={styles.actionsRow}>
              {/* + ADD BALANCE PILL BUTTON */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={(e) => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                  onAddPress();
                }}
                style={styles.addBalancePill}>
                <MaterialIcons name="add" size={17} color="#FFFFFF" />
                <Text style={styles.addBalanceText}>Add Balance</Text>
              </TouchableOpacity>

              {/* RIGHT ROUND BUTTONS */}
              <View style={styles.rightButtonsGroup}>
                {/* SWAP / VIEW TOGGLE */}
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={handleToggleViewMode}
                  style={styles.roundGlassBtn}>
                  <MaterialIcons name="swap-horiz" size={19} color="#FFFFFF" />
                </TouchableOpacity>

                {/* HIDE / SHOW BALANCE */}
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={handleToggleHide}
                  style={styles.roundGlassBtn}>
                  <MaterialIcons
                    name={isBalanceHidden ? 'visibility' : 'visibility-off'}
                    size={18}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: 16,
    marginBottom: 8,
  },
  walletOuterFrame: {
    backgroundColor: '#350A60',
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#5D19AC',
    paddingTop: 8,
    position: 'relative',
    shadowColor: '#450F7D',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 12,
  },
  backCardLip: {
    height: 16,
    marginHorizontal: 34,
    backgroundColor: '#6F26C8',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    opacity: 0.65,
    marginBottom: -8,
  },
  lavenderCard: {
    backgroundColor: '#BBA8F5',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    marginHorizontal: 14,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardHolderText: {
    fontFamily: F.sansBold,
    fontSize: 16,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  visaWordmark: {
    fontFamily: F.sansExtraBold,
    fontStyle: 'italic',
    fontSize: 22,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardNumberMasked: {
    fontFamily: F.mono,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 1.5,
  },
  validThruText: {
    fontFamily: F.mono,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  pocketWrapper: {
    marginTop: -38,
    height: 185,
    position: 'relative',
  },
  pocketInnerContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flex: 1,
    justifyContent: 'space-between',
  },
  balanceLabel: {
    fontFamily: F.sansMedium,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginVertical: 2,
  },
  balanceAmount: {
    fontFamily: F.sansExtraBold,
    fontSize: 32,
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  currencyCode: {
    fontFamily: F.mono,
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  addBalancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.32)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addBalanceText: {
    fontFamily: F.sansSemiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  rightButtonsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roundGlassBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.32)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
