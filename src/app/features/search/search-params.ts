import { SORT_OPTIONS, SortOption } from '../../data-access/models';

/** Query params come from user-editable URLs, so anything unexpected falls back to a default. */
export function parseSort(value: string | undefined): SortOption {
  return SORT_OPTIONS.includes(value as SortOption) ? (value as SortOption) : 'relevance';
}

export function parsePage(value: string | number | undefined): number {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

/** Page numbers to show: every page when few, otherwise a window centred on the current page. */
export function pageWindow(current: number, totalPages: number, size = 10): number[] {
  const count = Math.min(size, totalPages);
  const start = Math.min(Math.max(1, current - Math.floor(count / 2)), totalPages - count + 1);
  return Array.from({ length: count }, (_, index) => start + index);
}
