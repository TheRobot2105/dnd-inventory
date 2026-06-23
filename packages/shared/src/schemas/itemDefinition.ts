import { z } from 'zod';

/**
 * ItemDefinition — the catalog entry. MVP carries PHB + homebrew only;
 * DMG (rarity, attunement, charges) lands in R2 (MVP §6 / §13).
 *
 * `source = "PHB"` entries are immutable in the UI; users `duplicate-to-edit`
 * to create a homebrew clone (carries `duplicatedFromId`).
 */
export const itemCategorySchema = z.enum([
  'weapon',
  'armor',
  'gear',
  'tool',
  'ammunition',
  'consumable',
  'container',
  'other',
]);
export type ItemCategory = z.infer<typeof itemCategorySchema>;

export const currencyDenominationSchema = z.enum(['cp', 'sp', 'ep', 'gp', 'pp']);
export type CurrencyDenomination = z.infer<typeof currencyDenominationSchema>;

export const itemDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  source: z.enum(['PHB', 'homebrew']),
  category: itemCategorySchema,
  weight: z.number().nonnegative().optional(),
  cost: z
    .object({
      amount: z.number().nonnegative(),
      currency: currencyDenominationSchema,
    })
    .optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  duplicatedFromId: z.string().min(1).optional(),
  createdBy: z.string().min(1).optional(),
  partyId: z.string().min(1).optional(),
});

export type ItemDefinition = z.infer<typeof itemDefinitionSchema>;
