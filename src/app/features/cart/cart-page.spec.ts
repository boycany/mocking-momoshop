import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideRouter } from '@angular/router';
import { Product } from '../../data-access/models';
import { CartStore } from '../../data-access/stores/cart.store';
import { CartPage } from './cart-page';

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

describe('CartPage', () => {
  beforeEach(() => localStorage.clear());

  async function render(setup?: (cart: InstanceType<typeof CartStore>) => void) {
    TestBed.configureTestingModule({
      imports: [CartPage],
      providers: [provideRouter([]), { provide: MatSnackBar, useValue: { open: vi.fn() } }],
    });
    const cart = TestBed.inject(CartStore);
    setup?.(cart);
    const fixture = TestBed.createComponent(CartPage);
    await fixture.whenStable();
    return { fixture, cart, element: fixture.nativeElement as HTMLElement };
  }

  it('shows an empty state', async () => {
    const { element } = await render();
    expect(element.textContent).toContain('購物車是空的');
  });

  it('lists items with specs and the total', async () => {
    const { element } = await render((cart) => {
      cart.add(product('a', 1000), { 顏色: '黑色' }, 2);
      cart.add(product('b', 500), {}, 1);
    });
    expect(element.querySelectorAll('tbody tr')).toHaveLength(2);
    expect(element.querySelector('.spec')?.textContent).toBe('顏色：黑色');
    expect(element.querySelector('.summary strong')?.textContent).toBe('$2,500');
  });

  it('updates quantity and removes items', async () => {
    const { fixture, cart, element } = await render((store) =>
      store.add(product('a', 1000), {}, 1),
    );

    const select = element.querySelector('select') as HTMLSelectElement;
    select.value = '4';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(cart.subtotal()).toBe(4000);

    element.querySelector<HTMLButtonElement>('button.remove')?.click();
    await fixture.whenStable();
    expect(cart.items()).toHaveLength(0);
    expect(element.textContent).toContain('購物車是空的');
  });
});
