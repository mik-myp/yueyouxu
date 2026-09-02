import { addLocalDays } from '@/domain/local-date';
import { analyzeCycleHistory } from '@/domain/cycle-analysis';
import type {
  Period,
  PredictionSettings,
  PredictionWindow,
} from '@/domain/models';

export function calculatePrediction(
  periods: Period[],
  settings: PredictionSettings,
): PredictionWindow | null {
  if (!periods.length) return null;
  const analysis = analyzeCycleHistory(periods);
  const cycleLength = settings.automaticCalculation
    ? analysis.typicalCycleLength || settings.referenceCycleLength
    : settings.referenceCycleLength;
  const sampleCount = analysis.cycleSamples.length;
  const variability = settings.automaticCalculation
    ? sampleCount < 2
      ? 2
      : Math.max(1, Math.ceil((analysis.cycleVariability ?? 0) * 1.5))
    : 1;
  const latest = analysis.orderedPeriods[analysis.orderedPeriods.length - 1];
  const centerDate = addLocalDays(latest.startDate, cycleLength);
  const confidence = getConfidence(
    settings.automaticCalculation,
    sampleCount,
    analysis.cycleVariability,
  );
  return {
    centerDate,
    confidence,
    earliestDate: addLocalDays(centerDate, -variability),
    latestDate: addLocalDays(centerDate, variability),
    periodLength:
      settings.automaticCalculation && analysis.typicalPeriodLength
        ? analysis.typicalPeriodLength
        : settings.referencePeriodLength,
    sampleCount,
  };
}

function getConfidence(
  automaticCalculation: boolean,
  sampleCount: number,
  variability: number | null,
): PredictionWindow['confidence'] {
  if (!automaticCalculation || sampleCount < 3 || variability === null)
    return 'low';
  if (sampleCount >= 6 && variability <= 2) return 'high';
  if (variability <= 4) return 'medium';
  return 'low';
}
