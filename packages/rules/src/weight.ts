/**
 * Weight aggregation (OUTLINE §6).
 *
 * M0 stub — signatures only. Implementation lands in R1 per
 * docs/roadmap.md. Single-level container nesting with Bag-of-Holding-style
 * flat-weight exceptions.
 */

/** Sum the weights of a set of item instances. Containers contribute their flat weight. */
export function totalWeight(_items: ReadonlyArray<{ weight: number; quantity: number }>): number {
  throw new Error('weight.totalWeight: not implemented (R1)');
}
