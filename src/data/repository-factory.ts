import type { AppSettings, OnboardingInput } from '@/domain/models';
import { validatePredictionSettings } from '@/domain/models';
import { parseLocalDate } from '@/domain/local-date';

import type { AppRepositories } from './repositories';

const STORAGE_KEY = 'yueyouxu.web-preview.v1';

type WebPreviewState = {
  dailyRecords: {
    flow: string | null;
    id: string;
    pain: string | null;
    recordDate: string;
    symptoms: string[];
    timeZone: string;
  }[];
  lastPeriodStartDate: string | null;
  periods: {
    endDate: string | null;
    id: string;
    source: 'manual';
    startDate: string;
    timeZone: string;
  }[];
  settings: AppSettings | null;
};

function readState(): WebPreviewState {
  const serialized = globalThis.localStorage?.getItem(STORAGE_KEY);
  if (!serialized)
    return {
      dailyRecords: [],
      lastPeriodStartDate: null,
      periods: [],
      settings: null,
    };

  try {
    const parsed = JSON.parse(serialized) as Partial<WebPreviewState>;
    return {
      dailyRecords: parsed.dailyRecords ?? [],
      lastPeriodStartDate: parsed.lastPeriodStartDate ?? null,
      periods: parsed.periods ?? [],
      settings: parsed.settings ?? null,
    };
  } catch {
    return {
      dailyRecords: [],
      lastPeriodStartDate: null,
      periods: [],
      settings: null,
    };
  }
}

function mapPeriod(period: WebPreviewState['periods'][number]) {
  return {
    ...period,
    endDate: period.endDate ? parseLocalDate(period.endDate) : null,
    startDate: parseLocalDate(period.startDate),
  };
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
          dailyRecords: [],
          periods: [
            {
              endDate: null,
              id: `period-${input.lastPeriodStartDate}`,
              source: 'manual',
              startDate: input.lastPeriodStartDate,
              timeZone: input.timeZone,
            },
          ],
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
    periods: {
      async get(id) {
        const period = readState().periods.find((item) => item.id === id);
        return period ? mapPeriod(period) : null;
      },
      async list() {
        return readState().periods.map(mapPeriod);
      },
      async remove(id) {
        const current = readState();
        writeState({
          ...current,
          periods: current.periods.filter((period) => period.id !== id),
        });
      },
      async save(id, period, updatedAt) {
        const current = readState();
        const existing = current.periods.find((item) => item.id === id);
        const next = {
          endDate: period.endDate,
          id,
          source: 'manual' as const,
          startDate: period.startDate,
          timeZone: period.timeZone,
        };
        writeState({
          ...current,
          periods: existing
            ? current.periods.map((item) => (item.id === id ? next : item))
            : [...current.periods, next],
          settings: current.settings
            ? { ...current.settings, updatedAt }
            : current.settings,
        });
      },
    },
    dailyRecords: {
      async get(recordDate) {
        const record = readState().dailyRecords.find(
          (item) => item.recordDate === recordDate,
        );
        return record
          ? { ...record, recordDate: parseLocalDate(record.recordDate) }
          : null;
      },
      async list() {
        return readState().dailyRecords.map((record) => ({
          ...record,
          recordDate: parseLocalDate(record.recordDate),
        }));
      },
      async remove(recordDate) {
        const current = readState();
        writeState({
          ...current,
          dailyRecords: current.dailyRecords.filter(
            (record) => record.recordDate !== recordDate,
          ),
        });
      },
      async save(recordDate, record, updatedAt) {
        const current = readState();
        const next = { ...record, id: `daily-${recordDate}`, recordDate };
        const exists = current.dailyRecords.some(
          (item) => item.recordDate === recordDate,
        );
        writeState({
          ...current,
          dailyRecords: exists
            ? current.dailyRecords.map((item) =>
                item.recordDate === recordDate ? next : item,
              )
            : [...current.dailyRecords, next],
          settings: current.settings
            ? { ...current.settings, updatedAt }
            : current.settings,
        });
      },
    },
  };
}
