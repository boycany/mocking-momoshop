import { pageWindow, parsePage, parseSort } from './search-params';

describe('search params', () => {
  it('accepts known sort options and falls back to relevance', () => {
    expect(parseSort('price-asc')).toBe('price-asc');
    expect(parseSort('abc')).toBe('relevance');
    expect(parseSort(undefined)).toBe('relevance');
  });

  it('accepts positive integer pages and falls back to 1', () => {
    expect(parsePage('3')).toBe(3);
    expect(parsePage('-1')).toBe(1);
    expect(parsePage('1.5')).toBe(1);
    expect(parsePage('abc')).toBe(1);
    expect(parsePage(undefined)).toBe(1);
  });

  it('lists every page when there are few', () => {
    expect(pageWindow(1, 3)).toEqual([1, 2, 3]);
    expect(pageWindow(1, 0)).toEqual([]);
  });

  it('centres a window on the current page when there are many', () => {
    expect(pageWindow(10, 30, 5)).toEqual([8, 9, 10, 11, 12]);
    expect(pageWindow(1, 30, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(pageWindow(30, 30, 5)).toEqual([26, 27, 28, 29, 30]);
  });
});
