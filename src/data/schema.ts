import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

export const appSettings = sqliteTable('app_settings', {
  id: integer('id').primaryKey(),
  onboardingCompleted: integer('onboarding_completed', { mode: 'boolean' })
    .notNull()
    .default(false),
  automaticCalculation: integer('automatic_calculation', { mode: 'boolean' })
    .notNull()
    .default(true),
  referenceCycleLength: integer('reference_cycle_length').notNull().default(28),
  referencePeriodLength: integer('reference_period_length')
    .notNull()
    .default(5),
  timeZone: text('time_zone').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const periods = sqliteTable(
  'periods',
  {
    id: text('id').primaryKey(),
    startDate: text('start_date').notNull().unique(),
    endDate: text('end_date'),
    source: text('source', { enum: ['manual'] }).notNull(),
    timeZone: text('time_zone').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [index('periods_start_date_idx').on(table.startDate)],
);

export const dailyRecords = sqliteTable(
  'daily_records',
  {
    id: text('id').primaryKey(),
    recordDate: text('record_date').notNull().unique(),
    flow: text('flow'),
    pain: text('pain'),
    mood: text('mood'),
    note: text('note'),
    timeZone: text('time_zone').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [index('daily_records_record_date_idx').on(table.recordDate)],
);

export const dailySymptoms = sqliteTable(
  'daily_symptoms',
  {
    dailyRecordId: text('daily_record_id')
      .notNull()
      .references(() => dailyRecords.id, { onDelete: 'cascade' }),
    symptomCode: text('symptom_code').notNull(),
    severity: integer('severity'),
  },
  (table) => [
    primaryKey({ columns: [table.dailyRecordId, table.symptomCode] }),
  ],
);

export const analysisSnapshots = sqliteTable('analysis_snapshots', {
  id: text('id').primaryKey(),
  algorithmVersion: text('algorithm_version').notNull(),
  generatedAt: text('generated_at').notNull(),
  inputHash: text('input_hash').notNull(),
  cycleLength: integer('cycle_length'),
  periodLength: integer('period_length'),
  variability: integer('variability'),
  sampleCount: integer('sample_count').notNull(),
});

export const predictionWindows = sqliteTable(
  'prediction_windows',
  {
    id: text('id').primaryKey(),
    snapshotId: text('snapshot_id')
      .notNull()
      .references(() => analysisSnapshots.id, { onDelete: 'cascade' }),
    kind: text('kind', { enum: ['period'] }).notNull(),
    earliestDate: text('earliest_date').notNull(),
    centerDate: text('center_date').notNull(),
    latestDate: text('latest_date').notNull(),
    confidence: text('confidence', {
      enum: ['low', 'medium', 'high'],
    }).notNull(),
  },
  (table) => [index('prediction_windows_snapshot_idx').on(table.snapshotId)],
);

export const schema = {
  analysisSnapshots,
  appSettings,
  dailyRecords,
  dailySymptoms,
  periods,
  predictionWindows,
};
