import type {
  AppSettings,
  OnboardingInput,
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

export interface DataManagementRepository {
  clearAll(): Promise<void>;
}

export type AppRepositories = {
  dataManagement: DataManagementRepository;
  onboarding: OnboardingRepository;
  settings: SettingsRepository;
};
