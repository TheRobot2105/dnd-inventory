import { db } from '@/db/schema';

/**
 * Wipe every object store. Used by the Settings "Wipe all data" action and
 * by the JSON import flow (which replaces state wholesale).
 */
export async function wipeAll(): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map((t) => t.clear()));
  });
}
