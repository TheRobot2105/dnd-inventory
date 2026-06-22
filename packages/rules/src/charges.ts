/**
 * Charge tracking and recharge rules (OUTLINE §6).
 *
 * M0 stub — signatures only. Implementation lands in R2 per
 * docs/roadmap.md. Triggers: dawn / dusk / long-rest / short-rest / custom.
 * Never-negative + never-over-max invariants.
 */

export type RechargeTrigger = 'dawn' | 'dusk' | 'long-rest' | 'short-rest' | 'custom';

export interface ChargeSpec {
  max: number;
  rechargeRule: RechargeTrigger;
  /** Optional formula (e.g. "1d4+1") evaluated on recharge. */
  rechargeAmount?: string;
}

/** Returns the next `currentCharges` value after spending one charge. */
export function useCharge(_current: number): number {
  throw new Error('charges.useCharge: not implemented (R2)');
}

/** Apply a recharge trigger to a single item; returns new `currentCharges`. */
export function recharge(_current: number, _spec: ChargeSpec, _trigger: RechargeTrigger): number {
  throw new Error('charges.recharge: not implemented (R2)');
}
