import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMorningThoughtsStore } from '@/stores/morning-thoughts-store';
import { Vital } from '@/constants/vital-theme';

export function ThoughtsListCard() {
  const {
    currentThoughts,
    transcript,
    aiSummary,
    updateThoughtText,
    toggleThoughtCompletion,
    saveSession,
    resetDraftThoughts,
    hasRecordedToday,
  } = useMorningThoughtsStore();

  const [isSaving, setIsSaving] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const success = await saveSession();
    setIsSaving(false);
    if (success) {
      Alert.alert(
        'Success!',
        "Today's 10 morning thoughts have been saved successfully. You can review them anytime in the History tab.",
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Title and Counter */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>🌅 10 Morning Thoughts</Text>
          <Text style={styles.subtitle}>
            Review and edit your thoughts transcribed from voice as needed
          </Text>
        </View>

        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>10/10</Text>
        </View>
      </View>

      {/* AI Summary Banner if present */}
      {aiSummary ? (
        <View style={styles.summaryBox}>
          <MaterialIcons name="auto-awesome" size={16} color="#F59E0B" style={{ marginRight: 6 }} />
          <Text style={styles.summaryText}>{aiSummary}</Text>
        </View>
      ) : null}

      {/* Transcript Collapsible */}
      {transcript ? (
        <View style={styles.transcriptContainer}>
          <Pressable
            style={styles.transcriptToggleRow}
            onPress={() => setShowTranscript(!showTranscript)}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="record-voice-over" size={16} color="#94A3B8" />
              <Text style={styles.transcriptToggleLabel}>
                View Voice Transcript
              </Text>
            </View>
            <MaterialIcons
              name={showTranscript ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={20}
              color="#94A3B8"
            />
          </Pressable>

          {showTranscript && (
            <View style={styles.transcriptContentBox}>
              <Text style={styles.transcriptContentText}>{transcript}</Text>
            </View>
          )}
        </View>
      ) : null}

      {/* 10 Thoughts List */}
      <View style={styles.listArea}>
        {currentThoughts.map((item, index) => (
          <View key={item.id} style={styles.thoughtCard}>
            <Pressable
              style={styles.checkboxArea}
              onPress={() => toggleThoughtCompletion(item.id)}>
              <View
                style={[
                  styles.numberBadge,
                  item.isCompleted ? styles.numberBadgeCompleted : styles.numberBadgeActive,
                ]}>
                <Text
                  style={[
                    styles.numberText,
                    item.isCompleted ? styles.numberTextCompleted : styles.numberTextActive,
                  ]}>
                  {index + 1}
                </Text>
              </View>
            </Pressable>

            <View style={styles.inputCol}>
              <TextInput
                value={item.text}
                onChangeText={(text) => updateThoughtText(item.id, text)}
                multiline
                placeholder={`Thought #${index + 1}...`}
                placeholderTextColor="#64748B"
                style={[
                  styles.thoughtInput,
                  item.isCompleted && styles.thoughtInputCompleted,
                ]}
              />
            </View>

            <Pressable
              style={styles.checkIconBtn}
              onPress={() => toggleThoughtCompletion(item.id)}>
              <MaterialIcons
                name={item.isCompleted ? 'check-circle' : 'radio-button-unchecked'}
                size={20}
                color={item.isCompleted ? '#10B981' : '#475569'}
              />
            </Pressable>
          </View>
        ))}
      </View>

      {/* Save Button & Actions */}
      <View style={styles.footerActions}>
        <Pressable
          style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
          onPress={() => void handleSave()}
          disabled={isSaving}
          android_ripple={{ color: 'rgba(255,255,255,0.2)' }}>
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
          ) : (
            <MaterialIcons name="bookmark-added" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
          )}
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save 10 Thoughts'}
          </Text>
        </Pressable>

        <Pressable
          style={styles.resetButton}
          onPress={resetDraftThoughts}>
          <MaterialIcons name="refresh" size={16} color="#94A3B8" />
          <Text style={styles.resetButtonText}>Reset</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#161F2E',
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 18,
    fontFamily: Vital.fonts.bold,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontFamily: Vital.fonts.regular,
    marginTop: 2,
  },
  counterBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  counterText: {
    color: '#F59E0B',
    fontSize: 12,
    fontFamily: Vital.fonts.bold,
  },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  summaryText: {
    flex: 1,
    color: '#FEF08A',
    fontSize: 12.5,
    fontFamily: Vital.fonts.medium,
  },
  transcriptContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  transcriptToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  transcriptToggleLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontFamily: Vital.fonts.medium,
    marginLeft: 6,
  },
  transcriptContentBox: {
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  transcriptContentText: {
    color: '#94A3B8',
    fontSize: 12.5,
    fontFamily: Vital.fonts.regular,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  listArea: {
    gap: 8,
  },
  thoughtCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  checkboxArea: {
    paddingRight: 8,
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberBadgeActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  numberBadgeCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  numberText: {
    fontSize: 12,
    fontFamily: Vital.fonts.bold,
  },
  numberTextActive: {
    color: '#F59E0B',
  },
  numberTextCompleted: {
    color: '#10B981',
  },
  inputCol: {
    flex: 1,
    paddingHorizontal: 4,
  },
  thoughtInput: {
    color: '#F8FAFC',
    fontSize: 13.5,
    fontFamily: Vital.fonts.regular,
    lineHeight: 19,
    paddingVertical: 4,
  },
  thoughtInputCompleted: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  checkIconBtn: {
    padding: 6,
  },
  footerActions: {
    marginTop: 18,
    alignItems: 'center',
    gap: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#10B981',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: Vital.fonts.bold,
    letterSpacing: 0.3,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  resetButtonText: {
    color: '#94A3B8',
    fontSize: 12,
    fontFamily: Vital.fonts.medium,
    marginLeft: 4,
  },
});
