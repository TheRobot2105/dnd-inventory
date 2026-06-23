import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { createDebouncedSaver } from '@/db/save';
import { reduce, type LogEntrySlice } from './reducer';
import type { Action, AppState, TransactionLogEntry } from './types';

/**
 * Store shape — pairs `appState` (typed root from `@app/shared`) with
 * the `log` so both persist atomically as one blob.
 *
 * Invariant (per CLAUDE.md): every mutation flows through `dispatch`:
 *   1. validate + apply the action via `reduce`,
 *   2. append the resulting log entry (with derived id/timestamp/actor),
 *   3. trigger a debounced persist.
 *
 * The reducer is pure; the middleware here injects the non-deterministic
 * pieces of the log entry (id, timestamp, actorUserId, actorRole, partyId,
 * sessionId).
 */
export interface StoreState {
  appState: AppState;
  log: TransactionLogEntry[];
  dispatch: (action: Action) => void;
  hydrate: (snapshot: { appState: AppState; log: TransactionLogEntry[] }) => void;
}

const saver = createDebouncedSaver();

/**
 * Derives the actor identity (user, role, party) for a log entry from the
 * pre-mutation state and the reducer's slice. Bootstrap actions like
 * `create-character` run when `state` is null, so they MUST pull identity
 * from the slice payload (which the reducer just minted). Post-bootstrap
 * variants will read `state.user.id` / `state.party.id` here.
 */
function resolveActor(
  state: AppState,
  slice: LogEntrySlice,
): { actorUserId: string; actorRole: 'dm' | 'player'; partyId: string } {
  void state; // M2+ reads state.user.id / state.party.id for non-bootstrap actions
  // Single switch over the discriminant. When new TxType variants land in
  // M2+, add a `case` here AND the @app/shared union, both type-checked.
  switch (slice.type) {
    case 'create-character':
      // The AppState BEFORE this action is null, so we pull party/user
      // from the slice payload itself (the reducer just generated them).
      return {
        actorUserId: slice.payload.userId,
        actorRole: 'dm',
        partyId: slice.payload.partyId,
      };
  }
}

/**
 * Builds a full `TransactionLogEntry` by injecting the non-deterministic
 * fields (`id`, `timestamp`, `sessionId`) and the resolved actor identity
 * onto the reducer's pure slice. Kept here — not in the reducer — so the
 * reducer stays free of `crypto.randomUUID()` / `new Date()` side effects.
 */
function buildLogEntry(state: AppState, slice: LogEntrySlice): TransactionLogEntry {
  const { actorUserId, actorRole, partyId } = resolveActor(state, slice);
  return {
    id: crypto.randomUUID(),
    partyId,
    sessionId: null,
    timestamp: new Date().toISOString(),
    actorUserId,
    actorRole,
    ...slice,
  };
}

export const useStore = create<StoreState>()(
  immer((set, get) => ({
    appState: null,
    log: [],
    dispatch: (action) => {
      // Reduce against the pre-mutation snapshot (Immer's draft would
      // re-trigger our pure reducer with a proxy, which we deliberately
      // avoid — the reducer is meant to be plain-value pure).
      const prev = get();
      const result = reduce(prev.appState, action);
      const entry = buildLogEntry(prev.appState, result.logEntry);

      set((draft) => {
        draft.appState = result.state;
        draft.log.push(entry);
      });

      const snapshot = get();
      saver.save({ appState: snapshot.appState, log: snapshot.log });
    },
    hydrate: (snapshot) => {
      set((draft) => {
        draft.appState = snapshot.appState;
        draft.log = snapshot.log;
      });
    },
  })),
);

/**
 * Flush any pending debounced persist. Useful before navigation away
 * from the app (beforeunload) and in tests. Exposed separately from
 * `dispatch` so callers don't have to await every mutation.
 */
export async function flushPendingPersist(): Promise<void> {
  await saver.flush();
}
