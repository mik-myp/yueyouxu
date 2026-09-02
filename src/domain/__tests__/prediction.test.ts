import { calculatePrediction } from '@/domain/prediction';
import { parseLocalDate } from '@/domain/local-date';

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
    });
  });
});
