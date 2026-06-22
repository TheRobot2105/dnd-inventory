import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { createDebouncedSaver } from '@/db/save';
import { reduce } from './reducer';
import type { Action, AppState, TransactionLogEntry } from './types';

/**
 * Store shape. The real `AppState` is a placeholder (`unknown`) in M0; the
 * store wraps it alongside the transaction log so both can be persisted as
 * one atomic blob.
 *
 * Invariant (per CLAUDE.md): every mutation flows through `dispatch`, which
 *   1. validates + applies the action via `reduce`,
 *   2. appends the resulting log entry, and
 *   3. triggers a debounced persist.
 *
 * UI never mutates store state directly — bypassing `dispatch` would skip
 * the log and the persist hook.
 */
export interface StoreState {
  appState: AppState;
  log: TransactionLogEntry[];
  dispatch: (action: Action) => void;
}

const saver = createDebouncedSaver();

function makeEntry(action: Action): TransactionLogEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    type: action.type,
    payload: action.payload,
  };
}

export const useStore = create<StoreState>()(
  immer((set, get) => ({
    appState: null,
    log: [],
    dispatch: (action) => {
      set((draft) => {
        const entry = makeEntry(action);
        // `reduce` operates on a non-Immer value; in M0 it is a pure pass-through.
        // M1 will start mutating `draft.appState` (Immer-safe) inside its cases.
        const result = reduce(draft.appState, action, entry);
        draft.appState = result.state;
        draft.log.push(result.entry);
      });
      // Persist outside the Immer block — it reads the post-mutation state.
      const snapshot = get();
      saver.save({ appState: snapshot.appState, log: snapshot.log });
    },
  })),
);

/**
 * Flush any pending debounced persist. Useful before navigation away from
 * the app (beforeunload) and in tests. Exposed separately from `dispatch`
 * so callers don't have to await every mutation.
 */
export async function flushPendingPersist(): Promise<void> {
  await saver.flush();
}
