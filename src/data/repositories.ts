import type {
  AppSettings,
  DailyRecord,
  DailyRecordUpdate,
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

export interface DailyRecordRepository {
  get(recordDate: string): Promise<DailyRecord | null>;
  list(): Promise<DailyRecord[]>;
  remove(recordDate: string): Promise<void>;
  save(
    recordDate: string,
    record: DailyRecordUpdate,
    updatedAt: string,
  ): Promise<void>;
}

export interface DataManagementRepository {
  clearAll(): Promise<void>;
}

export type AppRepositories = {
  dataManagement: DataManagementRepository;
  dailyRecords: DailyRecordRepository;
  onboarding: OnboardingRepository;
  periods: PeriodRepository;
  settings: SettingsRepository;
};
