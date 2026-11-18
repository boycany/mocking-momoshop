import { TestBed } from '@angular/core/testing';
import { Product } from '../models';
import {
  RECENTLY_VIEWED_LIMIT,
  RECENTLY_VIEWED_STORAGE_KEY,
  RecentlyViewedStore,
} from './recently-viewed.store';

const product = (id: string): Product => ({
  id,
  name: `商品 ${id}`,
  brand: 'Brand',
  promoText: null,
  categoryId: 'phone',
  price: 100,
  originalPrice: null,
  images: [`image-${id}`],
  tags: [],
  specs: [],
  rating: 5,
  reviewCount: 0,
  soldCount: 0,
  description: '',
  createdAt: '2026-11-01',
});

const ids = (store: InstanceType<typeof RecentlyViewedStore>) =>
  store.items().map((item) => item.id);

describe('RecentlyViewedStore', () => {
  beforeEach(() => localStorage.clear());

  it('keeps the newest products first, up to the limit of three', () => {
    const store = TestBed.inject(RecentlyViewedStore);
    ['a', 'b', 'c', 'd'].forEach((id) => store.record(product(id)));

    expect(RECENTLY_VIEWED_LIMIT).toBe(3);
    expect(ids(store)).toEqual(['d', 'c', 'b']);
  });

  it('moves a re-viewed product to the front without duplicating it', () => {
    const store = TestBed.inject(RecentlyViewedStore);
    ['a', 'b', 'c', 'a'].forEach((id) => store.record(product(id)));
    expect(ids(store)).toEqual(['a', 'c', 'b']);
  });

  it('stores a lightweight snapshot', () => {
    const store = TestBed.inject(RecentlyViewedStore);
    store.record(product('a'));
    expect(store.items()[0]).toEqual({ id: 'a', name: '商品 a', image: 'image-a' });
  });

  it('persists to localStorage and restores on the next start', () => {
    TestBed.inject(RecentlyViewedStore).record(product('a'));
    TestBed.tick();
    expect(localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY)).toContain('"id":"a"');

    TestBed.resetTestingModule();
    expect(ids(TestBed.inject(RecentlyViewedStore))).toEqual(['a']);
  });
});
