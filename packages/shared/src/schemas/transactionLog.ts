import { z } from 'zod';

/**
 * TransactionLog — MVP captures a strict SUBSET of the OUTLINE §4 full
 * union. Every action that mutates state appends one entry; the discriminant
 * `type` maps 1:1 to reducer actions (CLAUDE.md store invariant).
 *
 * Adding a new mutation in a later milestone means BOTH adding a reducer
 * case AND extending this union with the new variant.
 *
 * `actorRole` is derived at write time: in MVP everything is `"player"`
 * for player-driven actions and `"dm"` for DM-only ones; in MVP there is
 * only one user wearing both hats, so reducer cases that are conceptually
 * DM-driven log as `"dm"` for forward-compat (e.g. `create-character`
 * provisions the party).
 *
 * `sessionId` is `null` until R5 (`Session` entity).
 */

const baseLogFields = {
  id: z.string().min(1),
  partyId: z.string().min(1),
  sessionId: z.null(),
  timestamp: z.string().datetime(),
  actorUserId: z.string().min(1),
  actorRole: z.enum(['dm', 'player']),
};

const createCharacterEntry = z.object({
  ...baseLogFields,
  type: z.literal('create-character'),
  payload: z.object({
    characterId: z.string().min(1),
    userId: z.string().min(1),
    partyId: z.string().min(1),
    name: z.string().min(1),
    inventoryStashId: z.string().min(1),
    partyStashId: z.string().min(1),
    recoveredLootStashId: z.string().min(1),
  }),
});

// MVP TxType subset (MVP §6). Each post-M1 milestone adds a variant here
// AND a reducer case in apps/web/src/store/reducer.ts.
export const transactionLogEntrySchema = z.discriminatedUnion('type', [
  createCharacterEntry,
]);

export type TransactionLogEntry = z.infer<typeof transactionLogEntrySchema>;

/**
 * Allowed action `type` values. The reducer's input shape mirrors these
 * but without the derived log-only fields (id, timestamp, actorUserId,
 * actorRole, partyId, sessionId) — those are filled in by the store
 * middleware.
 */
export type TxType = TransactionLogEntry['type'];
