import type { DailyRecordDraft } from './types';

export const prototypeToday = '2026-09-01';

export const initialDailyRecord: DailyRecordDraft = {
  flow: '中量',
  pain: '轻微',
  symptoms: ['腰酸', '乏力'],
  mood: '平静',
  note: '',
};

export const actualPeriodRange = {
  start: '2026-09-01',
  end: '2026-09-05',
};

export const predictedPeriodRange = {
  start: '2026-09-28',
  end: '2026-10-02',
};

export const recordedDates = new Set([
  '2026-09-01',
  '2026-09-02',
  '2026-09-04',
  '2026-08-18',
]);

export const cycleHistory = [
  { month: '8月', cycleLength: 30, periodLength: 5, start: '8月3日' },
  { month: '7月', cycleLength: 29, periodLength: 5, start: '7月5日' },
  { month: '6月', cycleLength: 31, periodLength: 6, start: '6月4日' },
  { month: '5月', cycleLength: 30, periodLength: 5, start: '5月5日' },
];
