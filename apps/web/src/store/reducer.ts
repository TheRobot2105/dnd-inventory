import type { TransactionLogEntry } from '@app/shared';

import type { Action, AppState } from './types';

/**
 * Pure reducer. Takes the current state and an action, returns the next
 * state along with the log entry payload that should be appended.
 *
 * Why split the log entry across reducer / middleware:
 *   - the reducer is pure (no `crypto.randomUUID`, no `new Date()`), so
 *     it stays trivially testable.
 *   - the middleware (in `index.ts`) injects `id`, `timestamp`,
 *     `actorUserId`, `actorRole`, `partyId`, `sessionId`.
 *
 * Every reducer case must return a `logEntry` slice typed against the
 * `TransactionLogEntry` discriminated union — that's how we ensure
 * "every mutation appends one log entry" stays a type-level invariant.
 *
 * The reducer MUST validate-then-apply: if the action is illegal in the
 * current state (e.g. `create-character` dispatched when a character
 * already exists), throw. The store middleware does NOT swallow errors;
 * callers see them.
 */
/**
 * `LogEntrySlice` is the per-variant pair of `(type, payload)` that the
 * reducer returns. We define it distributively over the
 * `TransactionLogEntry` union so the discriminant survives — a plain
 * `Pick<TransactionLogEntry, 'type' | 'payload'>` would collapse the
 * union into a single member with `type: TxType` and lose the link
 * between each `type` literal and its matching payload shape.
 *
 * `T extends T` (rather than `T extends infer U`) is a distributive
 * conditional: TS evaluates it once per union member, then unions the
 * results. That preserves the discriminated-union narrowing in callers.
 */
export type LogEntrySlice<T extends TransactionLogEntry = TransactionLogEntry> = T extends T
  ? { type: T['type']; payload: T['payload'] }
  : never;

export interface ReducerResult {
  state: AppState;
  logEntry: LogEntrySlice;
}

export function reduce(state: AppState, action: Action): ReducerResult {
  switch (action.type) {
    case 'create-character':
      return createCharacter(state, action.payload);
  }
}

// -------------------------------------------------------------------- //
// create-character (M1)
// -------------------------------------------------------------------- //

/**
 * Provisions a fresh AppState in one atomic step:
 *   - the single local User (if missing)
 *   - the Party-of-one with `isSoloShortcut: true`
 *   - two PartyMemberships for the user (dm + player)
 *   - the Character
 *   - three Stashes: Inventory (carried), Party Stash, Recovered Loot
 *   - one CurrencyHolding per stash (all zeroed)
 *
 * Per the resolved open question (roadmap §Open Questions): zero default
 * Storage stashes — those are user-opt-in via M3's "New Storage stash".
 *
 * Refuses to run if a character already exists (MVP §6: "exactly one
 * Character"). M1 enforces this at the reducer; future milestones may
 * allow re-creation after `delete-character`.
 */
function createCharacter(
  state: AppState,
  payload: Extract<Action, { type: 'create-character' }>['payload'],
): ReducerResult {
  if (state !== null) {
    throw new Error('create-character: a character already exists');
  }

  const now = new Date().toISOString();
  const userId = crypto.randomUUID();
  const partyId = crypto.randomUUID();
  const characterId = crypto.randomUUID();
  const inventoryStashId = crypto.randomUUID();
  const partyStashId = crypto.randomUUID();
  const recoveredLootStashId = crypto.randomUUID();

  const nextState: NonNullable<AppState> = {
    version: 1,
    seedVersion: 0,
    user: {
      id: userId,
      displayName: 'You',
      createdAt: now,
    },
    party: {
      id: partyId,
      name: 'My Campaign',
      ownerUserId: userId,
      inviteCode: generateInviteCode(),
      recoveredLootStashId,
      bankerUserId: null,
      isSoloShortcut: true,
      createdAt: now,
    },
    memberships: [
      {
        userId,
        partyId,
        role: 'dm',
        characterId: null,
        joinedAt: now,
        leftAt: null,
      },
      {
        userId,
        partyId,
        role: 'player',
        characterId,
        joinedAt: now,
        leftAt: null,
      },
    ],
    characters: [
      {
        id: characterId,
        partyId,
        ownerUserId: userId,
        name: payload.name,
        species: payload.species,
        class: payload.class,
        level: payload.level,
        abilityScores: { STR: payload.str },
        maxAttunement: 3,
        encumbranceRule: 'off',
        inventoryStashId,
      },
    ],
    stashes: [
      {
        id: inventoryStashId,
        scope: 'character',
        name: 'Inventory',
        ownerCharacterId: characterId,
        partyId: null,
        isCarried: true,
        createdAt: now,
      },
      {
        id: partyStashId,
        scope: 'party',
        name: 'Party Stash',
        ownerCharacterId: null,
        partyId,
        isCarried: false,
        createdAt: now,
      },
      {
        id: recoveredLootStashId,
        scope: 'recovered-loot',
        name: 'Recovered Loot',
        ownerCharacterId: null,
        partyId,
        isCarried: false,
        createdAt: now,
      },
    ],
    catalog: [],
    items: [],
    currencies: [
      { id: crypto.randomUUID(), stashId: inventoryStashId, cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
      { id: crypto.randomUUID(), stashId: partyStashId, cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
      { id: crypto.randomUUID(), stashId: recoveredLootStashId, cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    ],
    log: [],
  };

  return {
    state: nextState,
    logEntry: {
      type: 'create-character',
      payload: {
        characterId,
        userId,
        partyId,
        name: payload.name,
        inventoryStashId,
        partyStashId,
        recoveredLootStashId,
      },
    },
  };
}

/** A short uppercase invite code. Display-only in MVP (Party.inviteCode
 * exists for forward-compat with R4 multi-member join flow). */
function generateInviteCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let code = '';
  for (const b of bytes) code += alphabet[b % alphabet.length];
  return `INV-${code}`;
}
