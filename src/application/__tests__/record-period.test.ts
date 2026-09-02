import { createRecordPeriod } from '@/application/record-period';
import type { Period, PeriodUpdate } from '@/domain/models';
import { parseLocalDate } from '@/domain/local-date';

function repository(initial: Period[] = []) {
  const periods = [...initial];
  return {
    get: async (id: string) =>
      periods.find((period) => period.id === id) ?? null,
    list: async () => periods,
    remove: async (id: string) => {
      const index = periods.findIndex((period) => period.id === id);
      if (index >= 0) periods.splice(index, 1);
    },
    save: async (id: string, update: PeriodUpdate) => {
      const next = {
        ...update,
        id,
        source: 'manual' as const,
      };
      const index = periods.findIndex((period) => period.id === id);
      if (index >= 0) periods[index] = next;
      else periods.push(next);
    },
  };
}

describe('record period', () => {
  it('starts and ends an open period', async () => {
    const repositories = repository();
    const record = createRecordPeriod(
      repositories,
      () => new Date('2026-09-05T00:00:00.000Z'),
    );

    await record({
      action: 'start',
      startDate: '2026-09-01',
      timeZone: 'Asia/Shanghai',
    });
    const ended = await record({
      action: 'end',
      startDate: '2026-09-05',
      timeZone: 'Asia/Shanghai',
    });

    expect(ended.endDate).toBe('2026-09-05');
    expect((await repositories.list())[0]).toMatchObject({
      endDate: '2026-09-05',
      startDate: '2026-09-01',
    });
  });

  it('rejects overlapping periods and inverted corrections', async () => {
    const repositories = repository([
      {
        endDate: parseLocalDate('2026-09-05'),
        id: 'period-2026-09-01',
        source: 'manual',
        startDate: parseLocalDate('2026-09-01'),
        timeZone: 'Asia/Shanghai',
      },
    ]);
    const record = createRecordPeriod(repositories);

    await expect(
      record({
        action: 'start',
        startDate: '2026-09-02',
        timeZone: 'Asia/Shanghai',
      }),
    ).rejects.toThrow('重叠');
    await expect(
      record({
        action: 'correct',
        endDate: '2026-08-31',
        periodId: 'period-2026-09-01',
        startDate: '2026-09-01',
        timeZone: 'Asia/Shanghai',
      }),
    ).rejects.toThrow('早于');
  });

  it('does not treat a corrected period id as a new period with the same start date', async () => {
    const repositories = repository([
      {
        endDate: parseLocalDate('2026-09-03'),
        id: 'period-2026-09-01',
        source: 'manual',
        startDate: parseLocalDate('2026-09-02'),
        timeZone: 'Asia/Shanghai',
      },
    ]);
    const record = createRecordPeriod(
      repositories,
      () => new Date('2026-09-05T00:00:00.000Z'),
    );

    await expect(
      record({
        action: 'start',
        startDate: '2026-09-01',
        timeZone: 'Asia/Shanghai',
      }),
    ).rejects.toThrow('重叠');
    await expect(
      record({
        action: 'correct',
        endDate: '2026-09-03',
        periodId: 'missing-period',
        startDate: '2026-09-02',
        timeZone: 'Asia/Shanghai',
      }),
    ).rejects.toThrow('不存在');
  });
});
