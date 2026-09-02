import { createSaveDailyRecord } from '@/application/save-daily-record';
import type { DailyRecord, DailyRecordUpdate } from '@/domain/models';

describe('save daily record', () => {
  it('validates and saves a complete daily record', async () => {
    const records: DailyRecord[] = [];
    const repository = {
      get: async () => null,
      list: async () => records,
      remove: async () => undefined,
      save: jest.fn(async (recordDate: string, record: DailyRecordUpdate) => {
        records.push({
          ...record,
          id: `daily-${recordDate}`,
          recordDate: recordDate as DailyRecord['recordDate'],
        });
      }),
    };
    const save = createSaveDailyRecord(
      repository,
      () => new Date('2026-09-02T00:00:00.000Z'),
    );
    const result = await save({
      recordDate: '2026-09-02',
      record: {
        flow: '中量',
        mood: '平静',
        note: '状态平稳',
        pain: '轻微',
        symptoms: ['腰酸'],
        timeZone: 'Asia/Shanghai',
      },
    });
    expect(result).toMatchObject({ flow: '中量', recordDate: '2026-09-02' });
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('rejects notes over 200 characters', async () => {
    const repository = {
      get: async () => null,
      list: async () => [],
      remove: async () => undefined,
      save: jest.fn(),
    };
    const save = createSaveDailyRecord(repository);
    await expect(
      save({
        recordDate: '2026-09-02',
        record: {
          flow: null,
          mood: null,
          note: 'a'.repeat(201),
          pain: null,
          symptoms: [],
          timeZone: 'Asia/Shanghai',
        },
      }),
    ).rejects.toThrow('200');
  });

  it('rejects future records', async () => {
    const repository = {
      get: async () => null,
      list: async () => [],
      remove: async () => undefined,
      save: jest.fn(),
    };
    const save = createSaveDailyRecord(
      repository,
      () => new Date('2026-09-02T12:00:00.000Z'),
    );
    await expect(
      save({
        recordDate: '2026-09-03',
        record: {
          flow: null,
          mood: null,
          note: null,
          pain: null,
          symptoms: [],
          timeZone: 'Asia/Shanghai',
        },
      }),
    ).rejects.toThrow('未来');
  });

  it('removes an empty record instead of leaving a recorded-day marker', async () => {
    const repository = {
      get: jest.fn(),
      list: jest.fn(),
      remove: jest.fn().mockResolvedValue(undefined),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const save = createSaveDailyRecord(
      repository,
      () => new Date('2026-09-02T00:00:00.000Z'),
    );

    await save({
      recordDate: '2026-09-02',
      record: {
        flow: null,
        mood: null,
        note: '   ',
        pain: null,
        symptoms: [],
        timeZone: 'Asia/Shanghai',
      },
    });

    expect(repository.remove).toHaveBeenCalledWith('2026-09-02');
    expect(repository.save).not.toHaveBeenCalled();
  });
});
