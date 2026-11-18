import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CatalogApi } from '../../data-access/catalog.api';
import { ProductNotFoundError } from '../../data-access/catalog.errors';
import { Product } from '../../data-access/models';
import { CartStore } from '../../data-access/stores/cart.store';
import { RecentlyViewedStore } from '../../data-access/stores/recently-viewed.store';
import { TRACKING_SINK } from '../../shared/observability/tracking';
import { GoodsPage } from './goods-page';

const product: Product = {
  id: 'phone-001',
  name: '【Apple】智慧型手機',
  brand: 'Apple',
  promoText: '滿1件享95折',
  categoryId: 'phone',
  price: 48900,
  originalPrice: 49900,
  images: ['a', 'b', 'c'],
  tags: [],
  specs: [
    {
      name: '顏色',
      options: [
        { id: 'c0', label: '黑色' },
        { id: 'c1', label: '白色' },
      ],
    },
    { name: '容量', options: [{ id: 's0', label: '256GB' }] },
  ],
  rating: 4.8,
  reviewCount: 474,
  soldCount: 8000,
  description: '描述',
  createdAt: '2026-11-01',
};

describe('GoodsPage', () => {
  beforeEach(() => localStorage.clear());

  async function render(getProduct: CatalogApi['getProduct']) {
    const snackBar = { open: vi.fn() };
    const trackingSink = vi.fn();
    TestBed.configureTestingModule({
      imports: [GoodsPage],
      providers: [
        provideRouter([]),
        {
          provide: CatalogApi,
          useValue: { getProduct, getCategories: () => of([{ id: 'phone', name: '手機/相機' }]) },
        },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: TRACKING_SINK, useValue: trackingSink },
      ],
    });
    const fixture = TestBed.createComponent(GoodsPage);
    fixture.componentRef.setInput('id', 'phone-001');
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    const button = (label: string) =>
      Array.from(element.querySelectorAll('button')).find(
        (candidate) => candidate.textContent?.trim() === label,
      );
    return { fixture, element, button, snackBar, trackingSink };
  }

  it('shows the product with its category breadcrumb', async () => {
    const { element } = await render(() => of(product));
    expect(element.querySelector('h1')?.textContent).toBe('【Apple】智慧型手機');
    expect(element.querySelector('.breadcrumb')?.textContent).toContain('手機/相機');
  });

  it('enables add-to-cart only after every spec group is selected', async () => {
    const { fixture, button } = await render(() => of(product));
    expect(button('加入購物車')?.disabled).toBe(true);

    button('黑色')?.click();
    await fixture.whenStable();
    expect(button('加入購物車')?.disabled).toBe(true);

    button('256GB')?.click();
    await fixture.whenStable();
    expect(button('加入購物車')?.disabled).toBe(false);
  });

  it('adds the selected specs and quantity to the cart and confirms', async () => {
    const { fixture, element, button, snackBar, trackingSink } = await render(() => of(product));
    button('白色')?.click();
    button('256GB')?.click();
    const select = element.querySelector('select') as HTMLSelectElement;
    select.value = '3';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    button('加入購物車')?.click();

    const cart = TestBed.inject(CartStore);
    expect(cart.totalQuantity()).toBe(3);
    expect(cart.items()[0].specs).toEqual({ 顏色: '白色', 容量: '256GB' });
    expect(snackBar.open).toHaveBeenCalledWith('已加入購物車', undefined, { duration: 2500 });
    expect(trackingSink).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'add_to_cart',
        productId: 'phone-001',
        quantity: 3,
        price: 48900,
      }),
    );
  });

  it('records successfully loaded products in the viewing history', async () => {
    await render(() => of(product));
    expect(
      TestBed.inject(RecentlyViewedStore)
        .items()
        .map((item) => item.id),
    ).toEqual(['phone-001']);
  });

  it('shows a not-found message for unknown products', async () => {
    const { element } = await render(() => throwError(() => new ProductNotFoundError('phone-001')));
    expect(element.textContent).toContain('商品已下架或不存在');
    expect(TestBed.inject(RecentlyViewedStore).items()).toEqual([]);
  });

  it('offers a retry for other errors', async () => {
    const { element } = await render(() => throwError(() => new Error('network')));
    expect(element.querySelector('app-load-error')).not.toBeNull();
  });
});
