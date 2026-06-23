import { z } from 'zod';

/**
 * Character — MVP carries STR only (encumbrance enforcement deferred to
 * R1). `encumbranceRule` is hard-coded `"off"` and `maxAttunement` is
 * stored but not enforced (MVP §6). Schema keeps fields settable so R1
 * can flip them without a migration.
 */
export const characterSchema = z.object({
  id: z.string().min(1),
  partyId: z.string().min(1),
  ownerUserId: z.string().min(1),
  name: z.string().min(1),
  species: z.string().min(1),
  class: z.string().min(1),
  level: z.number().int().min(1).max(20),
  abilityScores: z.object({
    STR: z.number().int().min(1).max(30),
  }),
  maxAttunement: z.number().int().min(0),
  encumbranceRule: z.literal('off'),
  inventoryStashId: z.string().min(1),
});

export type Character = z.infer<typeof characterSchema>;
