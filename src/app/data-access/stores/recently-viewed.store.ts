import { effect, inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { Product } from '../models';
import { BrowserStorage } from '../storage/browser-storage';

export const RECENTLY_VIEWED_STORAGE_KEY = 'mocking-momoshop.recently-viewed';
export const RECENTLY_VIEWED_LIMIT = 3;

/** Snapshot of what the sidebar needs, so it can render without another API call. */
export interface ViewedProduct {
  readonly id: string;
  readonly name: string;
  readonly image: string;
}

const isViewedProduct = (value: unknown): value is ViewedProduct => {
  const item = value as ViewedProduct;
  return (
    typeof item?.id === 'string' && typeof item.name === 'string' && typeof item.image === 'string'
  );
};

export const RecentlyViewedStore = signalStore(
  { providedIn: 'root' },
  withState<{ items: readonly ViewedProduct[] }>({ items: [] }),
  withMethods((store) => ({
    /** Newest first; viewing a product again moves it to the front instead of duplicating it. */
    record(product: Product): void {
      const entry: ViewedProduct = {
        id: product.id,
        name: product.name,
        image: product.images[0] ?? '',
      };
      patchState(store, {
        items: [entry, ...store.items().filter((item) => item.id !== product.id)].slice(
          0,
          RECENTLY_VIEWED_LIMIT,
        ),
      });
    },
  })),
  withHooks({
    onInit(store) {
      const storage = inject(BrowserStorage);
      const saved = storage.get<unknown>(RECENTLY_VIEWED_STORAGE_KEY);
      if (Array.isArray(saved)) {
        patchState(store, { items: saved.filter(isViewedProduct).slice(0, RECENTLY_VIEWED_LIMIT) });
      }
      effect(() => storage.set(RECENTLY_VIEWED_STORAGE_KEY, store.items()));
    },
  }),
);
