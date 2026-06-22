import Dexie, { type Table } from 'dexie';

/**
 * The Dexie database for the D&D Inventory Manager.
 *
 * Per `docs/TECH_STACK.md` §2.4 the schema is one object store per `AppState`
 * entity. In M0 only the `meta` store is exercised — it holds the single
 * `AppState` envelope under the key `appState`. Entity-level stores are
 * declared up-front so M1+ can switch from "blob in meta" to "per-entity
 * indexed rows" via a Dexie `version().stores()` bump rather than a rewrite.
 *
 * Migration strategy: each schema change is an explicit `version().stores()`
 * call. Never edit an existing version's store definition — add a new one.
 */
export interface MetaRow {
  /** Always the literal string `appState` for the envelope row in M0. */
  key: string;
  /** The persisted AppState blob. Typed `unknown` until M1 introduces the Zod schema. */
  value: unknown;
}

export class DndInvDb extends Dexie {
  meta!: Table<MetaRow, string>;

  constructor() {
    super('dnd-inv');
    // v1: single meta blob (M0). Entity stores declared but unused in M0;
    // they reserve names so M1+ migrations don't need to rename anything.
    this.version(1).stores({
      meta: 'key',
      users: 'id',
      parties: 'id',
      memberships: '[userId+partyId+role]',
      characters: 'id, partyId, ownerUserId',
      stashes: 'id, scope, ownerCharacterId, partyId',
      items: 'id, ownerId, definitionId',
      currencies: 'id, stashId',
      catalog: 'id, source, category',
      log: 'id, partyId, timestamp',
    });
  }
}

export const db = new DndInvDb();
