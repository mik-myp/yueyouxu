import type { AppSettings, OnboardingInput } from '@/domain/models';

export interface SettingsRepository {
  get(): Promise<AppSettings | null>;
}

export interface OnboardingRepository {
  complete(input: OnboardingInput, completedAt: string): Promise<void>;
}

export type AppRepositories = {
  onboarding: OnboardingRepository;
  settings: SettingsRepository;
};
