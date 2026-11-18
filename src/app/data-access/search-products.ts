import { Product, SearchQuery, SearchResult, SortOption } from './models';

const normalize = (text: string): string => text.normalize('NFKC').toLowerCase();

const comparators: Record<SortOption, (a: Product, b: Product) => number> = {
  // Without a real ranking service, relevance falls back to popularity.
  relevance: (a, b) => b.soldCount - a.soldCount,
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
};

/**
 * Pure search over an in-memory catalog: every keyword term must match the product name or brand
 * (case- and width-insensitive), optionally scoped to one category, then sorted and paginated.
 */
export function searchProducts(products: readonly Product[], query: SearchQuery): SearchResult {
  const terms = normalize(query.keyword).split(/\s+/).filter(Boolean);
  const pageSize = Math.max(1, Math.floor(query.pageSize));

  const matches = products
    .filter((product) => !query.categoryId || product.categoryId === query.categoryId)
    .filter((product) => {
      const haystack = normalize(`${product.brand} ${product.name}`);
      return terms.every((term) => haystack.includes(term));
    })
    .sort(comparators[query.sort]);

  const lastPage = Math.max(1, Math.ceil(matches.length / pageSize));
  const page = Math.min(Math.max(1, Math.floor(query.page)), lastPage);
  const start = (page - 1) * pageSize;

  return {
    items: matches.slice(start, start + pageSize),
    total: matches.length,
    page,
    pageSize,
  };
}
