import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMorningThoughtsStore } from '@/stores/morning-thoughts-store';
import { Vital } from '@/constants/vital-theme';

export default function MorningSettingsScreen() {
  const {
    config,
    updateConfig,
    isSimulatedMorning,
    toggleMorningSimulation,
    sessions,
  } = useMorningThoughtsStore();

  const [customKey, setCustomKey] = useState(config.customApiKey || '');
  const [startHour, setStartHour] = useState(String(config.startHour));
  const [endHour, setEndHour] = useState(String(config.endHour));

  const handleSaveConfig = async () => {
    const sH = parseInt(startHour, 10);
    const eH = parseInt(endHour, 10);

    await updateConfig({
      customApiKey: customKey.trim(),
      startHour: isNaN(sH) ? 5 : sH,
      endHour: isNaN(eH) ? 12 : eH,
    });

    Alert.alert('Success!', 'Settings saved successfully.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>⚙️ Settings & Configuration</Text>
          <Text style={styles.subtitle}>
            Configure morning tracker schedule and AI voice processing
          </Text>
        </View>

        {/* Morning Tracker Window Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌅 Morning Tracking Schedule</Text>
          <Text style={styles.cardDesc}>
            Set the time window when the app detects morning and prompts you for 10 thoughts:
          </Text>

          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Text style={styles.inputLabel}>Start Hour (0-23)</Text>
              <TextInput
                value={startHour}
                onChangeText={setStartHour}
                keyboardType="numeric"
                style={styles.input}
                placeholder="5"
                placeholderTextColor="#64748B"
              />
              <Text style={styles.helperText}>Default: 5 AM</Text>
            </View>

            <View style={styles.halfCol}>
              <Text style={styles.inputLabel}>End Hour (0-23)</Text>
              <TextInput
                value={endHour}
                onChangeText={setEndHour}
                keyboardType="numeric"
                style={styles.input}
                placeholder="12"
                placeholderTextColor="#64748B"
              />
              <Text style={styles.helperText}>Default: 12 PM (Noon)</Text>
            </View>
          </View>
        </View>

        {/* Test Morning Mode Simulation */}
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.cardTitle}>⚡ Test Morning Mode (Simulation)</Text>
              <Text style={styles.cardDesc}>
                Enable this toggle to simulate morning mode anytime regardless of current clock time.
              </Text>
            </View>
            <Switch
              value={isSimulatedMorning}
              onValueChange={() => toggleMorningSimulation()}
              trackColor={{ false: '#334155', true: '#F59E0B' }}
              thumbColor={isSimulatedMorning ? '#FFFFFF' : '#94A3B8'}
            />
          </View>
        </View>

        {/* Gemini API Key Configuration */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🤖 Google Gemini AI Key</Text>
          <Text style={styles.cardDesc}>
            Provide your Gemini API key to automatically transcribe voice audio and structure 10 morning thoughts:
          </Text>

          <TextInput
            value={customKey}
            onChangeText={setCustomKey}
            placeholder="AIzaSy..."
            placeholderTextColor="#64748B"
            secureTextEntry
            style={styles.input}
          />
          <Text style={styles.helperText}>
            Obtain a free API key from Google AI Studio (aistudio.google.com).
          </Text>
        </View>

        {/* Save Settings Button */}
        <Pressable style={styles.saveBtn} onPress={handleSaveConfig}>
          <MaterialIcons name="check" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.saveBtnText}>Save Settings</Text>
        </Pressable>

        {/* App Info Box */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>My Life OS • Morning Mind</Text>
          <Text style={styles.infoDesc}>
            Total saved morning sessions: {sessions.length}{'\n'}
            Automatic morning detection & prompt{'\n'}
            Voice recording & 10 thoughts structuring
          </Text>
        </View>

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
    padding: 18,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 22,
    fontFamily: Vital.fonts.bold,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 13,
    fontFamily: Vital.fonts.regular,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#161F2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontFamily: Vital.fonts.bold,
    marginBottom: 4,
  },
  cardDesc: {
    color: '#94A3B8',
    fontSize: 12.5,
    fontFamily: Vital.fonts.regular,
    lineHeight: 18,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCol: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontFamily: Vital.fonts.medium,
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: Vital.fonts.regular,
  },
  helperText: {
    color: '#64748B',
    fontSize: 11,
    fontFamily: Vital.fonts.regular,
    marginTop: 4,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 20,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: Vital.fonts.bold,
  },
  infoCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  infoTitle: {
    color: '#F59E0B',
    fontSize: 13,
    fontFamily: Vital.fonts.bold,
    marginBottom: 6,
  },
  infoDesc: {
    color: '#64748B',
    fontSize: 12,
    fontFamily: Vital.fonts.regular,
    textAlign: 'center',
    lineHeight: 18,
  },
});
