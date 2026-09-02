import type { SettingsRepository } from '@/data/repositories';
import type { PredictionSettings } from '@/domain/models';
import { validatePredictionSettings } from '@/domain/models';

export function createSavePredictionSettings(
  repository: SettingsRepository,
  now: () => Date = () => new Date(),
) {
  return async (settings: PredictionSettings) => {
    validatePredictionSettings(settings);
    await repository.savePredictionSettings(settings, now().toISOString());
  };
}
