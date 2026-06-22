/**
 * Attunement slot tracking (OUTLINE §6).
 *
 * M0 stub — signatures only. Implementation lands in R1 per
 * docs/roadmap.md. Default cap = 3, DM-overridable per character.
 */

/** Returns true if the character has a free attunement slot. */
export function hasFreeSlot(_attunedCount: number, _maxAttunement: number): boolean {
  throw new Error('attunement.hasFreeSlot: not implemented (R1)');
}

/** Display string for a prerequisite ("Druid, Cleric"). Advisory only — not enforced. */
export function prereqDisplay(_prereq: string | undefined): string {
  throw new Error('attunement.prereqDisplay: not implemented (R1)');
}
