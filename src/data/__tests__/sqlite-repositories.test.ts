import type { AppDatabase } from '@/data/database';
import { createSQLiteRepositories } from '@/data/sqlite-repositories';

describe('SQLite repositories', () => {
  it('clears settings, facts and derived data in one transaction', async () => {
    const transaction = {
      delete: jest.fn().mockResolvedValue(undefined),
    };
    const database = {
      transaction: jest.fn(
        async (callback: (value: typeof transaction) => Promise<void>) => {
          await callback(transaction);
        },
      ),
    } as unknown as AppDatabase;
    const repositories = createSQLiteRepositories(database);

    await repositories.dataManagement.clearAll();

    expect(database.transaction).toHaveBeenCalledTimes(1);
    expect(transaction.delete).toHaveBeenCalledTimes(6);
  });
});
