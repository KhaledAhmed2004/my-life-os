import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMorningThoughtsStore } from '@/stores/morning-thoughts-store';
import { MorningAlertBanner } from '@/components/morning/morning-alert-banner';
import { VoiceRecorderCard } from '@/components/morning/voice-recorder-card';
import { ThoughtsListCard } from '@/components/morning/thoughts-list-card';
import { Vital } from '@/constants/vital-theme';

export default function MorningHomeScreen() {
  const { initialize, checkMorningTime, isLoading } = useMorningThoughtsStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const onRefresh = async () => {
    setRefreshing(true);
    checkMorningTime();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0D131F" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#F59E0B"
            colors={['#F59E0B']}
          />
        }>
        {/* App Title Header */}
        <View style={styles.appHeader}>
          <View>
            <Text style={styles.appBrand}>MY LIFE OS</Text>
            <Text style={styles.appTitle}>10 Morning Thoughts</Text>
          </View>
          <View style={styles.headerTag}>
            <Text style={styles.headerTagText}>AI Voice Mind</Text>
          </View>
        </View>

        {/* 1. Morning Tracker & Alert Banner */}
        <MorningAlertBanner />

        {/* 2. Voice Recorder & Voice-to-Text */}
        <VoiceRecorderCard />

        {/* 3. 10 Thoughts Review & Save Action */}
        <ThoughtsListCard />

        {/* Bottom Spacing for Floating Tab Bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D131F',
  },
  container: {
    flex: 1,
    backgroundColor: '#0D131F',
  },
  contentContainer: {
    paddingBottom: 24,
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },
  appBrand: {
    color: '#F59E0B',
    fontSize: 11,
    fontFamily: Vital.fonts.bold,
    letterSpacing: 1.5,
  },
  appTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: Vital.fonts.extraBold || Vital.fonts.bold,
    marginTop: 2,
  },
  headerTag: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  headerTagText: {
    color: '#F59E0B',
    fontSize: 11,
    fontFamily: Vital.fonts.bold,
  },
});
