import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useMorningThoughtsStore } from '@/stores/morning-thoughts-store';
import { Vital } from '@/constants/vital-theme';

export function VoiceRecorderCard() {
  const {
    isRecording,
    recordingDurationSec,
    isTranscribing,
    statusMessage,
    startRecording,
    stopRecording,
    cancelRecording,
    recordedAudioUri,
    isPlayingAudio,
    playRecordedAudio,
    stopAudioPlayback,
  } = useMorningThoughtsStore();

  // Animation values for pulsing wave aura
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);

  useEffect(() => {
    if (isRecording) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.35, { duration: 700, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 700, easing: Easing.in(Easing.ease) })
        ),
        -1,
        true
      );
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.15, { duration: 700 }),
          withTiming(0.7, { duration: 700 })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 200 });
      pulseOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isRecording, pulseScale, pulseOpacity]);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.cardHeaderTitle}>🎙️ Record Morning Thoughts</Text>
      <Text style={styles.cardHeaderSubtitle}>
        Hold or tap the microphone to speak your 10 morning thoughts. AI will transcribe and organize them automatically.
      </Text>

      {/* Mic Animation & Button Area */}
      <View style={styles.micArea}>
        {/* Pulsing Ring (Visible during recording) */}
        {isRecording && (
          <Animated.View style={[styles.pulseRing, animatedPulseStyle]} />
        )}

        <Pressable
          style={[
            styles.micButton,
            isRecording ? styles.micButtonRecording : styles.micButtonIdle,
          ]}
          onPress={() => {
            if (isRecording) {
              void stopRecording();
            } else {
              void startRecording();
            }
          }}
          android_ripple={{ color: 'rgba(255,255,255,0.2)' }}>
          {isTranscribing ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : (
            <MaterialIcons
              name={isRecording ? 'stop' : 'mic'}
              size={38}
              color="#FFFFFF"
            />
          )}
        </Pressable>
      </View>

      {/* Recording Duration / Status */}
      {isRecording && (
        <View style={styles.timerBadge}>
          <View style={styles.recordingRedDot} />
          <Text style={styles.timerText}>{formatTimer(recordingDurationSec)}</Text>
          <Text style={styles.recordingLabel}>Recording...</Text>
        </View>
      )}

      {/* Transcribing state */}
      {isTranscribing && (
        <View style={styles.transcribingBox}>
          <ActivityIndicator size="small" color="#F59E0B" style={{ marginRight: 8 }} />
          <Text style={styles.transcribingText}>
            Transcribing voice into 10 thoughts...
          </Text>
        </View>
      )}

      {/* Status Message */}
      {statusMessage ? (
        <Text style={styles.statusMessageText}>{statusMessage}</Text>
      ) : null}

      {/* Action Controls when Recording */}
      {isRecording && (
        <View style={styles.recordControlsRow}>
          <Pressable
            style={styles.cancelButton}
            onPress={() => void cancelRecording()}>
            <MaterialIcons name="close" size={16} color="#EF4444" />
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>

          <Pressable
            style={styles.doneButton}
            onPress={() => void stopRecording()}>
            <MaterialIcons name="check" size={16} color="#FFFFFF" />
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        </View>
      )}

      {/* Audio Playback Bar if Audio is available */}
      {recordedAudioUri && !isRecording && (
        <View style={styles.audioPlayerBox}>
          <Pressable
            style={styles.playButton}
            onPress={() => {
              if (isPlayingAudio) {
                void stopAudioPlayback();
              } else {
                void playRecordedAudio();
              }
            }}>
            <MaterialIcons
              name={isPlayingAudio ? 'pause' : 'play-arrow'}
              size={24}
              color="#F59E0B"
            />
          </Pressable>

          <View style={styles.audioInfoCol}>
            <Text style={styles.audioTitle}>Recorded Voice Note</Text>
            <Text style={styles.audioSubtitle}>
              {isPlayingAudio ? 'Playing...' : 'Tap to listen'}
            </Text>
          </View>

          <Pressable
            style={styles.reRecordBtn}
            onPress={() => void startRecording()}>
            <MaterialIcons name="replay" size={16} color="#94A3B8" />
            <Text style={styles.reRecordText}>Record Again</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#161F2E',
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardHeaderTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontFamily: Vital.fonts.bold,
    marginBottom: 6,
  },
  cardHeaderSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    fontFamily: Vital.fonts.regular,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  micArea: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: 120,
    height: 120,
    marginVertical: 8,
  },
  pulseRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(239, 68, 68, 0.35)',
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  micButtonIdle: {
    backgroundColor: '#F59E0B',
  },
  micButtonRecording: {
    backgroundColor: '#EF4444',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  recordingRedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  timerText: {
    color: '#F8FAFC',
    fontFamily: Vital.fonts.bold,
    fontSize: 15,
    marginRight: 6,
  },
  recordingLabel: {
    color: '#EF4444',
    fontFamily: Vital.fonts.medium,
    fontSize: 12,
  },
  transcribingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  transcribingText: {
    color: '#FDE68A',
    fontSize: 13,
    fontFamily: Vital.fonts.medium,
  },
  statusMessageText: {
    color: '#CBD5E1',
    fontSize: 12.5,
    fontFamily: Vital.fonts.medium,
    marginTop: 10,
    textAlign: 'center',
  },
  recordControlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 14,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  cancelText: {
    color: '#EF4444',
    fontSize: 12,
    fontFamily: Vital.fonts.medium,
    marginLeft: 4,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#10B981',
  },
  doneText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: Vital.fonts.bold,
    marginLeft: 4,
  },
  audioPlayerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 14,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  audioInfoCol: {
    flex: 1,
  },
  audioTitle: {
    color: '#F1F5F9',
    fontSize: 13,
    fontFamily: Vital.fonts.semiBold,
  },
  audioSubtitle: {
    color: '#64748B',
    fontSize: 11,
    fontFamily: Vital.fonts.regular,
  },
  reRecordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  reRecordText: {
    color: '#94A3B8',
    fontSize: 11,
    fontFamily: Vital.fonts.medium,
    marginLeft: 4,
  },
});
