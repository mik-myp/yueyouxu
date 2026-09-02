import { differenceInLocalDays } from '@/domain/local-date';
import type { DailyRecord, Period } from '@/domain/models';

const MIN_ANALYSIS_CYCLE_LENGTH = 10;
const MAX_ANALYSIS_CYCLE_LENGTH = 90;
const RECENT_SAMPLE_LIMIT = 12;

export type CycleIntervalSample = {
  fromStartDate: Period['startDate'];
  length: number;
  toStartDate: Period['startDate'];
};

export type ValueCount = {
  count: number;
  value: string;
};

export type CycleHistoryAnalysis = {
  cycleRange: { maximum: number; minimum: number } | null;
  cycleSamples: CycleIntervalSample[];
  cycleVariability: number | null;
  excludedLongIntervalCount: number;
  excludedShortIntervalCount: number;
  orderedPeriods: Period[];
  periodLengths: number[];
  periodRange: { maximum: number; minimum: number } | null;
  typicalCycleLength: number | null;
  typicalPeriodLength: number | null;
};

export type DailyRecordAnalysis = {
  flow: {
    counts: ValueCount[];
    mostCommon: ValueCount | null;
    observationCount: number;
  };
  pain: {
    counts: ValueCount[];
    moderateOrSevereDays: number;
    mostCommon: ValueCount | null;
    observationCount: number;
  };
  recordedDayCount: number;
  symptoms: {
    counts: ValueCount[];
    mostCommon: ValueCount | null;
    observationCount: number;
  };
};

export type TrackingAnalysis = {
  cycle: CycleHistoryAnalysis;
  daily: DailyRecordAnalysis;
};

export function analyzeCycleHistory(periods: Period[]): CycleHistoryAnalysis {
  const orderedPeriods = [...periods].sort((left, right) =>
    left.startDate.localeCompare(right.startDate),
  );
  const validIntervals: CycleIntervalSample[] = [];
  let excludedShortIntervalCount = 0;
  let excludedLongIntervalCount = 0;
  let anchor = orderedPeriods[0];

  for (const period of orderedPeriods.slice(1)) {
    const length = differenceInLocalDays(anchor.startDate, period.startDate);
    if (length < MIN_ANALYSIS_CYCLE_LENGTH) {
      excludedShortIntervalCount += 1;
      continue;
    }
    if (length > MAX_ANALYSIS_CYCLE_LENGTH) {
      excludedLongIntervalCount += 1;
      anchor = period;
      continue;
    }
    validIntervals.push({
      fromStartDate: anchor.startDate,
      length,
      toStartDate: period.startDate,
    });
    anchor = period;
  }

  const cycleSamples = validIntervals.slice(-RECENT_SAMPLE_LIMIT);
  const cycleLengths = cycleSamples.map(({ length }) => length);
  const typicalCycleLength = median(cycleLengths);
  const cycleVariability =
    typicalCycleLength && cycleLengths.length >= 2
      ? median(
          cycleLengths.map((length) => Math.abs(length - typicalCycleLength)),
        )
      : null;
  const periodLengths = orderedPeriods
    .filter(
      (
        period,
      ): period is Period & { endDate: NonNullable<Period['endDate']> } =>
        Boolean(period.endDate),
    )
    .map(
      (period) => differenceInLocalDays(period.startDate, period.endDate) + 1,
    )
    .slice(-RECENT_SAMPLE_LIMIT);

  return {
    cycleRange: range(cycleLengths),
    cycleSamples,
    cycleVariability,
    excludedLongIntervalCount,
    excludedShortIntervalCount,
    orderedPeriods,
    periodLengths,
    periodRange: range(periodLengths),
    typicalCycleLength,
    typicalPeriodLength: median(periodLengths),
  };
}

export function analyzeDailyRecords(
  dailyRecords: DailyRecord[],
): DailyRecordAnalysis {
  const flowCounts = countValues(
    dailyRecords.flatMap((record) => (record.flow ? [record.flow] : [])),
    ['点滴', '少量', '中量', '多量'],
  );
  const painCounts = countValues(
    dailyRecords.flatMap((record) => (record.pain ? [record.pain] : [])),
    ['无', '轻微', '中等', '严重'],
  );
  const symptomRecords = dailyRecords.filter(
    (record) => record.symptoms.length > 0,
  );
  const symptomCounts = countValues(
    symptomRecords.flatMap((record) => [...new Set(record.symptoms)]),
  );

  return {
    flow: {
      counts: flowCounts,
      mostCommon: mostCommon(flowCounts),
      observationCount: flowCounts.reduce((sum, item) => sum + item.count, 0),
    },
    pain: {
      counts: painCounts,
      moderateOrSevereDays: painCounts
        .filter(({ value }) => value === '中等' || value === '严重')
        .reduce((sum, item) => sum + item.count, 0),
      mostCommon: mostCommon(painCounts),
      observationCount: painCounts.reduce((sum, item) => sum + item.count, 0),
    },
    recordedDayCount: dailyRecords.length,
    symptoms: {
      counts: symptomCounts,
      mostCommon: mostCommon(symptomCounts),
      observationCount: symptomRecords.length,
    },
  };
}

export function analyzeTrackingData(
  periods: Period[],
  dailyRecords: DailyRecord[],
): TrackingAnalysis {
  return {
    cycle: analyzeCycleHistory(periods),
    daily: analyzeDailyRecords(dailyRecords),
  };
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

function range(values: number[]) {
  return values.length
    ? { maximum: Math.max(...values), minimum: Math.min(...values) }
    : null;
}

function countValues(values: string[], preferredOrder: string[] = []) {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .map(([value, count]) => ({ count, value }))
    .sort((left, right) => {
      const leftOrder = preferredOrder.indexOf(left.value);
      const rightOrder = preferredOrder.indexOf(right.value);
      if (leftOrder >= 0 || rightOrder >= 0) {
        return (
          (leftOrder < 0 ? Number.MAX_SAFE_INTEGER : leftOrder) -
          (rightOrder < 0 ? Number.MAX_SAFE_INTEGER : rightOrder)
        );
      }
      return left.value.localeCompare(right.value, 'zh-CN');
    });
}

function mostCommon(counts: ValueCount[]) {
  return counts.length
    ? [...counts].sort(
        (left, right) =>
          right.count - left.count ||
          left.value.localeCompare(right.value, 'zh-CN'),
      )[0]
    : null;
}
