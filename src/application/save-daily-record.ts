import type { DailyRecordRepository } from '@/data/repositories';
import { formatLocalDate, parseLocalDate } from '@/domain/local-date';
import type { DailyRecord, DailyRecordUpdate } from '@/domain/models';

export type SaveDailyRecordCommand = {
  recordDate: string;
  record: DailyRecordUpdate;
};

export function createSaveDailyRecord(
  repository: DailyRecordRepository,
  now: () => Date = () => new Date(),
) {
  return async (command: SaveDailyRecordCommand): Promise<DailyRecord> => {
    const recordDate = parseLocalDate(command.recordDate);
    if (recordDate > formatLocalDate(now()))
      throw new Error('不能记录未来日期');
    if (!command.record.timeZone.trim()) throw new Error('记录时区不能为空');
    const record = {
      ...command.record,
      symptoms: [...new Set(command.record.symptoms)],
    };
    const empty = !record.flow && !record.pain && record.symptoms.length === 0;
    if (empty) await repository.remove(command.recordDate);
    else await repository.save(command.recordDate, record, now().toISOString());
    return {
      ...record,
      id: `daily-${command.recordDate}`,
      recordDate,
    };
  };
}
