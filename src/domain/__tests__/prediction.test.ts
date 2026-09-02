import { calculatePrediction } from '@/domain/prediction';
import { addLocalDays, parseLocalDate } from '@/domain/local-date';
import type { Period } from '@/domain/models';

function periodsFromLengths(startDate: string, lengths: number[]): Period[] {
  const periods: Period[] = [];
  let cursor = parseLocalDate(startDate);
  for (let index = 0; index <= lengths.length; index += 1) {
    periods.push({
      endDate: null,
      id: `period-${cursor}`,
      source: 'manual',
      startDate: cursor,
      timeZone: 'Asia/Shanghai',
    });
    if (index < lengths.length) cursor = addLocalDays(cursor, lengths[index]);
  }
  return periods;
}

describe('calculatePrediction', () => {
  it('uses the median cycle length and returns a low-confidence window for one sample', () => {
    const result = calculatePrediction(
      [
        {
          endDate: parseLocalDate('2026-08-06'),
          id: 'period-1',
          source: 'manual',
          startDate: parseLocalDate('2026-08-01'),
          timeZone: 'Asia/Shanghai',
        },
        {
          endDate: null,
          id: 'period-2',
          source: 'manual',
          startDate: parseLocalDate('2026-08-31'),
          timeZone: 'Asia/Shanghai',
        },
      ],
      {
        automaticCalculation: true,
        referenceCycleLength: 28,
        referencePeriodLength: 5,
      },
    );

    expect(result).toMatchObject({
      centerDate: '2026-09-30',
      confidence: 'low',
      earliestDate: '2026-09-28',
      latestDate: '2026-10-02',
      periodLength: 6,
      sampleCount: 1,
    });
  });

  it('falls back to the configured reference when only one period exists', () => {
    const result = calculatePrediction(
      [
        {
          endDate: null,
          id: 'period-1',
          source: 'manual',
          startDate: parseLocalDate('2026-09-01'),
          timeZone: 'Asia/Shanghai',
        },
      ],
      {
        automaticCalculation: true,
        referenceCycleLength: 29,
        referencePeriodLength: 5,
      },
    );
    expect(result?.centerDate).toBe('2026-09-30');
    expect(result?.sampleCount).toBe(0);
    expect(result?.periodLength).toBe(5);
  });

  it('uses fixed settings when automatic calculation is disabled', () => {
    const result = calculatePrediction(
      [
        {
          endDate: parseLocalDate('2026-08-05'),
          id: 'period-1',
          source: 'manual',
          startDate: parseLocalDate('2026-08-01'),
          timeZone: 'Asia/Shanghai',
        },
        {
          endDate: null,
          id: 'period-2',
          source: 'manual',
          startDate: parseLocalDate('2026-08-31'),
          timeZone: 'Asia/Shanghai',
        },
      ],
      {
        automaticCalculation: false,
        referenceCycleLength: 28,
        referencePeriodLength: 5,
      },
    );
    expect(result).toMatchObject({
      centerDate: '2026-09-28',
      earliestDate: '2026-09-27',
      latestDate: '2026-09-29',
      periodLength: 5,
    });
  });

  it('does not let a short-interval start event distort the next prediction', () => {
    const result = calculatePrediction(
      [
        {
          endDate: parseLocalDate('2026-08-02'),
          id: 'period-1',
          source: 'manual',
          startDate: parseLocalDate('2026-08-01'),
          timeZone: 'Asia/Shanghai',
        },
        {
          endDate: parseLocalDate('2026-08-06'),
          id: 'period-2',
          source: 'manual',
          startDate: parseLocalDate('2026-08-04'),
          timeZone: 'Asia/Shanghai',
        },
        {
          endDate: null,
          id: 'period-3',
          source: 'manual',
          startDate: parseLocalDate('2026-09-01'),
          timeZone: 'Asia/Shanghai',
        },
      ],
      {
        automaticCalculation: true,
        referenceCycleLength: 28,
        referencePeriodLength: 5,
      },
    );

    expect(result).toMatchObject({
      centerDate: '2026-10-02',
      periodLength: 3,
      sampleCount: 1,
    });
  });

  it('reports high confidence only after six stable valid intervals', () => {
    const result = calculatePrediction(
      periodsFromLengths('2026-01-01', [28, 29, 28, 29, 28, 29]),
      {
        automaticCalculation: true,
        referenceCycleLength: 28,
        referencePeriodLength: 5,
      },
    );

    expect(result).not.toBeNull();
    expect(result?.confidence).toBe('high');
    expect(result?.sampleCount).toBe(6);
    expect(result?.earliestDate).toBe(addLocalDays(result!.centerDate, -2));
    expect(result?.latestDate).toBe(addLocalDays(result!.centerDate, 2));
  });

  it('widens the window and lowers confidence when personal variability is high', () => {
    const result = calculatePrediction(
      periodsFromLengths('2026-01-01', [20, 40, 20, 40, 20, 40]),
      {
        automaticCalculation: true,
        referenceCycleLength: 28,
        referencePeriodLength: 5,
      },
    );

    expect(result).not.toBeNull();
    expect(result?.confidence).toBe('low');
    expect(result?.sampleCount).toBe(6);
    expect(result?.earliestDate).toBe(addLocalDays(result!.centerDate, -15));
    expect(result?.latestDate).toBe(addLocalDays(result!.centerDate, 15));
  });
});
