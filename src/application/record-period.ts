import type { PeriodRepository } from '@/data/repositories';
import { parseLocalDate } from '@/domain/local-date';
import type { PeriodUpdate } from '@/domain/models';

export type RecordPeriodCommand = {
  action: 'start' | 'end' | 'correct';
  endDate?: string | null;
  periodId?: string;
  startDate: string;
  timeZone: string;
};

function overlaps(left: PeriodUpdate, right: PeriodUpdate) {
  const leftEnd = left.endDate ?? '9999-12-31';
  const rightEnd = right.endDate ?? '9999-12-31';
  return left.startDate <= rightEnd && right.startDate <= leftEnd;
}

export function createRecordPeriod(
  repository: PeriodRepository,
  now: () => Date = () => new Date(),
) {
  return async (command: RecordPeriodCommand) => {
    const startDate = parseLocalDate(command.startDate);
    const endDate = command.endDate ? parseLocalDate(command.endDate) : null;
    if (!command.timeZone.trim()) throw new Error('记录时区不能为空');
    if (endDate && endDate < startDate) {
      throw new Error('经期结束日期不能早于开始日期');
    }

    const existingPeriods = await repository.list();
    const id = command.periodId ?? `period-${startDate}`;
    const next: PeriodUpdate = {
      endDate,
      startDate,
      timeZone: command.timeZone,
    };
    if (command.action === 'end') {
      const openPeriod = existingPeriods
        .filter(
          (period) => period.endDate === null && period.startDate <= startDate,
        )
        .sort((left, right) =>
          right.startDate.localeCompare(left.startDate),
        )[0];
      if (!openPeriod) throw new Error('没有可结束的进行中经期');
      await repository.save(
        openPeriod.id,
        {
          endDate: startDate,
          startDate: openPeriod.startDate,
          timeZone: command.timeZone,
        },
        now().toISOString(),
      );
      return { ...openPeriod, endDate: startDate, timeZone: command.timeZone };
    }

    const conflict = existingPeriods.some(
      (period) => period.id !== id && overlaps(next, period),
    );
    if (conflict) throw new Error('日期与已有经期重叠，请先修正已有记录');

    await repository.save(id, next, now().toISOString());
    return {
      endDate,
      id,
      source: 'manual' as const,
      startDate,
      timeZone: command.timeZone,
    };
  };
}
