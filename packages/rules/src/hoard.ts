/**
 * Hoard / treasure generation (OUTLINE §6).
 *
 * M0 stub — signatures only. Implementation lands in R6 per
 * docs/roadmap.md. Uses DMG 2024 tables, parameterised by CR band.
 */

export type CrBand = '0-4' | '5-10' | '11-16' | '17+';

export interface Hoard {
  coins: { cp: number; sp: number; ep: number; gp: number; pp: number };
  /** Item-definition ids of generated items. */
  items: string[];
}

/** Roll an individual treasure for a single creature. */
export function rollIndividual(_band: CrBand): Hoard {
  throw new Error('hoard.rollIndividual: not implemented (R6)');
}

/** Roll a hoard (encounter loot). */
export function rollHoard(_band: CrBand): Hoard {
  throw new Error('hoard.rollHoard: not implemented (R6)');
}
