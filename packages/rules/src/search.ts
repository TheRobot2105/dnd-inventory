/**
 * Catalog search (OUTLINE §6).
 *
 * M0 stub — signatures only. Implementation lands in R6 per
 * docs/roadmap.md. Fuzzy multi-field scoring across name + description +
 * tags.
 */

export interface SearchResult<T> {
  item: T;
  score: number;
}

/** Score a query against a list of items. Higher score = better match. */
export function search<
  T extends { name: string; description?: string; tags?: ReadonlyArray<string> },
>(_query: string, _items: ReadonlyArray<T>): SearchResult<T>[] {
  throw new Error('search.search: not implemented (R6)');
}
