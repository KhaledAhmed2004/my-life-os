import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMorningThoughtsStore } from '@/stores/morning-thoughts-store';
import { Vital } from '@/constants/vital-theme';

export function MorningAlertBanner() {
  const {
    isMorningNow,
    isSimulatedMorning,
    hasRecordedToday,
    morningGreeting,
    toggleMorningSimulation,
    config,
  } = useMorningThoughtsStore();

  const [currentTimeStr, setCurrentTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setCurrentTimeStr(`${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* Background Glow */}
      <View
        style={[
          styles.glowBackground,
          isMorningNow ? styles.morningGlow : styles.nightGlow,
        ]}
      />

      {/* Top Header: Clock & Tracker Status */}
      <View style={styles.headerRow}>
        <View style={styles.timeBadge}>
          <MaterialIcons
            name={isMorningNow ? 'wb-sunny' : 'nightlight-round'}
            size={18}
            color={isMorningNow ? '#F59E0B' : '#94A3B8'}
          />
          <Text style={styles.timeText}>{currentTimeStr}</Text>
        </View>

        <Pressable
          style={[styles.statusPill, isMorningNow ? styles.statusActive : styles.statusWaiting]}
          onPress={() => toggleMorningSimulation()}
          android_ripple={{ color: 'rgba(255,255,255,0.1)' }}>
          <View style={[styles.dot, isMorningNow ? styles.dotActive : styles.dotWaiting]} />
          <Text style={styles.statusText}>
            {isMorningNow
              ? isSimulatedMorning
                ? 'Morning (Simulated)'
                : 'Morning Active'
              : 'Test Morning Mode'}
          </Text>
          <MaterialIcons name="touch-app" size={14} color="#CBD5E1" style={{ marginLeft: 4 }} />
        </Pressable>
      </View>

      {/* Main Alert Card */}
      <View style={[styles.card, isMorningNow ? styles.cardMorning : styles.cardOff]}>
        <View style={styles.iconCircle}>
          <MaterialIcons
            name={hasRecordedToday ? 'verified' : isMorningNow ? 'wb-twilight' : 'alarm'}
            size={32}
            color={hasRecordedToday ? '#10B981' : isMorningNow ? '#F59E0B' : '#64748B'}
          />
        </View>

        <View style={styles.contentCol}>
          <Text style={styles.titleText}>
            {hasRecordedToday
              ? "🎉 Today's Thoughts Completed!"
              : isMorningNow
              ? '🌅 Good Morning!'
              : 'Morning Tracker Ready'}
          </Text>

          <Text style={styles.subtitleText}>
            {hasRecordedToday
              ? 'Your 10 morning thoughts have been recorded today. Review them below or start a new session.'
              : isMorningNow
              ? 'Morning has arrived! What is on your mind today? Speak your 10 morning thoughts.'
              : `Tracking window: ${config.startHour}:00 AM to ${config.endHour}:00 PM. Tap the button above to simulate morning.`}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  glowBackground: {
    ...StyleSheet.absoluteFill,
    borderRadius: 20,
  },
  morningGlow: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  nightGlow: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  timeText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontFamily: Vital.fonts.medium,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.5)',
  },
  statusWaiting: {
    backgroundColor: 'rgba(71, 85, 105, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  dotActive: {
    backgroundColor: '#F59E0B',
  },
  dotWaiting: {
    backgroundColor: '#94A3B8',
  },
  statusText: {
    color: '#F1F5F9',
    fontSize: 12,
    fontFamily: Vital.fonts.medium,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  cardMorning: {
    backgroundColor: 'transparent',
  },
  cardOff: {
    backgroundColor: 'transparent',
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  contentCol: {
    flex: 1,
  },
  titleText: {
    fontSize: 17,
    color: '#F8FAFC',
    fontFamily: Vital.fonts.bold,
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 13.5,
    color: '#CBD5E1',
    fontFamily: Vital.fonts.regular,
    lineHeight: 20,
  },
});
