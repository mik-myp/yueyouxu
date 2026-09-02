import type { LocalDate } from './local-date';

export type PredictionSettings = {
  automaticCalculation: boolean;
  referenceCycleLength: number;
  referencePeriodLength: number;
};

export type AppSettings = PredictionSettings & {
  onboardingCompleted: boolean;
  timeZone: string;
  updatedAt: string;
};

export type Period = {
  endDate: LocalDate | null;
  id: string;
  source: 'manual';
  startDate: LocalDate;
  timeZone: string;
};

export type PeriodUpdate = {
  endDate: LocalDate | null;
  startDate: LocalDate;
  timeZone: string;
};

export type DailyRecord = {
  flow: string | null;
  id: string;
  mood: string | null;
  note: string | null;
  pain: string | null;
  recordDate: LocalDate;
  symptoms: string[];
  timeZone: string;
};

export type DailyRecordUpdate = Omit<DailyRecord, 'id' | 'recordDate'>;

export type PredictionWindow = {
  confidence: 'low' | 'medium' | 'high';
  centerDate: LocalDate;
  earliestDate: LocalDate;
  latestDate: LocalDate;
  sampleCount: number;
};

export type OnboardingInput = PredictionSettings & {
  lastPeriodStartDate: LocalDate;
  timeZone: string;
};

export const DEFAULT_PREDICTION_SETTINGS: PredictionSettings = {
  automaticCalculation: true,
  referenceCycleLength: 28,
  referencePeriodLength: 5,
};

export function validatePredictionSettings(settings: PredictionSettings) {
  if (
    !Number.isInteger(settings.referenceCycleLength) ||
    settings.referenceCycleLength < 20 ||
    settings.referenceCycleLength > 45
  ) {
    throw new Error('初始周期长度必须在 20～45 天之间');
  }

  if (
    !Number.isInteger(settings.referencePeriodLength) ||
    settings.referencePeriodLength < 2 ||
    settings.referencePeriodLength > 10
  ) {
    throw new Error('初始经期长度必须在 2～10 天之间');
  }
}
