import { Product } from './product.model';

export const SORT_OPTIONS = ['relevance', 'price-asc', 'price-desc', 'newest'] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];

export const DEFAULT_PAGE_SIZE = 20;

export interface SearchQuery {
  readonly keyword: string;
  readonly categoryId?: string;
  readonly sort: SortOption;
  /** 1-based page number. */
  readonly page: number;
  readonly pageSize: number;
}

export interface SearchResult {
  readonly items: readonly Product[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}
