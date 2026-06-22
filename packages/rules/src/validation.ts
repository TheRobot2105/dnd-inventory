/**
 * Equip/attune validation (OUTLINE §6).
 *
 * M0 stub — signatures only. Implementation lands in R1 per
 * docs/roadmap.md. Detects equip slot conflicts (2H weapon + shield,
 * armor-on-armor, etc.).
 */

export interface ValidationIssue {
  code: string;
  message: string;
}

/** Check whether equipping a given item conflicts with the currently equipped set. */
export function validateEquip(
  _itemDefinitionId: string,
  _currentlyEquippedDefinitionIds: ReadonlyArray<string>,
): ValidationIssue[] {
  throw new Error('validation.validateEquip: not implemented (R1)');
}
