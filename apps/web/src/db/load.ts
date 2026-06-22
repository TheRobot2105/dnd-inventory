import { db } from '@/db/schema';

const APP_STATE_KEY = 'appState';

/**
 * Load the persisted AppState blob. Returns `null` if nothing has been
 * persisted yet (first launch / post-wipe). Typed `unknown` — callers
 * (the store, in M1) parse it with the AppState Zod schema before using it.
 */
export async function loadAppState(): Promise<unknown> {
  const row = await db.meta.get(APP_STATE_KEY);
  return row?.value ?? null;
}
