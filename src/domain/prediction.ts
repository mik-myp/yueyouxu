import { addLocalDays, differenceInLocalDays } from '@/domain/local-date';
import type {
  Period,
  PredictionSettings,
  PredictionWindow,
} from '@/domain/models';

function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

export function calculatePrediction(
  periods: Period[],
  settings: PredictionSettings,
): PredictionWindow | null {
  if (!periods.length) return null;
  const ordered = [...periods].sort((left, right) =>
    left.startDate.localeCompare(right.startDate),
  );
  const cycleLengths = ordered
    .slice(1)
    .map((period, index) =>
      differenceInLocalDays(ordered[index].startDate, period.startDate),
    );
  const cycleLength = settings.automaticCalculation
    ? median(cycleLengths) || settings.referenceCycleLength
    : settings.referenceCycleLength;
  const variability =
    settings.automaticCalculation && cycleLengths.length > 1
      ? Math.min(
          5,
          Math.max(
            1,
            Math.round(
              (Math.max(...cycleLengths) - Math.min(...cycleLengths)) / 2,
            ),
          ),
        )
      : settings.automaticCalculation
        ? 2
        : 1;
  const latest = ordered[ordered.length - 1];
  const centerDate = addLocalDays(latest.startDate, cycleLength);
  const sampleCount = cycleLengths.length;
  const confidence =
    sampleCount >= 4 ? 'high' : sampleCount >= 2 ? 'medium' : 'low';
  return {
    centerDate,
    confidence,
    earliestDate: addLocalDays(centerDate, -variability),
    latestDate: addLocalDays(centerDate, variability),
    sampleCount,
  };
}
