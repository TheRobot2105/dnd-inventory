import { useState, type ReactElement } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';

import { useStore } from '@/store';

type Tab = 'inventory' | 'storage' | 'party' | 'recovered-loot';

const TABS: ReadonlyArray<{ id: Tab; label: string }> = [
  { id: 'inventory', label: 'Inventory' },
  { id: 'storage', label: 'Storage' },
  { id: 'party', label: 'Party Stash' },
  { id: 'recovered-loot', label: 'Recovered Loot' },
];

/**
 * CharacterSheet (MVP §7 screen 2). Header + 4 tabs.
 *
 * Tab bodies are intentional placeholders for M1 — the surrounding
 * milestones fill them in:
 *   - Inventory items table → M2
 *   - Storage stash list / detail → M3
 *   - Currency rows everywhere → M4
 *   - Move / Split per row → M5
 */
export function CharacterSheet(): ReactElement {
  const { id } = useParams<{ id: string }>();
  const character = useStore(
    useShallow((s) => s.appState?.characters.find((c) => c.id === id) ?? null),
  );
  const [tab, setTab] = useState<Tab>('inventory');

  if (character === null) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{character.name}</h1>
        <p className="text-sm text-muted-foreground">
          Level {character.level} {character.species} {character.class}
          <span className="mx-2">•</span>
          STR {character.abilityScores.STR}
        </p>
      </header>

      <div className="border-b border-border">
        <nav className="-mb-px flex gap-1" aria-label="Tabs">
          {TABS.map((t) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={
                  'border-b-2 px-3 py-2 text-sm font-medium transition-colors ' +
                  (active
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground')
                }
              >
                {t.label}
              </button>
            );
          })}
        </nav>
      </div>

      <section className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        <TabPlaceholder tab={tab} />
      </section>
    </div>
  );
}

function TabPlaceholder({ tab }: { tab: Tab }): ReactElement {
  switch (tab) {
    case 'inventory':
      return <p>Inventory items table arrives in M2.</p>;
    case 'storage':
      return <p>Storage stash management arrives in M3.</p>;
    case 'party':
      return <p>Party Stash items + currency arrive in M2 / M4.</p>;
    case 'recovered-loot':
      return <p>Recovered Loot view arrives in M2 / M4.</p>;
  }
}
