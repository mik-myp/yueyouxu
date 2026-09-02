import type { SQLiteDatabase } from 'expo-sqlite';

type Migration = {
  statements: string;
  version: number;
};

export const migrations: Migration[] = [
  {
    version: 1,
    statements: `
      CREATE TABLE IF NOT EXISTS app_settings (
        id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
        onboarding_completed INTEGER NOT NULL DEFAULT 0 CHECK (onboarding_completed IN (0, 1)),
        automatic_calculation INTEGER NOT NULL DEFAULT 1 CHECK (automatic_calculation IN (0, 1)),
        reference_cycle_length INTEGER NOT NULL DEFAULT 28 CHECK (reference_cycle_length BETWEEN 20 AND 45),
        reference_period_length INTEGER NOT NULL DEFAULT 5 CHECK (reference_period_length BETWEEN 2 AND 10),
        time_zone TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS periods (
        id TEXT PRIMARY KEY NOT NULL,
        start_date TEXT NOT NULL UNIQUE CHECK (start_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
        end_date TEXT CHECK (end_date IS NULL OR end_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
        source TEXT NOT NULL CHECK (source = 'manual'),
        time_zone TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        CHECK (end_date IS NULL OR end_date >= start_date)
      );
      CREATE INDEX IF NOT EXISTS periods_start_date_idx ON periods (start_date);

      CREATE TABLE IF NOT EXISTS daily_records (
        id TEXT PRIMARY KEY NOT NULL,
        record_date TEXT NOT NULL UNIQUE CHECK (record_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
        flow TEXT,
        pain TEXT,
        mood TEXT,
        note TEXT,
        time_zone TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS daily_records_record_date_idx ON daily_records (record_date);

      CREATE TABLE IF NOT EXISTS daily_symptoms (
        daily_record_id TEXT NOT NULL REFERENCES daily_records(id) ON DELETE CASCADE,
        symptom_code TEXT NOT NULL,
        severity INTEGER CHECK (severity IS NULL OR severity BETWEEN 1 AND 3),
        PRIMARY KEY (daily_record_id, symptom_code)
      );

      CREATE TABLE IF NOT EXISTS analysis_snapshots (
        id TEXT PRIMARY KEY NOT NULL,
        algorithm_version TEXT NOT NULL,
        generated_at TEXT NOT NULL,
        input_hash TEXT NOT NULL,
        cycle_length INTEGER,
        period_length INTEGER,
        variability INTEGER,
        sample_count INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS prediction_windows (
        id TEXT PRIMARY KEY NOT NULL,
        snapshot_id TEXT NOT NULL REFERENCES analysis_snapshots(id) ON DELETE CASCADE,
        kind TEXT NOT NULL CHECK (kind = 'period'),
        earliest_date TEXT NOT NULL,
        center_date TEXT NOT NULL,
        latest_date TEXT NOT NULL,
        confidence TEXT NOT NULL CHECK (confidence IN ('low', 'medium', 'high')),
        CHECK (earliest_date <= center_date AND center_date <= latest_date)
      );
      CREATE INDEX IF NOT EXISTS prediction_windows_snapshot_idx ON prediction_windows (snapshot_id);
    `,
  },
];

export async function runMigrations(database: SQLiteDatabase) {
  await database.execAsync(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS _app_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const applied = await database.getAllAsync<{ version: number }>(
    'SELECT version FROM _app_migrations ORDER BY version',
  );
  const appliedVersions = new Set(applied.map(({ version }) => version));

  for (const migration of migrations) {
    if (appliedVersions.has(migration.version)) continue;

    await database.withTransactionAsync(async () => {
      await database.execAsync(migration.statements);
      await database.runAsync(
        'INSERT INTO _app_migrations (version, applied_at) VALUES (?, ?)',
        migration.version,
        new Date().toISOString(),
      );
    });
  }
}
