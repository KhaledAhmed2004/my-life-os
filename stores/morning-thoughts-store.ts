import { create } from 'zustand';
import { Platform } from 'react-native';
import {
  AudioModule,
  RecordingPresets,
  createAudioPlayer,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import type { AudioRecorder, AudioPlayer, RecordingOptions } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import {
  MorningConfig,
  MorningSession,
  MorningThoughtItem,
} from '@/types/morning-thoughts';
import {
  DEFAULT_FALLBACK_THOUGHTS,
  loadSessionsFromStorage,
  saveSessionsToStorage,
  transcribeAudioWithGemini,
  getStoredItem,
  setStoredItem,
} from '@/services/morning-thoughts-service';

const CONFIG_STORAGE_KEY = 'morning_config_v1';

function formatTodayDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatCurrentTime(): string {
  const d = new Date();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

function getPlatformRecordingOptions(options: RecordingOptions): any {
  const commonOptions = {
    extension: options.extension,
    sampleRate: options.sampleRate,
    numberOfChannels: options.numberOfChannels,
    bitRate: options.bitRate,
    isMeteringEnabled: options.isMeteringEnabled ?? false,
  };

  if (Platform.OS === 'ios') {
    return {
      ...commonOptions,
      directory: options.directory,
      ...options.ios,
    };
  } else if (Platform.OS === 'android') {
    return {
      ...commonOptions,
      directory: options.directory,
      ...options.android,
    };
  } else {
    return {
      ...commonOptions,
      ...options.web,
    };
  }
}

interface MorningThoughtsState {
  sessions: MorningSession[];
  isLoading: boolean;
  
  // Morning Tracking
  isMorningNow: boolean;
  isSimulatedMorning: boolean;
  morningGreeting: string;
  hasRecordedToday: boolean;
  config: MorningConfig;

  // Recording State
  recording: AudioRecorder | null;
  isRecording: boolean;
  recordingDurationSec: number;
  timerIntervalId: any | null;
  recordedAudioUri: string | null;

  // Sound Playback
  sound: AudioPlayer | null;
  isPlayingAudio: boolean;
  playbackPositionSec: number;

  // Current Draft Thoughts (10 Items)
  transcript: string;
  currentThoughts: MorningThoughtItem[];
  aiSummary: string;
  isTranscribing: boolean;
  statusMessage: string;

  // Actions
  initialize: () => Promise<void>;
  checkMorningTime: () => void;
  toggleMorningSimulation: (forceState?: boolean) => void;
  
  startRecording: () => Promise<boolean>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => Promise<void>;
  
  playRecordedAudio: () => Promise<void>;
  stopAudioPlayback: () => Promise<void>;

  updateThoughtText: (id: string, text: string) => void;
  toggleThoughtCompletion: (id: string) => void;
  setAllThoughts: (texts: string[]) => void;
  resetDraftThoughts: () => void;

  saveSession: () => Promise<boolean>;
  deleteSession: (id: string) => Promise<void>;
  updateConfig: (updates: Partial<MorningConfig>) => Promise<void>;
}

export const useMorningThoughtsStore = create<MorningThoughtsState>((set, get) => ({
  sessions: [],
  isLoading: true,

  isMorningNow: false,
  isSimulatedMorning: false,
  morningGreeting: 'Good morning! What are your 10 thoughts today?',
  hasRecordedToday: false,
  config: {
    startHour: 5, // 5:00 AM
    endHour: 12, // 12:00 PM
    autoDetect: true,
    voiceGuidance: true,
    customApiKey: '',
  },

  recording: null,
  isRecording: false,
  recordingDurationSec: 0,
  timerIntervalId: null,
  recordedAudioUri: null,

  sound: null,
  isPlayingAudio: false,
  playbackPositionSec: 0,

  transcript: '',
  currentThoughts: DEFAULT_FALLBACK_THOUGHTS.map((t, idx) => ({
    id: `th-${idx + 1}`,
    order: idx + 1,
    text: t.replace(/^(\d+[\.\:\-]\s*)/, ''),
    isCompleted: false,
  })),
  aiSummary: "Today's positive morning thoughts and priorities.",
  isTranscribing: false,
  statusMessage: '',

  initialize: async () => {
    try {
      const savedSessions = await loadSessionsFromStorage();
      const rawConfig = await getStoredItem(CONFIG_STORAGE_KEY);
      let parsedConfig = get().config;
      if (rawConfig) {
        try {
          parsedConfig = { ...get().config, ...JSON.parse(rawConfig) };
        } catch {}
      }

      const todayStr = formatTodayDate();
      const recordedToday = savedSessions.some((s) => s.date === todayStr);

      set({
        sessions: savedSessions,
        config: parsedConfig,
        hasRecordedToday: recordedToday,
        isLoading: false,
      });

      get().checkMorningTime();
    } catch (err) {
      console.warn('Error initializing morning store:', err);
      set({ isLoading: false });
    }
  },

  checkMorningTime: () => {
    const { config, isSimulatedMorning, sessions } = get();
    const now = new Date();
    const currentHour = now.getHours();
    
    // Morning is typically between startHour (5 AM) and endHour (12 PM)
    const isActualMorning =
      currentHour >= config.startHour && currentHour < config.endHour;

    const todayStr = formatTodayDate();
    const recordedToday = sessions.some((s) => s.date === todayStr);

    const isMorning = isSimulatedMorning || isActualMorning;

    let greeting = 'Good morning! Morning has arrived.';
    if (!recordedToday) {
      greeting = '🌅 Good morning! What are you thinking today? Speak your 10 morning thoughts.';
    } else {
      greeting = "✨ Today's 10 morning thoughts have been successfully recorded!";
    }

    set({
      isMorningNow: isMorning,
      hasRecordedToday: recordedToday,
      morningGreeting: greeting,
    });
  },

  toggleMorningSimulation: (forceState?: boolean) => {
    const newState = forceState !== undefined ? forceState : !get().isSimulatedMorning;
    set({ isSimulatedMorning: newState });
    get().checkMorningTime();
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  startRecording: async () => {
    try {
      // Check or request permissions
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        set({ statusMessage: 'Microphone permission was not granted.' });
        return false;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      // Clear any previous sound or recording
      if (get().sound) {
        try {
          get().sound?.pause();
          get().sound?.remove();
        } catch {}
        set({ sound: null, isPlayingAudio: false });
      }
      if (get().recording) {
        try {
          await get().recording?.stop();
        } catch {}
      }

      const platformOptions = getPlatformRecordingOptions(RecordingPresets.HIGH_QUALITY);
      const newRecording = new AudioModule.AudioRecorder(platformOptions);
      await newRecording.prepareToRecordAsync();
      newRecording.record();

      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Start duration counter
      const interval = setInterval(() => {
        set((s) => ({ recordingDurationSec: s.recordingDurationSec + 1 }));
      }, 1000);

      set({
        recording: newRecording,
        isRecording: true,
        recordingDurationSec: 0,
        timerIntervalId: interval,
        statusMessage: 'Recording in progress... speak your thoughts.',
      });

      return true;
    } catch (err) {
      console.warn('Failed to start recording:', err);
      set({ statusMessage: 'Failed to start recording.' });
      return false;
    }
  },

  stopRecording: async () => {
    const { recording, timerIntervalId, config } = get();
    if (!recording) return;

    if (timerIntervalId) {
      clearInterval(timerIntervalId);
    }

    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      set({
        isRecording: false,
        timerIntervalId: null,
        isTranscribing: true,
        statusMessage: 'Transcribing voice and structuring 10 thoughts...',
      });

      await recording.stop();
      const uri = recording.uri;

      set({ recording: null, recordedAudioUri: uri });

      if (uri) {
        const result = await transcribeAudioWithGemini(uri, config.customApiKey);
        set({
          transcript: result.transcript,
          currentThoughts: result.thoughts,
          aiSummary: result.aiSummary || '10 morning thoughts ready.',
          isTranscribing: false,
          statusMessage: '10 thoughts prepared! Review and save them below.',
        });
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        set({
          isTranscribing: false,
          statusMessage: 'Audio file not found. You can write thoughts directly below.',
        });
      }
    } catch (err) {
      console.warn('Error stopping recording:', err);
      set({
        isRecording: false,
        isTranscribing: false,
        statusMessage: 'Processing error. You can review your thoughts below.',
      });
    }
  },

  cancelRecording: async () => {
    const { recording, timerIntervalId } = get();
    if (timerIntervalId) clearInterval(timerIntervalId);
    if (recording) {
      try {
        await recording.stop();
      } catch {}
    }
    set({
      recording: null,
      isRecording: false,
      timerIntervalId: null,
      recordingDurationSec: 0,
      statusMessage: '',
    });
  },

  playRecordedAudio: async () => {
    const { recordedAudioUri, sound, isPlayingAudio } = get();
    if (!recordedAudioUri) return;

    if (sound && isPlayingAudio) {
      sound.pause();
      set({ isPlayingAudio: false });
      return;
    }

    try {
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      if (!sound) {
        const newPlayer = createAudioPlayer({ uri: recordedAudioUri });
        newPlayer.addListener('playbackStatusUpdate', (status) => {
          set({
            playbackPositionSec: Math.floor(status.currentTime || 0),
            isPlayingAudio: status.playing,
          });
          if (status.didJustFinish) {
            set({ isPlayingAudio: false, playbackPositionSec: 0 });
          }
        });
        newPlayer.play();
        set({ sound: newPlayer, isPlayingAudio: true });
      } else {
        sound.play();
        set({ isPlayingAudio: true });
      }
    } catch (err) {
      console.warn('Audio playback error:', err);
    }
  },

  stopAudioPlayback: async () => {
    const { sound } = get();
    if (sound) {
      try {
        sound.pause();
        await sound.seekTo(0);
      } catch {}
      set({ isPlayingAudio: false, playbackPositionSec: 0 });
    }
  },

  updateThoughtText: (id: string, text: string) => {
    set((state) => ({
      currentThoughts: state.currentThoughts.map((t) =>
        t.id === id ? { ...t, text } : t
      ),
    }));
  },

  toggleThoughtCompletion: (id: string) => {
    set((state) => ({
      currentThoughts: state.currentThoughts.map((t) =>
        t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
      ),
    }));
  },

  setAllThoughts: (texts: string[]) => {
    const updated = texts.slice(0, 10).map((text, idx) => ({
      id: `th-${Date.now()}-${idx + 1}`,
      order: idx + 1,
      text,
      isCompleted: false,
    }));
    set({ currentThoughts: updated });
  },

  resetDraftThoughts: () => {
    set({
      currentThoughts: DEFAULT_FALLBACK_THOUGHTS.map((t, idx) => ({
        id: `th-${Date.now()}-${idx + 1}`,
        order: idx + 1,
        text: t.replace(/^(\d+[\.\:\-]\s*)/, ''),
        isCompleted: false,
      })),
      transcript: '',
      recordedAudioUri: null,
      statusMessage: '',
    });
  },

  saveSession: async () => {
    const {
      currentThoughts,
      transcript,
      recordedAudioUri,
      recordingDurationSec,
      aiSummary,
      sessions,
    } = get();

    if (!currentThoughts || currentThoughts.length === 0) {
      return false;
    }

    try {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const newSession: MorningSession = {
        id: `session-${Date.now()}`,
        date: formatTodayDate(),
        time: formatCurrentTime(),
        timestamp: Date.now(),
        transcript: transcript || '10 morning thoughts saved.',
        thoughts: [...currentThoughts],
        audioUri: recordedAudioUri || undefined,
        audioDurationSec: recordingDurationSec || undefined,
        aiSummary: aiSummary || "Today's inspiring morning thoughts and goals.",
      };

      const updatedSessions = [newSession, ...sessions];
      await saveSessionsToStorage(updatedSessions);

      set({
        sessions: updatedSessions,
        hasRecordedToday: true,
        statusMessage: "🎉 Today's 10 morning thoughts have been saved!",
      });

      get().checkMorningTime();
      return true;
    } catch (err) {
      console.warn('Failed to save session:', err);
      return false;
    }
  },

  deleteSession: async (id: string) => {
    const { sessions } = get();
    const filtered = sessions.filter((s) => s.id !== id);
    await saveSessionsToStorage(filtered);
    set({ sessions: filtered });
    get().checkMorningTime();
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  updateConfig: async (updates: Partial<MorningConfig>) => {
    const newConfig = { ...get().config, ...updates };
    set({ config: newConfig });
    await setStoredItem(CONFIG_STORAGE_KEY, JSON.stringify(newConfig));
    get().checkMorningTime();
  },
}));
