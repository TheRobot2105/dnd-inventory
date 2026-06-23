import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useStore } from '@/store';
import type { TransactionLogEntry } from '@app/shared';

interface ItemHistoryProps {
  itemInstanceId: string;
}

/**
 * Per-item history view (OUTLINE §3.11). Filters `state.log` for entries
 * whose payload references `itemInstanceId`. Four TxTypes currently carry
 * an `itemInstanceId` on their payload: `acquire`, `consume`,
 * `edit-item-instance` (M2.5), and `transfer` (M3 — synthetic via the
 * `delete-stash` cascade, then user-initiated in M5). Future milestones
 * (R1 equip/attune, R2 recharge / identify) will extend the predicate.
 *
 * Permission gating (owner + DM only per OUTLINE §8) lands in R4/R5 —
 * single-user MVP shows the full slice.
 *
 * `useShallow` on the log filter is mandatory: `.filter()` returns a
 * fresh array every render, and without shallow-equality Zustand would
 * treat each render as a state change and infinite-loop.
 *
 * For `transfer` summaries we need legible stash labels. Behind the
 * scenes the log carries opaque stash ids (forensic-grade); the UI
 * resolves them to a human label of shape `{Character} \u2014 {Stash}` for
 * character-scope stashes (Inventory + Storage) and a bare `{Stash}` for
 * party-scope / recovered-loot. When the stash has been deleted (the
 * delete-cascade is the very thing that emits these entries), we fall
 * back to a short-uuid prefix so the row is still legible.
 */
type ItemEntry = Extract<
  TransactionLogEntry,
  { type: 'acquire' | 'consume' | 'edit-item-instance' | 'transfer' }
>;

function isItemEntry(e: TransactionLogEntry): e is ItemEntry {
  return (
    e.type === 'acquire' ||
    e.type === 'consume' ||
    e.type === 'edit-item-instance' ||
    e.type === 'transfer'
  );
}

export function ItemHistory({ itemInstanceId }: ItemHistoryProps): ReactElement {
  const entries = useStore(
    useShallow((s) =>
      s.log.filter(
        (e): e is ItemEntry => isItemEntry(e) && e.payload.itemInstanceId === itemInstanceId,
      ),
    ),
  );

  // Stash + character lookups for the `transfer` summarizer. Raw arrays
  // come through `useShallow`; the per-id dictionaries are derived in
  // `useMemo` so their identity is stable until the underlying arrays
  // actually change.
  //
  // Deleted-stash labels come from the `delete-stash` log entries — the
  // Stash row is gone but the log entry still carries the original
  // `name`. Rendered as "{name} (deleted)" so a re-created stash of the
  // same name later isn't confused with the historical row.
  const { stashes, characters, log } = useStore(
    useShallow((s) => ({
      stashes: s.appState?.stashes ?? null,
      characters: s.appState?.characters ?? null,
      log: s.log,
    })),
  );
  const stashLabelById = useMemo<ReadonlyMap<string, string>>(() => {
    const map = new Map<string, string>();
    const charNameById = new Map<string, string>();
    if (characters !== null) {
      for (const c of characters) charNameById.set(c.id, c.name);
    }
    if (stashes !== null) {
      for (const st of stashes) {
        // Character-scope stashes (Inventory + Storage) are prefixed
        // with the owning character's name. Party-scope /
        // recovered-loot have no owning character; render bare. Falls
        // back to bare name if the ownerCharacterId can't be resolved.
        if (st.scope === 'character') {
          const charName = charNameById.get(st.ownerCharacterId);
          map.set(st.id, charName !== undefined ? `${charName} \u2014 ${st.name}` : st.name);
        } else {
          map.set(st.id, st.name);
        }
      }
    }
    // Pass over the log: any `delete-stash` entry whose `stashId` isn't
    // already in `map` (i.e. the stash row is gone) gets resolved to the
    // historical name from the entry's payload, prefixed with the
    // owning character's name when the payload carries
    // `ownerCharacterId`. Renders as "{character.name} \u2014 {name} (deleted)"
    // for character-scope stashes; bare "{name} (deleted)" for the rare
    // case where the field is absent (M3-vintage entries written before
    // the schema amendment, or a party-scope/recovered-loot delete which
    // M3 refuses anyway).
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
  }, [stashes, characters, log]);

  if (entries.length === 0) {
    return (
      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          History
        </h2>
        <p className="text-sm text-muted-foreground">No log entries for this item yet.</p>
      </section>
    );
  }

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        History
      </h2>
      <ul className="space-y-1 text-sm" role="list">
        {entries.map((e) => (
          <li
            key={e.id}
            className="flex items-baseline gap-3 border-b border-border/50 py-1 last:border-0"
          >
            <span className="font-mono text-xs text-muted-foreground">
              {new Date(e.timestamp).toLocaleString()}
            </span>
            <span className="rounded bg-muted px-1.5 py-0.5 text-xs uppercase text-muted-foreground">
              {e.actorRole}
            </span>
            <span>{summarize(e, stashLabelById)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Per-TxType human summary. Stays terse — the timestamp + actorRole are
 * shown beside it so this string is just the "what happened" piece. */
function summarize(e: ItemEntry, stashLabels: ReadonlyMap<string, string>): string {
  switch (e.type) {
    case 'acquire':
      return `Acquired \u00d7${String(e.payload.quantity)} (source: ${e.payload.source})`;
    case 'consume':
      return e.payload.removed
        ? `Removed (consumed last ${String(e.payload.quantity)})`
        : `Consumed \u00d7${String(e.payload.quantity)}`;
    case 'edit-item-instance':
      return `Edited ${e.payload.changedFields.join(' + ')}`;
    case 'transfer': {
      // Source stash may have been deleted (delete-cascade synthesizes
      // these). Fall back to a short-uuid prefix so the row is still
      // legible — the full id stays in the log for forensic use.
      const from = stashLabels.get(e.payload.fromStashId) ?? shortId(e.payload.fromStashId);
      const to = stashLabels.get(e.payload.toStashId) ?? shortId(e.payload.toStashId);
      return `Transferred \u00d7${String(e.payload.quantity)} from ${from} to ${to}`;
    }
  }
}

function shortId(id: string): string {
  return id.slice(0, 8);
}
