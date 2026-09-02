import type { OnboardingRepository } from '@/data/repositories';
import { parseLocalDate } from '@/domain/local-date';
import { validatePredictionSettings } from '@/domain/models';

export type CompleteOnboardingCommand = {
  automaticCalculation: boolean;
  lastPeriodStartDate: string;
  referenceCycleLength: number;
  referencePeriodLength: number;
  timeZone: string;
};

export function createCompleteOnboarding(
  repository: OnboardingRepository,
  now: () => Date = () => new Date(),
) {
  return async (command: CompleteOnboardingCommand) => {
    const settings = {
      automaticCalculation: command.automaticCalculation,
      referenceCycleLength: command.referenceCycleLength,
      referencePeriodLength: command.referencePeriodLength,
    };
    validatePredictionSettings(settings);

    if (!command.timeZone.trim()) {
      throw new Error('记录时区不能为空');
    }

    await repository.complete(
      {
        ...settings,
        lastPeriodStartDate: parseLocalDate(command.lastPeriodStartDate),
        timeZone: command.timeZone,
      },
      now().toISOString(),
    );
  };
}
