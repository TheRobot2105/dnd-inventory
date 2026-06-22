/**
 * @app/rules — pure, deterministic rule modules (OUTLINE §6).
 *
 * MVP M0 ships type-signature-only stubs for capacity, attunement, charges,
 * weight, hoard, validation, pricing, and search. They throw at runtime so
 * accidental calls fail loudly. Implementations land per the post-MVP release
 * milestones tracked in docs/roadmap.md.
 *
 * currency.ts and inventory.ts (per MVP §8) land with real implementations
 * in MVP M4 and M5 respectively — they are intentionally NOT exported yet.
 */

export * as capacity from './capacity';
export * as attunement from './attunement';
export * as charges from './charges';
export * as weight from './weight';
export * as hoard from './hoard';
export * as validation from './validation';
export * as pricing from './pricing';
export * as search from './search';
