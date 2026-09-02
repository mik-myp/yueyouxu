import type { AppSettings, OnboardingInput } from '@/domain/models';
import { validatePredictionSettings } from '@/domain/models';

import type { AppRepositories } from './repositories';

const STORAGE_KEY = 'yueyouxu.web-preview.v1';

type WebPreviewState = {
  lastPeriodStartDate: string | null;
  settings: AppSettings | null;
};

function readState(): WebPreviewState {
  const serialized = globalThis.localStorage?.getItem(STORAGE_KEY);
  if (!serialized) return { lastPeriodStartDate: null, settings: null };

  try {
    return JSON.parse(serialized) as WebPreviewState;
  } catch {
    return { lastPeriodStartDate: null, settings: null };
  }
}

function writeState(state: WebPreviewState) {
  globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function createAppRepositories(): Promise<AppRepositories> {
  return {
    dataManagement: {
      async clearAll() {
        globalThis.localStorage?.removeItem(STORAGE_KEY);
      },
    },
    settings: {
      async get() {
        return readState().settings;
      },
      async savePredictionSettings(settings, updatedAt) {
        validatePredictionSettings(settings);
        const current = readState();
        if (!current.settings) throw new Error('请先完成首次初始化');
        writeState({
          ...current,
          settings: { ...current.settings, ...settings, updatedAt },
        });
      },
    },
    onboarding: {
      async complete(input: OnboardingInput, completedAt: string) {
        validatePredictionSettings(input);
        writeState({
          lastPeriodStartDate: input.lastPeriodStartDate,
          settings: {
            automaticCalculation: input.automaticCalculation,
            onboardingCompleted: true,
            referenceCycleLength: input.referenceCycleLength,
            referencePeriodLength: input.referencePeriodLength,
            timeZone: input.timeZone,
            updatedAt: completedAt,
          },
        });
      },
    },
  };
}
