import { ViewportScroller } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Product } from '../../../data-access/models';
import { CartStore } from '../../../data-access/stores/cart.store';
import { RecentlyViewedStore } from '../../../data-access/stores/recently-viewed.store';
import { FloatingSidebar } from './floating-sidebar';

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

describe('FloatingSidebar', () => {
  beforeEach(() => localStorage.clear());

  function render() {
    TestBed.configureTestingModule({ imports: [FloatingSidebar], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(FloatingSidebar);
    fixture.detectChanges();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  it('hides the history block until something has been viewed', () => {
    const { element } = render();
    expect(element.textContent).not.toContain('瀏覽紀錄');
  });

  it('links recently viewed products and shows the cart count', async () => {
    const { fixture, element } = render();
    TestBed.inject(RecentlyViewedStore).record(product('a'));
    TestBed.inject(CartStore).add(product('b'), {}, 3);
    await fixture.whenStable();

    expect(element.querySelector('.viewed a')?.getAttribute('href')).toBe('/goods/a');
    const cartLink = element.querySelector('a.cart');
    expect(cartLink?.getAttribute('href')).toBe('/cart');
    expect(cartLink?.textContent).toContain('(3)');
  });

  it('scrolls back to the top', () => {
    const { element } = render();
    const scroll = vi
      .spyOn(TestBed.inject(ViewportScroller), 'scrollToPosition')
      .mockImplementation(() => undefined);
    element.querySelector<HTMLButtonElement>('button.top')?.click();
    expect(scroll).toHaveBeenCalledWith([0, 0], { behavior: 'smooth' });
  });
});
