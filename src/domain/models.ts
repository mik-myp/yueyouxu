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
