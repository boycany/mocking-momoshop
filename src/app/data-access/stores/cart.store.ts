import { computed, effect, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Product } from '../models';
import { BrowserStorage } from '../storage/browser-storage';

export const CART_STORAGE_KEY = 'mocking-momoshop.cart';
export const MAX_ITEM_QUANTITY = 99;

/** Selected option label per spec group, e.g. { 顏色: '黑色', 容量: '256GB' }. */
export type SelectedSpecs = Readonly<Record<string, string>>;

export interface CartItem {
  /** Product id plus selected specs: the same product in another colour is a separate line. */
  readonly key: string;
  readonly productId: string;
  readonly name: string;
  readonly image: string;
  readonly price: number;
  readonly specs: SelectedSpecs;
  readonly quantity: number;
}

export const cartItemKey = (productId: string, specs: SelectedSpecs): string =>
  [
    productId,
    ...Object.entries(specs)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([group, option]) => `${group}=${option}`),
  ].join('|');

const clampQuantity = (quantity: number): number =>
  Math.min(MAX_ITEM_QUANTITY, Math.max(1, Math.floor(quantity)));

const isCartItem = (value: unknown): value is CartItem => {
  const item = value as CartItem;
  return (
    typeof item?.key === 'string' &&
    typeof item.productId === 'string' &&
    typeof item.quantity === 'number'
  );
};

export const CartStore = signalStore(
  { providedIn: 'root' },
  withState<{ items: readonly CartItem[] }>({ items: [] }),
  withComputed(({ items }) => ({
    totalQuantity: computed(() => items().reduce((sum, item) => sum + item.quantity, 0)),
    subtotal: computed(() => items().reduce((sum, item) => sum + item.price * item.quantity, 0)),
  })),
  withMethods((store) => ({
    add(product: Product, specs: SelectedSpecs, quantity = 1): void {
      const key = cartItemKey(product.id, specs);
      const existing = store.items().find((item) => item.key === key);

      patchState(store, {
        items: existing
          ? store
              .items()
              .map((item) =>
                item.key === key
                  ? { ...item, quantity: clampQuantity(item.quantity + quantity) }
                  : item,
              )
          : [
              ...store.items(),
              {
                key,
                productId: product.id,
                name: product.name,
                image: product.images[0] ?? '',
                price: product.price,
                specs,
                quantity: clampQuantity(quantity),
              },
            ],
      });
    },
    updateQuantity(key: string, quantity: number): void {
      patchState(store, {
        items: store
          .items()
          .map((item) =>
            item.key === key ? { ...item, quantity: clampQuantity(quantity) } : item,
          ),
      });
    },
    remove(key: string): void {
      patchState(store, { items: store.items().filter((item) => item.key !== key) });
    },
    clear(): void {
      patchState(store, { items: [] });
    },
  })),
  withHooks({
    onInit(store) {
      const storage = inject(BrowserStorage);
      const saved = storage.get<unknown>(CART_STORAGE_KEY);
      // Ignore malformed data (e.g. from an older version) instead of crashing.
      if (Array.isArray(saved)) {
        patchState(store, { items: saved.filter(isCartItem) });
      }
      effect(() => storage.set(CART_STORAGE_KEY, store.items()));
    },
  }),
);
