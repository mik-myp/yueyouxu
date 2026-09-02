import { createCompleteOnboarding } from '@/application/complete-onboarding';
import type { OnboardingRepository } from '@/data/repositories';

describe('complete onboarding', () => {
  it('validates and persists the initial period and prediction references', async () => {
    const repository: OnboardingRepository = {
      complete: jest.fn().mockResolvedValue(undefined),
    };
    const complete = createCompleteOnboarding(
      repository,
      () => new Date('2026-09-02T08:30:00.000Z'),
    );

    await complete({
      automaticCalculation: true,
      lastPeriodStartDate: '2026-09-01',
      referenceCycleLength: 28,
      referencePeriodLength: 5,
      timeZone: 'Asia/Shanghai',
    });

    expect(repository.complete).toHaveBeenCalledWith(
      {
        automaticCalculation: true,
        lastPeriodStartDate: '2026-09-01',
        referenceCycleLength: 28,
        referencePeriodLength: 5,
        timeZone: 'Asia/Shanghai',
      },
      '2026-09-02T08:30:00.000Z',
    );
  });

  it.each([
    ['invalid date', { lastPeriodStartDate: '2026-02-30' }],
    ['short cycle', { referenceCycleLength: 19 }],
    ['long period', { referencePeriodLength: 11 }],
    ['missing timezone', { timeZone: ' ' }],
  ])('rejects %s before writing', async (_, override) => {
    const repository: OnboardingRepository = {
      complete: jest.fn().mockResolvedValue(undefined),
    };
    const complete = createCompleteOnboarding(repository);

    await expect(
      complete({
        automaticCalculation: true,
        lastPeriodStartDate: '2026-09-01',
        referenceCycleLength: 28,
        referencePeriodLength: 5,
        timeZone: 'Asia/Shanghai',
        ...override,
      }),
    ).rejects.toThrow();
    expect(repository.complete).not.toHaveBeenCalled();
  });
});
