import { createSavePredictionSettings } from '@/application/save-prediction-settings';
import type { SettingsRepository } from '@/data/repositories';

describe('save prediction settings', () => {
  it('validates and writes the settings with an update timestamp', async () => {
    const repository: SettingsRepository = {
      get: jest.fn(),
      savePredictionSettings: jest.fn().mockResolvedValue(undefined),
    };
    const save = createSavePredictionSettings(
      repository,
      () => new Date('2026-09-02T09:00:00.000Z'),
    );

    await save({
      automaticCalculation: false,
      referenceCycleLength: 31,
      referencePeriodLength: 6,
    });

    expect(repository.savePredictionSettings).toHaveBeenCalledWith(
      {
        automaticCalculation: false,
        referenceCycleLength: 31,
        referencePeriodLength: 6,
      },
      '2026-09-02T09:00:00.000Z',
    );
  });
});
