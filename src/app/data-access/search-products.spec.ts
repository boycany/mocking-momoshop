import { Product, SearchQuery } from './models';
import { searchProducts } from './search-products';

const product = (overrides: Partial<Product> & Pick<Product, 'id'>): Product => ({
  name: 'Product',
  brand: 'Brand',
  promoText: null,
  categoryId: 'appliance',
  price: 100,
  originalPrice: null,
  images: [],
  tags: [],
  specs: [],
  rating: 5,
  reviewCount: 0,
  soldCount: 0,
  description: '',
  createdAt: '2026-11-01',
  ...overrides,
});

const catalog: Product[] = [
  product({
    id: 'a',
    brand: 'Panasonic 國際牌',
    name: '變頻洗衣機',
    price: 30000,
    soldCount: 50,
    createdAt: '2026-10-01',
  }),
  product({
    id: 'b',
    brand: 'Panasonic 國際牌',
    name: '蒸氣掛燙機',
    price: 2000,
    soldCount: 300,
    createdAt: '2026-11-10',
  }),
  product({
    id: 'c',
    brand: 'Dyson',
    name: '無線吸塵器',
    price: 15000,
    soldCount: 120,
    createdAt: '2026-09-15',
  }),
  product({
    id: 'd',
    brand: '寶拉珍選',
    name: '水楊酸精華',
    categoryId: 'beauty',
    price: 1200,
    soldCount: 900,
  }),
];

const query = (overrides: Partial<SearchQuery> = {}): SearchQuery => ({
  keyword: '',
  sort: 'relevance',
  page: 1,
  pageSize: 20,
  ...overrides,
});

const ids = (items: readonly Product[]) => items.map((item) => item.id);

describe('searchProducts', () => {
  it('matches the keyword against brand and name, case-insensitively', () => {
    expect(ids(searchProducts(catalog, query({ keyword: 'PANASONIC' })).items)).toEqual(['b', 'a']);
    expect(ids(searchProducts(catalog, query({ keyword: '吸塵器' })).items)).toEqual(['c']);
  });

  it('requires every keyword term to match', () => {
    expect(ids(searchProducts(catalog, query({ keyword: 'panasonic 洗衣機' })).items)).toEqual([
      'a',
    ]);
  });

  it('normalizes full-width characters', () => {
    expect(ids(searchProducts(catalog, query({ keyword: 'Ｄｙｓｏｎ' })).items)).toEqual(['c']);
  });

  it('filters by category', () => {
    expect(ids(searchProducts(catalog, query({ categoryId: 'beauty' })).items)).toEqual(['d']);
  });

  it('sorts by relevance (popularity), price and newest', () => {
    expect(ids(searchProducts(catalog, query()).items)).toEqual(['d', 'b', 'c', 'a']);
    expect(ids(searchProducts(catalog, query({ sort: 'price-asc' })).items)).toEqual([
      'd',
      'b',
      'c',
      'a',
    ]);
    expect(ids(searchProducts(catalog, query({ sort: 'price-desc' })).items)).toEqual([
      'a',
      'c',
      'b',
      'd',
    ]);
    expect(ids(searchProducts(catalog, query({ sort: 'newest' })).items)).toEqual([
      'b',
      'd',
      'a',
      'c',
    ]);
  });

  it('paginates and reports the total', () => {
    const result = searchProducts(catalog, query({ page: 2, pageSize: 3 }));
    expect(ids(result.items)).toEqual(['a']);
    expect(result).toMatchObject({ total: 4, page: 2, pageSize: 3 });
  });

  it('clamps out-of-range pages', () => {
    expect(searchProducts(catalog, query({ page: 99, pageSize: 3 })).page).toBe(2);
    expect(searchProducts(catalog, query({ page: 0, pageSize: 3 })).page).toBe(1);
  });

  it('returns an empty first page when nothing matches', () => {
    expect(searchProducts(catalog, query({ keyword: 'nothing' }))).toMatchObject({
      items: [],
      total: 0,
      page: 1,
    });
  });
});
