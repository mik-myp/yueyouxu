import { eq } from 'drizzle-orm';

import type {
  AppSettings,
  OnboardingInput,
  PeriodUpdate,
} from '@/domain/models';
import { parseLocalDate } from '@/domain/local-date';
import { validatePredictionSettings } from '@/domain/models';

import type { AppDatabase } from './database';
import type { AppRepositories } from './repositories';
import {
  analysisSnapshots,
  appSettings,
  dailyRecords,
  dailySymptoms,
  periods,
  predictionWindows,
} from './schema';

function periodId(startDate: string) {
  return `period-${startDate}`;
}

function mapPeriod(row: typeof periods.$inferSelect) {
  return {
    endDate: row.endDate ? parseLocalDate(row.endDate) : null,
    id: row.id,
    source: 'manual' as const,
    startDate: parseLocalDate(row.startDate),
    timeZone: row.timeZone,
  };
}

export function createSQLiteRepositories(
  database: AppDatabase,
): AppRepositories {
  return {
    dataManagement: {
      async clearAll() {
        await database.transaction(async (transaction) => {
          await transaction.delete(predictionWindows);
          await transaction.delete(analysisSnapshots);
          await transaction.delete(dailySymptoms);
          await transaction.delete(dailyRecords);
          await transaction.delete(periods);
          await transaction.delete(appSettings);
        });
      },
    },
    settings: {
      async get(): Promise<AppSettings | null> {
        const row = await database
          .select()
          .from(appSettings)
          .where(eq(appSettings.id, 1))
          .get();

        if (!row) return null;

        return {
          automaticCalculation: row.automaticCalculation,
          onboardingCompleted: row.onboardingCompleted,
          referenceCycleLength: row.referenceCycleLength,
          referencePeriodLength: row.referencePeriodLength,
          timeZone: row.timeZone,
          updatedAt: row.updatedAt,
        };
      },
      async savePredictionSettings(settings, updatedAt) {
        validatePredictionSettings(settings);
        await database
          .update(appSettings)
          .set({
            automaticCalculation: settings.automaticCalculation,
            referenceCycleLength: settings.referenceCycleLength,
            referencePeriodLength: settings.referencePeriodLength,
            updatedAt,
          })
          .where(eq(appSettings.id, 1));
      },
    },
    onboarding: {
      async complete(input: OnboardingInput, completedAt: string) {
        await database.transaction(async (transaction) => {
          await transaction
            .insert(appSettings)
            .values({
              automaticCalculation: input.automaticCalculation,
              createdAt: completedAt,
              id: 1,
              onboardingCompleted: true,
              referenceCycleLength: input.referenceCycleLength,
              referencePeriodLength: input.referencePeriodLength,
              timeZone: input.timeZone,
              updatedAt: completedAt,
            })
            .onConflictDoUpdate({
              target: appSettings.id,
              set: {
                automaticCalculation: input.automaticCalculation,
                onboardingCompleted: true,
                referenceCycleLength: input.referenceCycleLength,
                referencePeriodLength: input.referencePeriodLength,
                timeZone: input.timeZone,
                updatedAt: completedAt,
              },
            });

          await transaction
            .insert(periods)
            .values({
              createdAt: completedAt,
              endDate: null,
              id: periodId(input.lastPeriodStartDate),
              source: 'manual',
              startDate: input.lastPeriodStartDate,
              timeZone: input.timeZone,
              updatedAt: completedAt,
            })
            .onConflictDoNothing({ target: periods.startDate });
        });
      },
    },
    periods: {
      async get(id) {
        const row = await database
          .select()
          .from(periods)
          .where(eq(periods.id, id))
          .get();
        return row ? mapPeriod(row) : null;
      },
      async list() {
        const rows = await database.select().from(periods);
        return rows.map(mapPeriod);
      },
      async remove(id) {
        await database.delete(periods).where(eq(periods.id, id));
      },
      async save(id, period: PeriodUpdate, updatedAt) {
        await database
          .insert(periods)
          .values({
            createdAt: updatedAt,
            endDate: period.endDate,
            id,
            source: 'manual',
            startDate: period.startDate,
            timeZone: period.timeZone,
            updatedAt,
          })
          .onConflictDoUpdate({
            target: periods.id,
            set: {
              endDate: period.endDate,
              startDate: period.startDate,
              timeZone: period.timeZone,
              updatedAt,
            },
          });
      },
    },
  };
}
