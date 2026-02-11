export enum MoodEnum {
  HAPPY = 'happy',
  SAD = 'sad',
  TIRED = 'tired',
  ENERGETIC = 'energetic',
  CALM = 'calm',
  CRANKY = 'cranky',
  NEUTRAL = 'neutral',
}

export interface DailyObservation {
  id: number;
  childId: number;
  attendanceId: number;
  mood: MoodEnum;
  generalObservations?: string;
  createdBy: number;
  createdAt: string;
  // Relations
  child?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  attendance?: {
    id: number;
    attendanceDate: string;
  };
  createdByUser?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface CreateDailyObservationData {
  childId: number;
  attendanceId: number;
  mood: MoodEnum;
  generalObservations?: string;
}

export interface UpdateDailyObservationData extends Partial<CreateDailyObservationData> {}

// Mood labels
export const MOOD_LABELS = {
  [MoodEnum.HAPPY]: 'Happy',
  [MoodEnum.SAD]: 'Sad',
  [MoodEnum.TIRED]: 'Tired',
  [MoodEnum.ENERGETIC]: 'Energetic',
  [MoodEnum.CALM]: 'Calm',
  [MoodEnum.CRANKY]: 'Cranky',
  [MoodEnum.NEUTRAL]: 'Neutral',
} as const;

import type { Language } from "../../../shared/contexts/language.context";

export const MOOD_LABELS_BY_LANGUAGE: Record<Language, Record<MoodEnum, string>> = {
  english: MOOD_LABELS,
  spanish: {
    [MoodEnum.HAPPY]: "Feliz",
    [MoodEnum.SAD]: "Triste",
    [MoodEnum.TIRED]: "Cansado",
    [MoodEnum.ENERGETIC]: "Energético",
    [MoodEnum.CALM]: "Tranquilo",
    [MoodEnum.CRANKY]: "Irritable",
    [MoodEnum.NEUTRAL]: "Neutral",
  },
};

// Mood colors
export const MOOD_COLORS = {
  [MoodEnum.HAPPY]: '#52c41a',
  [MoodEnum.SAD]: '#ff4d4f',
  [MoodEnum.TIRED]: '#fa8c16',
  [MoodEnum.ENERGETIC]: '#1890ff',
  [MoodEnum.CALM]: '#722ed1',
  [MoodEnum.CRANKY]: '#f5222d',
  [MoodEnum.NEUTRAL]: '#8c8c8c',
} as const;

// Mood icons
export const MOOD_ICONS = {
  [MoodEnum.HAPPY]: '😊',
  [MoodEnum.SAD]: '😢',
  [MoodEnum.TIRED]: '😴',
  [MoodEnum.ENERGETIC]: '⚡',
  [MoodEnum.CALM]: '😌',
  [MoodEnum.CRANKY]: '😠',
  [MoodEnum.NEUTRAL]: '😐',
} as const;
