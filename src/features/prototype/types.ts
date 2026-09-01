export type RecordKind = 'flow' | 'pain' | 'symptoms' | 'mood' | 'note';

export type DailyRecordDraft = {
  flow: string;
  pain: string;
  symptoms: string[];
  mood: string;
  note: string;
};
