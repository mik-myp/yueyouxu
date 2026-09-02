import { eq } from 'drizzle-orm';

import type { AppSettings, OnboardingInput } from '@/domain/models';

import type { AppDatabase } from './database';
import type { AppRepositories } from './repositories';
import { appSettings, periods } from './schema';

function periodId(startDate: string) {
  return `period-${startDate}`;
}

export function createSQLiteRepositories(
  database: AppDatabase,
): AppRepositories {
  return {
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
  };
}
