import { z } from 'zod';

/**
 * Party — exactly one exists in MVP, marked `isSoloShortcut: true`.
 * `bankerUserId` is hard-coded `null` and `isSoloShortcut` hard-coded
 * `true` in MVP (party-of-one). Both fields are present in the schema so
 * a post-R4 multi-member build can populate them without a migration
 * (MVP §6 invariants; OUTLINE §4 Party).
 */
export const partySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  ownerUserId: z.string().min(1),
  inviteCode: z.string().min(1),
  recoveredLootStashId: z.string().min(1),
  bankerUserId: z.null(),
  isSoloShortcut: z.literal(true),
  createdAt: z.string().datetime(),
});

export type Party = z.infer<typeof partySchema>;
