import type {
  AppState as AppStateShape,
  TransactionLogEntry as LogEntry,
  TxType,
} from '@app/shared';

/**
 * AppState — the typed root from `@app/shared`. The store models the
 * pre-character-creation phase as `null`; M1's `create-character` is the
 * first reducer case that populates the full object.
 */
export type AppState = AppStateShape | null;

/**
 * Action — the union of every dispatchable mutation. M1 ships one:
 * `create-character`. Adding a milestone means extending BOTH this union
 * AND the `TransactionLogEntry` union in @app/shared (CLAUDE.md: action
 * types correspond 1:1 to TransactionLog.type values).
 *
 * Note: action payloads here are intentionally a SUBSET of the
 * corresponding log payload — the store middleware fills in the derived
 * fields (characterId, inventoryStashId, partyStashId, …) at dispatch
 * time, so the UI only supplies what the user actually entered.
 */
export type Action = {
  type: 'create-character';
  payload: {
    name: string;
    species: string;
    class: string;
    level: number;
    str: number;
  };
};

export type TransactionLogEntry = LogEntry;
export type { TxType };
