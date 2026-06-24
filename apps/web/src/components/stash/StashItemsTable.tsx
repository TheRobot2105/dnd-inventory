import { type ReactElement, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';

import { Button } from '@/components/ui/button';
import { useStore } from '@/store';
import type { ItemDefinition } from '@app/shared';
import { MoveItemModal } from './MoveItemModal';
import { SplitModal } from './SplitModal';

/** Stable empty-catalog reference — fresh `[]` literals would break Zustand
 * reference equality and cause an infinite render loop when `appState` is
 * null (see CatalogBrowser for the long version). */
const EMPTY_CATALOG: readonly ItemDefinition[] = [];

interface StashItemsTableProps {
  stashId: string;
}

/**
 * Renders one row per `ItemInstance` in `stashId`. Reusable across the
 * Inventory / Party Stash / Recovered Loot tabs (M2) and Storage detail
 * (M3).
 *
 * Per-row actions:
 *   - **−** / **+**: dispatch `consume` / `acquire` against the auto-stack
 *     key `(definitionId, notes ?? "")`. The `+` re-dispatches via
 *     `acquire` rather than mutating the row directly so the log captures
 *     the increment.
 *   - **Split** (M5): open the SplitModal. Disabled when `quantity < 2`
 *     (`validateSplit` would reject anyway, but the button signals
 *     un-splittability up front).
 *   - **Move** (M5): open the MoveItemModal.
 *   - **Remove**: drop the row by consuming its full quantity. The
 *     reducer logs `removed: true` so the history view gets a clean
 *     "row gone" entry.
 *
 * Modal state lives at the table level: one MoveItemModal + one SplitModal
 * are mounted and re-targeted by the row that opened them (mirrors the way
 * `CharacterSheet` mounts `AddItemModal` once per tab). The active
 * `itemInstanceId` is stored in component state.
 */
export function StashItemsTable({ stashId }: StashItemsTableProps): ReactElement {
  const navigate = useNavigate();
  const items = useStore(
    useShallow((s) =>
      s.appState === null ? [] : s.appState.items.filter((i) => i.ownerId === stashId),
    ),
  );
  // Catalog lookup map. Recomputed when the catalog identity changes — and
  // since `seed-catalog` rebuilds the array, it'll re-render correctly.
  const catalog = useStore((s) => s.appState?.catalog ?? EMPTY_CATALOG);
  const catalogById = useMemo(() => new Map(catalog.map((d) => [d.id, d])), [catalog]);
  const dispatch = useStore((s) => s.dispatch);

  // Modal state — one of each mounted at the table level; `activeItemId`
  // tells the modal which row to operate on.
  const [moveOpen, setMoveOpen] = useState(false);
  const [splitOpen, setSplitOpen] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nothing here yet. Add items from the catalog.
      </p>
    );
  }

  return (
    <>
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border text-xs uppercase text-muted-foreground">
          <tr>
            <th className="py-2 pr-2 font-medium">Name</th>
            <th className="py-2 pr-2 font-medium">Category</th>
            <th className="py-2 pr-2 text-right font-medium">Qty</th>
            <th className="py-2 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => {
            const def = catalogById.get(row.definitionId);
            const displayName = row.customName ?? def?.name ?? '(unknown item)';
            const canSplit = row.quantity >= 2;
            return (
              <tr key={row.id} className="border-b border-border/50 last:border-0">
                <td className="py-2 pr-2">
                  <button
                    type="button"
                    onClick={() => {
                      void navigate(`/item/${row.id}`);
                    }}
                    className="text-left underline-offset-2 hover:underline focus:outline-none focus-visible:underline"
                    aria-label={`Open details for ${displayName}`}
                  >
                    {displayName}
                  </button>
                </td>
                <td className="py-2 pr-2 text-muted-foreground">{def?.category ?? '—'}</td>
                <td className="py-2 pr-2 text-right tabular-nums">{row.quantity}</td>
                <td className="py-2 text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      aria-label={`Decrease ${displayName}`}
                      onClick={() => {
                        dispatch({
                          type: 'consume',
                          payload: { itemInstanceId: row.id, quantity: 1 },
                        });
                      }}
                    >
                      −
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      aria-label={`Increase ${displayName}`}
                      onClick={() => {
                        // Re-dispatch via `acquire` rather than mutating the
                        // row directly so the log captures the increment.
                        dispatch({
                          type: 'acquire',
                          payload: {
                            stashId,
                            definitionId: row.definitionId,
                            quantity: 1,
                            source: 'catalog-add',
                            ...(row.notes !== undefined ? { notes: row.notes } : {}),
                          },
                        });
                      }}
                    >
                      +
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={!canSplit}
                      aria-label={`Split ${displayName}`}
                      onClick={() => {
                        setActiveItemId(row.id);
                        setSplitOpen(true);
                      }}
                    >
                      Split
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      aria-label={`Move ${displayName}`}
                      onClick={() => {
                        setActiveItemId(row.id);
                        setMoveOpen(true);
                      }}
                    >
                      Move
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        dispatch({
                          type: 'consume',
                          payload: { itemInstanceId: row.id, quantity: row.quantity },
                        });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {activeItemId !== null ? (
        <>
          <MoveItemModal
            open={moveOpen}
            onOpenChange={(next) => {
              setMoveOpen(next);
              if (!next) setActiveItemId(null);
            }}
            itemInstanceId={activeItemId}
          />
          <SplitModal
            open={splitOpen}
            onOpenChange={(next) => {
              setSplitOpen(next);
              if (!next) setActiveItemId(null);
            }}
            itemInstanceId={activeItemId}
          />
        </>
      ) : null}
    </>
  );
}
