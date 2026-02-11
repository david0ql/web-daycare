export enum ActivityTypeEnum {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  SNACK = 'snack',
  NAP = 'nap',
  DIAPER_CHANGE = 'diaper_change',
  CLOTHING_CHANGE = 'clothing_change',
  HYDRATION = 'hydration',
  OTHER = 'other',
}

export interface DailyActivity {
  id: number;
  childId: number;
  attendanceId: number;
  activityType: ActivityTypeEnum;
  completed: boolean;
  timeCompleted?: string;
  notes?: string;
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

export interface CreateDailyActivityData {
  childId: number;
  attendanceId: number;
  activityType: ActivityTypeEnum;
  completed?: boolean;
  timeCompleted?: Date;
  notes?: string;
}

export interface UpdateDailyActivityData extends Partial<CreateDailyActivityData> {}

// Activity type labels
export const ACTIVITY_TYPE_LABELS = {
  [ActivityTypeEnum.BREAKFAST]: 'Breakfast',
  [ActivityTypeEnum.LUNCH]: 'Lunch',
  [ActivityTypeEnum.SNACK]: 'Snack',
  [ActivityTypeEnum.NAP]: 'Nap',
  [ActivityTypeEnum.DIAPER_CHANGE]: 'Diaper Change',
  [ActivityTypeEnum.CLOTHING_CHANGE]: 'Clothing Change',
  [ActivityTypeEnum.HYDRATION]: 'Hydration',
  [ActivityTypeEnum.OTHER]: 'Other',
} as const;

import type { Language } from "../../../shared/contexts/language.context";

export const ACTIVITY_TYPE_LABELS_BY_LANGUAGE: Record<Language, Record<ActivityTypeEnum, string>> = {
  english: ACTIVITY_TYPE_LABELS,
  spanish: {
    [ActivityTypeEnum.BREAKFAST]: "Desayuno",
    [ActivityTypeEnum.LUNCH]: "Almuerzo",
    [ActivityTypeEnum.SNACK]: "Merienda",
    [ActivityTypeEnum.NAP]: "Siesta",
    [ActivityTypeEnum.DIAPER_CHANGE]: "Cambio de pañal",
    [ActivityTypeEnum.CLOTHING_CHANGE]: "Cambio de ropa",
    [ActivityTypeEnum.HYDRATION]: "Hidratación",
    [ActivityTypeEnum.OTHER]: "Otro",
  },
};

// Activity type icons
export const ACTIVITY_TYPE_ICONS = {
  [ActivityTypeEnum.BREAKFAST]: '🍳',
  [ActivityTypeEnum.LUNCH]: '🍽️',
  [ActivityTypeEnum.SNACK]: '🍎',
  [ActivityTypeEnum.NAP]: '😴',
  [ActivityTypeEnum.DIAPER_CHANGE]: '👶',
  [ActivityTypeEnum.CLOTHING_CHANGE]: '👕',
  [ActivityTypeEnum.HYDRATION]: '💧',
  [ActivityTypeEnum.OTHER]: '📝',
} as const;
