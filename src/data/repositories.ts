import type {
  AppSettings,
  OnboardingInput,
  Period,
  PeriodUpdate,
  PredictionSettings,
} from '@/domain/models';

export interface SettingsRepository {
  get(): Promise<AppSettings | null>;
  savePredictionSettings(
    settings: PredictionSettings,
    updatedAt: string,
  ): Promise<void>;
}

export interface OnboardingRepository {
  complete(input: OnboardingInput, completedAt: string): Promise<void>;
}

export interface PeriodRepository {
  get(id: string): Promise<Period | null>;
  list(): Promise<Period[]>;
  remove(id: string): Promise<void>;
  save(id: string, period: PeriodUpdate, updatedAt: string): Promise<void>;
}

export interface DataManagementRepository {
  clearAll(): Promise<void>;
}

export type AppRepositories = {
  dataManagement: DataManagementRepository;
  onboarding: OnboardingRepository;
  periods: PeriodRepository;
  settings: SettingsRepository;
};
