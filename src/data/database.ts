import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseAsync } from 'expo-sqlite';

import { runMigrations } from './migrations';
import { schema } from './schema';

export async function openAppDatabase() {
  const client = await openDatabaseAsync('yueyouxu.db');
  await client.execAsync(
    'PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;',
  );
  await runMigrations(client);

  return drizzle(client, { schema });
}

export type AppDatabase = Awaited<ReturnType<typeof openAppDatabase>>;
