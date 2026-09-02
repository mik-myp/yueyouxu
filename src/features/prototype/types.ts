export type RecordKind = 'flow' | 'pain' | 'symptoms';

export type DailyRecordDraft = {
  flow: string;
  pain: string;
  symptoms: string[];
};
