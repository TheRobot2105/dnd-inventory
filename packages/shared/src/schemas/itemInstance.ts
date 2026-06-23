import { z } from 'zod';

/**
 * ItemInstance — a row in a stash. MVP hard-codes the magic/equip fields
 * to placeholder values so the schema is forward-compatible with R1
 * (equip/attune) and R2 (magic items + charges + identification) without
 * a migration (MVP §6 / §13).
 *
 * Auto-stack key (enforced by the reducer, not the schema): `(definitionId, notes ?? "")`.
 */
export const itemInstanceSchema = z.object({
  id: z.string().min(1),
  definitionId: z.string().min(1),
  ownerType: z.literal('stash'),
  ownerId: z.string().min(1),
  containerInstanceId: z.null(),
  quantity: z.number().int().positive(),
  equipped: z.literal(false),
  attuned: z.literal(false),
  identified: z.literal(true),
  currentCharges: z.null(),
  customName: z.string().min(1).optional(),
  notes: z.string().optional(),
  conditionOverrides: z.record(z.string(), z.unknown()).optional(),
});

export type ItemInstance = z.infer<typeof itemInstanceSchema>;
