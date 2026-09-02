import {
  analyzeCycleHistory,
  analyzeDailyRecords,
} from '@/domain/cycle-analysis';
import { parseLocalDate } from '@/domain/local-date';
import type { DailyRecord, Period } from '@/domain/models';

function period(startDate: string, endDate: string | null = null): Period {
  return {
    endDate: endDate ? parseLocalDate(endDate) : null,
    id: `period-${startDate}`,
    source: 'manual',
    startDate: parseLocalDate(startDate),
    timeZone: 'Asia/Shanghai',
  };
}

function dailyRecord(
  recordDate: string,
  values: Partial<Pick<DailyRecord, 'flow' | 'pain' | 'symptoms'>>,
): DailyRecord {
  return {
    flow: null,
    id: `daily-${recordDate}`,
    pain: null,
    recordDate: parseLocalDate(recordDate),
    symptoms: [],
    timeZone: 'Asia/Shanghai',
    ...values,
  };
}

describe('cycle analysis', () => {
  it('keeps a short-interval period as fact without letting it become an analysis anchor', () => {
    const result = analyzeCycleHistory([
      period('2026-08-01'),
      period('2026-08-04'),
      period('2026-09-01'),
    ]);

    expect(result.orderedPeriods).toHaveLength(3);
    expect(result.excludedShortIntervalCount).toBe(1);
    expect(result.cycleSamples.map(({ length }) => length)).toEqual([31]);
    expect(result.typicalCycleLength).toBe(31);
    expect(result.cycleVariability).toBeNull();
  });

  it('starts a new anchor after a gap longer than 90 days', () => {
    const result = analyzeCycleHistory([
      period('2026-01-01'),
      period('2026-05-01'),
      period('2026-05-30'),
    ]);

    expect(result.excludedLongIntervalCount).toBe(1);
    expect(result.cycleSamples.map(({ length }) => length)).toEqual([29]);
  });

  it('uses only the latest 12 valid intervals and robust medians', () => {
    const periods = ['2025-07-01'];
    const lengths = [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];
    let cursor = parseLocalDate(periods[0]);
    for (const length of lengths) {
      const date = new Date(`${cursor}T00:00:00Z`);
      date.setUTCDate(date.getUTCDate() + length);
      cursor = parseLocalDate(date.toISOString().slice(0, 10));
      periods.push(cursor);
    }
    const result = analyzeCycleHistory(periods.map((date) => period(date)));

    expect(result.cycleSamples).toHaveLength(12);
    expect(result.cycleSamples.map(({ length }) => length)).toEqual(
      lengths.slice(-12),
    );
    expect(result.typicalCycleLength).toBe(31);
    expect(result.cycleVariability).toBe(3);
  });

  it('learns typical period duration only from completed records', () => {
    const result = analyzeCycleHistory([
      period('2026-06-01', '2026-06-05'),
      period('2026-07-01', '2026-07-06'),
      period('2026-08-01'),
    ]);

    expect(result.periodLengths).toEqual([5, 6]);
    expect(result.typicalPeriodLength).toBe(6);
    expect(result.periodRange).toEqual({ minimum: 5, maximum: 6 });
  });
});

describe('daily record analysis', () => {
  it('reports only explicitly recorded flow, pain and symptom observations', () => {
    const result = analyzeDailyRecords([
      dailyRecord('2026-09-01', {
        flow: '中量',
        pain: '中等',
        symptoms: ['腹胀', '腰酸'],
      }),
      dailyRecord('2026-09-02', {
        flow: '中量',
        pain: '无',
        symptoms: ['腹胀'],
      }),
      dailyRecord('2026-09-03', { pain: '严重' }),
    ]);

    expect(result.recordedDayCount).toBe(3);
    expect(result.flow).toMatchObject({
      mostCommon: { count: 2, value: '中量' },
      observationCount: 2,
    });
    expect(result.pain.moderateOrSevereDays).toBe(2);
    expect(result.pain.observationCount).toBe(3);
    expect(result.symptoms).toMatchObject({
      mostCommon: { count: 2, value: '腹胀' },
      observationCount: 2,
    });
  });
});
