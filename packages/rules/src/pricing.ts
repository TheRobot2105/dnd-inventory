/**
 * Shop pricing (OUTLINE §6).
 *
 * M0 stub — signatures only. Implementation lands in R6 per
 * docs/roadmap.md. base price × shop modifier; sell-to-merchant defaults
 * to 0.5×.
 */

export interface ShopPricing {
  priceModifier: number;
  sellToMerchantRate: number;
}

/** Compute buy price of an item at a given shop. */
export function buyPrice(_basePriceCp: number, _shop: ShopPricing): number {
  throw new Error('pricing.buyPrice: not implemented (R6)');
}

/** Compute sell-to-merchant price of an item at a given shop. */
export function sellPrice(_basePriceCp: number, _shop: ShopPricing): number {
  throw new Error('pricing.sellPrice: not implemented (R6)');
}
