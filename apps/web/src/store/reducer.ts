import type { Action, AppState, TransactionLogEntry } from './types';

/**
 * Pure reducer. Takes (state, action) and returns the next state along with
 * the log entry that should be appended.
 *
 * In M0 the reducer has no domain cases — it only knows how to construct a
 * log entry and return the state unchanged. Real action handlers (e.g.
 * `create-character`) land per milestone and each adds a `case` here.
 *
 * Keeping this pure (no Date.now, no UUID) lets the store middleware inject
 * the entry id + timestamp and keeps the reducer trivially testable.
 */
export function reduce(
  state: AppState,
  action: Action,
  entry: TransactionLogEntry,
): { state: AppState; entry: TransactionLogEntry } {
  // No domain actions in M0. The entry is built by the caller and threaded
  // through unchanged so the store can append it after the state update.
  void action;
  return { state, entry };
}
