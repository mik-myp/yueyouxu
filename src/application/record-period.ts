import type { PeriodRepository } from '@/data/repositories';
import { formatLocalDate, parseLocalDate } from '@/domain/local-date';
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
    const today = formatLocalDate(now());
    if (startDate > today || (endDate && endDate > today)) {
      throw new Error('不能记录未来日期');
    }
    if (!command.timeZone.trim()) throw new Error('记录时区不能为空');
    if (endDate && endDate < startDate) {
      throw new Error('经期结束日期不能早于开始日期');
    }

    const existingPeriods = await repository.list();
    if (command.action === 'correct') {
      if (!command.periodId) throw new Error('缺少要修正的经期记录');
      if (!existingPeriods.some((period) => period.id === command.periodId)) {
        throw new Error('要修正的经期记录不存在');
      }
    }
    const id =
      command.action === 'correct' ? command.periodId! : `period-${startDate}`;
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
      const completedPeriod: PeriodUpdate = {
        endDate: startDate,
        startDate: openPeriod.startDate,
        timeZone: command.timeZone,
      };
      const conflict = existingPeriods.some(
        (period) =>
          period.id !== openPeriod.id && overlaps(completedPeriod, period),
      );
      if (conflict) {
        throw new Error('月经来了到月经走了之间存在另一段经期，请调整日期');
      }
      await repository.save(
        openPeriod.id,
        completedPeriod,
        now().toISOString(),
      );
      return { ...openPeriod, endDate: startDate, timeZone: command.timeZone };
    }

    if (
      command.action === 'start' &&
      endDate === null &&
      existingPeriods.some((period) => period.endDate === null)
    ) {
      throw new Error('请先记录已有经期的月经走了日期');
    }
    const rangeForConflict =
      command.action === 'start' && endDate === null
        ? { ...next, endDate: startDate }
        : next;
    const conflict = existingPeriods.some((period) => {
      const correctingSelf =
        command.action === 'correct' && period.id === command.periodId;
      return !correctingSelf && overlaps(rangeForConflict, period);
    });
    if (conflict) {
      throw new Error('所选日期范围与已有经期重叠，请调整开始日或结束日');
    }

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
