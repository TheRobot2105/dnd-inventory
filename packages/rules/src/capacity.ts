/**
 * Capacity / encumbrance rules (OUTLINE §6).
 *
 * M0 stub — signatures only. Implementation lands in R1 (post-MVP) per
 * docs/roadmap.md. STR × 15 carry capacity; encumbered > 5×STR; heavily
 * encumbered > 10×STR. Enforcement levels: off / advisory / hard.
 */

export type EncumbranceState = 'unencumbered' | 'encumbered' | 'heavily-encumbered';

export type EncumbranceRule = 'off' | 'advisory' | 'hard';

/** Returns the carrying capacity (in lbs) for a character given their STR. */
export function carryCapacity(_str: number): number {
  throw new Error('capacity.carryCapacity: not implemented (R1)');
}

/** Categorize a current weight against a character's STR + rule. */
export function encumbranceState(
  _currentWeight: number,
  _str: number,
  _rule: EncumbranceRule,
): EncumbranceState {
  throw new Error('capacity.encumbranceState: not implemented (R1)');
}
