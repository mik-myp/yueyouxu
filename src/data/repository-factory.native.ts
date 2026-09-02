import { openAppDatabase } from './database';
import type { AppRepositories } from './repositories';
import { createSQLiteRepositories } from './sqlite-repositories';

export async function createAppRepositories(): Promise<AppRepositories> {
  const database = await openAppDatabase();
  return createSQLiteRepositories(database);
}
