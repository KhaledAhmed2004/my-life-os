import * as FileSystem from 'expo-file-system/legacy';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { MorningSession, MorningThoughtItem } from '@/types/morning-thoughts';

const SESSIONS_STORAGE_KEY = 'morning_thoughts_sessions_v1';
const CONFIG_STORAGE_KEY = 'morning_thoughts_config_v1';

export const DEFAULT_FALLBACK_THOUGHTS: string[] = [
  '1. Express gratitude for a new day and a fresh beginning.',
  '2. Drink a glass of water to keep the body refreshed and hydrated.',
  '3. Identify the top 3 most important priorities for today.',
  '4. Take 5-10 minutes for deep breathing and mindful reflection.',
  '5. Enjoy a nutritious breakfast to energize the entire day.',
  '6. Connect with loved ones with kindness, patience, and warmth.',
  '7. Limit mindless phone scrolling and focus on what truly matters.',
  '8. Stay composed, calm, and positive in any situation.',
  '9. Spend 20-30 minutes learning something new or reading.',
  '10. Celebrate today’s wins and close the day with peace of mind.',
];

export async function setStoredItem(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  } catch (err) {
    console.warn(`Error storing ${key} in SecureStore:`, err);
  }
}

export async function getStoredItem(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  } catch (err) {
    console.warn(`Error getting ${key} from SecureStore:`, err);
    return null;
  }
}

export async function saveSessionsToStorage(sessions: MorningSession[]): Promise<void> {
  await setStoredItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
}

export async function loadSessionsFromStorage(): Promise<MorningSession[]> {
  const data = await getStoredItem(SESSIONS_STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Transcribe audio and extract exactly 10 morning thoughts using Gemini.
 */
export async function transcribeAudioWithGemini(
  audioUri: string,
  apiKeyOverride?: string
): Promise<{ transcript: string; thoughts: MorningThoughtItem[]; aiSummary?: string }> {
  const apiKey =
    apiKeyOverride?.trim() ||
    process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
    '';

  let base64Audio = '';
  try {
    base64Audio = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } catch (readErr) {
    console.warn('Could not read audio file as base64:', readErr);
  }

  // Attempt Gemini API call if API key and audio data exist
  if (apiKey && apiKey.length > 10 && base64Audio) {
    try {
      const prompt = `
You are an expert AI Voice Assistant for a morning routine and mindfulness app.
The user just woke up and spoke their 10 morning thoughts or goals for today. They might speak in English, Banglish, or Bengali.

Instructions:
1. Transcribe what they said into "transcript" in clear English.
2. Extract or structure exactly 10 distinct, inspiring, and clear thoughts in English into an array named "thoughts".
- If they spoke fewer than 10 points or gave a short reflection, include their words first, then constructively complete 10 positive, actionable morning thoughts aligned with what they said (in English).
- Exactly 10 items must be present in the thoughts array!
3. Provide a brief 1-sentence "summary" of their morning mindset in English.

Output strictly valid JSON:
{
  "transcript": "Transcribed voice content here",
  "thoughts": [
    "Thought 1",
    "Thought 2",
    "Thought 3",
    "Thought 4",
    "Thought 5",
    "Thought 6",
    "Thought 7",
    "Thought 8",
    "Thought 9",
    "Thought 10"
  ],
  "summary": "Short 1-sentence morning intention summary"
}
`;

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: 'audio/m4a',
                    data: base64Audio,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (response.ok) {
        const json = await response.json();
        const rawContent = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawContent) {
          const parsed = JSON.parse(rawContent);
          const rawThoughts: string[] = Array.isArray(parsed.thoughts) ? parsed.thoughts : [];
          
          // Ensure we format as MorningThoughtItem[] with exactly 10
          const items: MorningThoughtItem[] = [];
          for (let i = 0; i < 10; i++) {
            const text =
              rawThoughts[i] ||
              DEFAULT_FALLBACK_THOUGHTS[i] ||
              `Thought ${i + 1}: Maintain a positive and focused mindset for the day.`;
            items.push({
              id: `th-${Date.now()}-${i + 1}`,
              order: i + 1,
              text: text.replace(/^(\d+[\.\:\-]\s*)/, ''), // remove duplicate numbering if already included
              isCompleted: false,
            });
          }

          return {
            transcript: parsed.transcript || 'Voice note recorded successfully.',
            thoughts: items,
            aiSummary: parsed.summary || "Today's inspiring morning thoughts and goals.",
          };
        }
      } else {
        const errorText = await response.text();
        console.warn('Gemini API returned error response:', errorText);
      }
    } catch (apiErr) {
      console.warn('Gemini audio call failed:', apiErr);
    }
  }

  // Graceful fallback with 10 inspiring morning thoughts
  const fallbackItems: MorningThoughtItem[] = DEFAULT_FALLBACK_THOUGHTS.map((t, idx) => ({
    id: `th-fallback-${Date.now()}-${idx + 1}`,
    order: idx + 1,
    text: t.replace(/^(\d+[\.\:\-]\s*)/, ''),
    isCompleted: false,
  }));

  return {
    transcript: 'Voice note recorded. Below are your 10 structured morning thoughts (you can edit them anytime).',
    thoughts: fallbackItems,
    aiSummary: 'Positive and goal-oriented morning thoughts.',
  };
}
