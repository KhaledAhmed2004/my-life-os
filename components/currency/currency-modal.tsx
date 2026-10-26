import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { CurrencyConverterCard } from '@/components/currency/currency-converter-card';
import { CurrencyTickerStrip } from '@/components/currency/currency-ticker-strip';
import { Vital } from '@/constants/vital-theme';
import { useCurrencyStore } from '@/stores/currency-store';

const C = Vital.colors;
const F = Vital.fonts;

interface CurrencyModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CurrencyModal({ visible, onClose }: CurrencyModalProps) {
  const setFromCurrency = useCurrencyStore((s) => s.setFromCurrency);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="currency-exchange" size={20} color="#FF922B" />
              </View>
              <View>
                <Text style={styles.title}>Global Currency & Remittance</Text>
                <Text style={styles.subtitle}>
                  Live exchange rates & freelance payout calculator
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.closeBtn}>
              <MaterialIcons name="close" size={20} color={C.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}>
            {/* Ticker Strip */}
            <View style={styles.tickerSection}>
              <Text style={styles.sectionLabel}>MAJOR RATES TO BDT (৳)</Text>
              <CurrencyTickerStrip onSelectCurrency={(code) => setFromCurrency(code)} />
            </View>

            {/* Converter Card */}
            <CurrencyConverterCard />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#13191C',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 146, 43, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: F.bold,
    fontSize: 16,
    color: C.onSurface,
  },
  subtitle: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.onSurfaceVariant,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1B2226',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 14,
  },
  tickerSection: {
    gap: 6,
    marginHorizontal: -20,
  },
  sectionLabel: {
    fontFamily: F.bold,
    fontSize: 10,
    color: C.onSurfaceVariant,
    letterSpacing: 0.6,
    paddingHorizontal: 20,
  },
});
