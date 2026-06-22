/**
 * AppState type re-export. In M0 this is a placeholder; the real type lands
 * in `@app/shared` once Zod schemas exist (M1). Defined as `unknown` so the
 * store + reducer plumbing can be exercised today without committing to a
 * shape — M1 replaces this single line with a `z.infer<>` of the root schema.
 */
export type AppState = unknown;

/**
 * Action shape. Action `type` strings correspond 1:1 to `TransactionLog.type`
 * values per CLAUDE.md / OUTLINE.md §4. M0 ships an internal `__noop` action
 * used only to validate the logging + persist hooks; real action types are
 * added per milestone.
 */
export interface Action {
  type: string;
  payload?: unknown;
}

/**
 * Minimal TransactionLog shape for M0 plumbing. The Zod-validated full type
 * lands in `@app/shared/schemas/transactionLog.schema.ts` in M1 and replaces
 * this placeholder.
 */
export interface TransactionLogEntry {
  id: string;
  timestamp: string;
  type: string;
  payload: unknown;
}
