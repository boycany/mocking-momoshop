import { TestBed } from '@angular/core/testing';
import { Product } from '../models';
import { CART_STORAGE_KEY, CartStore, MAX_ITEM_QUANTITY } from './cart.store';

const product = (id: string, price: number): Product => ({
  id,
  name: `商品 ${id}`,
  brand: 'Brand',
  promoText: null,
  categoryId: 'phone',
  price,
  originalPrice: null,
  images: ['image'],
  tags: [],
  specs: [],
  rating: 5,
  reviewCount: 0,
  soldCount: 0,
  description: '',
  createdAt: '2026-11-01',
});

describe('CartStore', () => {
  beforeEach(() => localStorage.clear());

  const createStore = () => TestBed.inject(CartStore);

  it('merges the same product and specs into one line', () => {
    const cart = createStore();
    cart.add(product('a', 100), { 顏色: '黑色' }, 1);
    cart.add(product('a', 100), { 顏色: '黑色' }, 2);

    expect(cart.items()).toHaveLength(1);
    expect(cart.items()[0].quantity).toBe(3);
  });

  it('keeps different specs of the same product as separate lines', () => {
    const cart = createStore();
    cart.add(product('a', 100), { 顏色: '黑色' });
    cart.add(product('a', 100), { 顏色: '白色' });
    expect(cart.items()).toHaveLength(2);
  });

  it('computes total quantity and subtotal', () => {
    const cart = createStore();
    cart.add(product('a', 100), {}, 2);
    cart.add(product('b', 50), {}, 3);

    expect(cart.totalQuantity()).toBe(5);
    expect(cart.subtotal()).toBe(350);
  });

  it('clamps quantities to the allowed range', () => {
    const cart = createStore();
    cart.add(product('a', 100), {}, 500);
    expect(cart.items()[0].quantity).toBe(MAX_ITEM_QUANTITY);

    cart.updateQuantity(cart.items()[0].key, 0);
    expect(cart.items()[0].quantity).toBe(1);
  });

  it('persists to localStorage and restores on the next start', () => {
    const cart = createStore();
    cart.add(product('a', 100), { 顏色: '黑色' }, 2);
    TestBed.tick();
    expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? '[]')).toHaveLength(1);

    TestBed.resetTestingModule();
    const restored = createStore();
    expect(restored.totalQuantity()).toBe(2);
  });

  it('ignores malformed saved data', () => {
    localStorage.setItem(CART_STORAGE_KEY, '{"not":"an array"}');
    expect(createStore().items()).toEqual([]);
  });
});
