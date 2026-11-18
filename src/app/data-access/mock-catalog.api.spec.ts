import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { CatalogApi } from './catalog.api';
import { CatalogNetworkError, ProductNotFoundError } from './catalog.errors';
import { MOCK_CATALOG_CONFIG, MockCatalogApi } from './mock-catalog.api';

describe('MockCatalogApi', () => {
  let shouldFail = false;
  let api: CatalogApi;

  beforeEach(() => {
    shouldFail = false;
    TestBed.configureTestingModule({
      providers: [
        { provide: CatalogApi, useClass: MockCatalogApi },
        {
          provide: MOCK_CATALOG_CONFIG,
          useValue: { latencyMs: [0, 0], shouldFail: () => shouldFail },
        },
      ],
    });
    api = TestBed.inject(CatalogApi);
  });

  it('returns a product by id', async () => {
    const product = await firstValueFrom(api.getProduct('appliance-001'));
    expect(product.id).toBe('appliance-001');
    expect(product.categoryId).toBe('appliance');
  });

  it('errors with ProductNotFoundError for an unknown id', async () => {
    await expect(firstValueFrom(api.getProduct('missing'))).rejects.toBeInstanceOf(
      ProductNotFoundError,
    );
  });

  it('returns products in the requested order and skips unknown ids', async () => {
    const products = await firstValueFrom(
      api.getProductsByIds(['beauty-002', 'missing', 'appliance-001']),
    );
    expect(products.map((product) => product.id)).toEqual(['beauty-002', 'appliance-001']);
  });

  it('searches the generated catalog', async () => {
    const result = await firstValueFrom(
      api.searchProducts({
        keyword: '',
        categoryId: 'phone',
        sort: 'price-asc',
        page: 1,
        pageSize: 20,
      }),
    );
    expect(result.total).toBe(5);
    expect(result.items.every((product) => product.categoryId === 'phone')).toBe(true);
  });

  it('returns the home layout and categories', async () => {
    const [layout, categories] = await Promise.all([
      firstValueFrom(api.getHomeLayout()),
      firstValueFrom(api.getCategories()),
    ]);
    expect(layout[0].type).toBe('hero-carousel');
    expect(categories.length).toBeGreaterThan(0);
  });

  it('fails with CatalogNetworkError when failure is simulated', async () => {
    shouldFail = true;
    await expect(firstValueFrom(api.getCategories())).rejects.toBeInstanceOf(CatalogNetworkError);
  });
});
