export interface MorningThoughtItem {
  id: string;
  order: number; // 1 to 10
  text: string;
  isCompleted?: boolean;
}

export interface MorningSession {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM AM/PM
  timestamp: number;
  transcript: string;
  thoughts: MorningThoughtItem[];
  audioUri?: string;
  audioDurationSec?: number;
  aiSummary?: string;
}

export interface MorningConfig {
  startHour: number; // e.g. 5 (5:00 AM)
  endHour: number; // e.g. 12 (12:00 PM)
  autoDetect: boolean;
  voiceGuidance: boolean;
  customApiKey?: string;
}
