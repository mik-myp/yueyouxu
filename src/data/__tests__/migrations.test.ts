import type { SQLiteDatabase } from 'expo-sqlite';

import { migrations, runMigrations } from '@/data/migrations';

function createDatabase(appliedVersions: number[] = []) {
  const database = {
    execAsync: jest.fn().mockResolvedValue(undefined),
    getAllAsync: jest
      .fn()
      .mockResolvedValue(appliedVersions.map((version) => ({ version }))),
    runAsync: jest.fn().mockResolvedValue(undefined),
    withTransactionAsync: jest.fn(async (callback: () => Promise<void>) => {
      await callback();
    }),
  };

  return database as unknown as SQLiteDatabase;
}

describe('database migrations', () => {
  it('applies every pending migration and records its version', async () => {
    const database = createDatabase();

    await runMigrations(database);

    expect(database.withTransactionAsync).toHaveBeenCalledTimes(
      migrations.length,
    );
    expect(database.runAsync).toHaveBeenCalledWith(
      'INSERT INTO _app_migrations (version, applied_at) VALUES (?, ?)',
      migrations[0].version,
      expect.any(String),
    );
  });

  it('does not reapply an existing migration', async () => {
    const database = createDatabase(migrations.map(({ version }) => version));

    await runMigrations(database);

    expect(database.withTransactionAsync).not.toHaveBeenCalled();
  });
});
