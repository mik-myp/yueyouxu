import { eq } from 'drizzle-orm';

import type {
  AppSettings,
  DailyRecordUpdate,
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

function mapDailyRecord(
  row: typeof dailyRecords.$inferSelect,
  symptoms: string[],
) {
  return {
    flow: row.flow,
    id: row.id,
    pain: row.pain,
    recordDate: parseLocalDate(row.recordDate),
    symptoms,
    timeZone: row.timeZone,
  };
}

export function createSQLiteRepositories(
  database: AppDatabase,
): AppRepositories {
  return {
    dailyRecords: {
      async get(recordDate) {
        const row = await database
          .select()
          .from(dailyRecords)
          .where(eq(dailyRecords.recordDate, recordDate))
          .get();
        if (!row) return null;
        const symptomRows = await database
          .select()
          .from(dailySymptoms)
          .where(eq(dailySymptoms.dailyRecordId, row.id));
        return mapDailyRecord(
          row,
          symptomRows.map((item) => item.symptomCode),
        );
      },
      async list() {
        const rows = await database.select().from(dailyRecords);
        const symptomRows = await database.select().from(dailySymptoms);
        const symptomsByRecord = new Map<string, string[]>();
        for (const item of symptomRows) {
          const values = symptomsByRecord.get(item.dailyRecordId) ?? [];
          values.push(item.symptomCode);
          symptomsByRecord.set(item.dailyRecordId, values);
        }
        return rows.map((row) =>
          mapDailyRecord(row, symptomsByRecord.get(row.id) ?? []),
        );
      },
      async remove(recordDate) {
        await database
          .delete(dailyRecords)
          .where(eq(dailyRecords.recordDate, recordDate));
      },
      async save(recordDate, record: DailyRecordUpdate, updatedAt) {
        const id = `daily-${recordDate}`;
        await database.transaction(async (transaction) => {
          await transaction
            .insert(dailyRecords)
            .values({
              createdAt: updatedAt,
              flow: record.flow,
              id,
              pain: record.pain,
              recordDate,
              timeZone: record.timeZone,
              updatedAt,
            })
            .onConflictDoUpdate({
              target: dailyRecords.recordDate,
              set: {
                flow: record.flow,
                pain: record.pain,
                timeZone: record.timeZone,
                updatedAt,
              },
            });
          await transaction
            .delete(dailySymptoms)
            .where(eq(dailySymptoms.dailyRecordId, id));
          if (record.symptoms.length) {
            await transaction.insert(dailySymptoms).values(
              record.symptoms.map((symptomCode) => ({
                dailyRecordId: id,
                severity: null,
                symptomCode,
              })),
            );
          }
        });
      },
    },
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
