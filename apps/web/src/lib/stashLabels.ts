import type { Character, Stash, TransactionLogEntry } from '@app/shared';

/**
 * Resolve stash ids to human-readable labels for UI rendering. Shared
 * between `<ItemHistory>` (per-item transfer/split summaries) and
 * `<MoveItemModal>` (the target-stash picker).
 *
 * Label shape:
 *   - **Character-scope stash** (Inventory + Storage):
 *     `"{character.name} \u2014 {stash.name}"`
 *     Falls back to bare `"{stash.name}"` when the character can't be
 *     resolved (shouldn't happen for live stashes; possible after
 *     `delete-character` in R4).
 *   - **Party / Recovered Loot**: bare `"{stash.name}"` — no owning
 *     character.
 *   - **Deleted stash** (looked up from the log): same prefix rule as
 *     above, suffixed `" (deleted)"`. Lets `<ItemHistory>` render legible
 *     entries for the delete-cascade `transfer` rows.
 *
 * Falls back to a short-uuid prefix when neither path resolves (e.g. a
 * pre-amendment `delete-stash` entry missing `ownerCharacterId`).
 */
export function buildStashLabels(
  stashes: readonly Stash[] | null,
  characters: readonly Character[] | null,
  log: readonly TransactionLogEntry[],
): ReadonlyMap<string, string> {
  const map = new Map<string, string>();
  const charNameById = new Map<string, string>();
  if (characters !== null) {
    for (const c of characters) charNameById.set(c.id, c.name);
  }

  // Live stashes first — these always win over delete-log entries.
  if (stashes !== null) {
    for (const st of stashes) {
      if (st.scope === 'character') {
        const charName = charNameById.get(st.ownerCharacterId);
        map.set(st.id, charName !== undefined ? `${charName} \u2014 ${st.name}` : st.name);
      } else {
        // party or recovered-loot — no owning character.
        map.set(st.id, st.name);
      }
    }
  }

  // Pass over the log: any `delete-stash` entry whose stashId isn't
  // already in the map (i.e. the stash row is gone) gets resolved to
  // the historical name from the entry's payload.
  for (const e of log) {
    if (e.type !== 'delete-stash') continue;
    if (map.has(e.payload.stashId)) continue;
    const charName =
      e.payload.ownerCharacterId !== undefined
        ? charNameById.get(e.payload.ownerCharacterId)
        : undefined;
    const label =
      charName !== undefined
        ? `${charName} \u2014 ${e.payload.name} (deleted)`
        : `${e.payload.name} (deleted)`;
    map.set(e.payload.stashId, label);
  }

  return map;
}

/** Short-uuid fallback for unresolved stash ids. */
export function shortStashId(id: string): string {
  return id.slice(0, 8);
}
