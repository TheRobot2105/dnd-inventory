import { z } from 'zod';

/**
 * PartyMembership — composite primary key is `(userId, partyId, role)`,
 * which is why the party creator has TWO rows in MVP (dm + player) for
 * the same user. `characterId` is null on the dm row, set on the player
 * row (OUTLINE §4 invariants / MVP §6).
 */
export const partyMembershipSchema = z.object({
  userId: z.string().min(1),
  partyId: z.string().min(1),
  role: z.enum(['dm', 'player']),
  characterId: z.string().min(1).nullable(),
  joinedAt: z.string().datetime(),
  leftAt: z.null(),
});

export type PartyMembership = z.infer<typeof partyMembershipSchema>;
