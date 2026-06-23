import { appStateSchema, transactionLogEntrySchema } from '@app/shared';
import { z } from 'zod';

import { loadAppState } from '@/db/load';
import { useStore } from '@/store';

/**
 * Schema for the persisted blob shape (appState + log). Kept here rather
 * than in `@app/shared` because the wrapping shape is a persistence
 * detail — the canonical AppState already includes its log inline, but
 * the store keeps them as separate top-level fields so the typed log
 * union doesn't have to live inside AppState (avoids a Zod self-reference).
 */
const persistedBlobSchema = z.object({
  appState: z.union([appStateSchema, z.null()]),
  log: z.array(transactionLogEntrySchema),
});

/**
 * Boot-time hydration. Read the persisted blob, validate it against the
 * shared schemas, push it into the store. If the blob is missing or
 * malformed we leave the store at its initial empty state — better to
 * land on Welcome than to crash on stale/broken data.
 *
 * Called once from `main.tsx` BEFORE the first render so route guards
 * (Welcome → CharacterSheet redirect) see the loaded state.
 */
export async function hydrateFromDexie(): Promise<void> {
  const raw = await loadAppState();
  if (raw === null) return;

  const parsed = persistedBlobSchema.safeParse(raw);
  if (!parsed.success) {
    console.warn('hydrate: persisted blob failed schema validation; starting empty.', parsed.error);
    return;
  }

  useStore.getState().hydrate({
    appState: parsed.data.appState,
    log: parsed.data.log,
  });
}
