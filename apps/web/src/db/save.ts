import { db } from '@/db/schema';

const APP_STATE_KEY = 'appState';

/**
 * Persist the AppState blob immediately. Most callers should prefer
 * `createDebouncedSaver()` instead — every reducer mutation triggers a save,
 * so we batch consecutive writes to avoid hammering IndexedDB.
 */
export async function saveAppState(state: unknown): Promise<void> {
  await db.meta.put({ key: APP_STATE_KEY, value: state });
}

const DEFAULT_DEBOUNCE_MS = 250;

/**
 * Returns a debounced save function. The latest call within the debounce
 * window wins; intermediate states are dropped. `flush()` forces a pending
 * save immediately (useful before navigation away or in tests).
 */
export function createDebouncedSaver(debounceMs: number = DEFAULT_DEBOUNCE_MS): {
  save: (state: unknown) => void;
  flush: () => Promise<void>;
} {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: unknown = undefined;
  let hasPending = false;

  async function commit(): Promise<void> {
    if (!hasPending) return;
    const snapshot = pending;
    hasPending = false;
    pending = undefined;
    await saveAppState(snapshot);
  }

  return {
    save(state: unknown): void {
      pending = state;
      hasPending = true;
      if (timer !== null) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        void commit();
      }, debounceMs);
    },
    async flush(): Promise<void> {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      await commit();
    },
  };
}
