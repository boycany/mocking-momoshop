import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { CatalogApi } from './catalog.api';
import { CatalogNetworkError, ProductNotFoundError } from './catalog.errors';
import { fixtures } from '../../mocks/fixtures';
import { LOG_SINK } from '../shared/observability/log-sink';
import { MOCK_CATALOG_CONFIG, MOCK_FIXTURES_LOADER, MockCatalogApi } from './mock-catalog.api';

describe('MockCatalogApi', () => {
  let shouldFail = false;
  let sink: ReturnType<typeof vi.fn>;
  let api: CatalogApi;

  beforeEach(() => {
    shouldFail = false;
    sink = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        { provide: CatalogApi, useClass: MockCatalogApi },
        {
          provide: MOCK_CATALOG_CONFIG,
          useValue: { latencyMs: [0, 0], shouldFail: () => shouldFail },
        },
        { provide: LOG_SINK, useValue: sink },
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

  it('pages recommendations by offset and reports the total', async () => {
    const first = await firstValueFrom(api.getRecommendations({ offset: 0, limit: 10 }));
    const last = await firstValueFrom(api.getRecommendations({ offset: 55, limit: 10 }));

    expect(first.items).toHaveLength(10);
    expect(first.total).toBe(60);
    expect(last.items).toHaveLength(5);
    expect(new Set([...first.items, ...last.items].map((product) => product.id)).size).toBe(15);
  });

  it('reports failed requests to the log sink with the operation name', async () => {
    shouldFail = true;
    await expect(firstValueFrom(api.getCategories())).rejects.toBeInstanceOf(CatalogNetworkError);
    expect(sink).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'warn',
        name: 'CatalogRequestFailed',
        context: { operation: 'getCategories', error: 'CatalogNetworkError' },
      }),
    );
  });

  it('does not report "not found", which is an expected outcome', async () => {
    await expect(firstValueFrom(api.getProduct('missing'))).rejects.toBeInstanceOf(
      ProductNotFoundError,
    );
    expect(sink).not.toHaveBeenCalled();
  });

  it('fails with CatalogNetworkError when failure is simulated', async () => {
    shouldFail = true;
    await expect(firstValueFrom(api.getCategories())).rejects.toBeInstanceOf(CatalogNetworkError);
  });

  describe('with a malformed product in the data', () => {
    it('drops it from every list and reports it, keeping the rest usable', async () => {
      const sink = vi.fn();
      const broken = { ...fixtures.products[0], price: -1 };
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: CatalogApi, useClass: MockCatalogApi },
          {
            provide: MOCK_CATALOG_CONFIG,
            useValue: { latencyMs: [0, 0], shouldFail: () => false },
          },
          { provide: LOG_SINK, useValue: sink },
          {
            provide: MOCK_FIXTURES_LOADER,
            useValue: () =>
              Promise.resolve({
                ...fixtures,
                products: [broken, ...fixtures.products.slice(1)],
                recommendations: [
                  broken,
                  ...fixtures.recommendations.filter((p) => p.id !== broken.id),
                ],
              }),
          },
        ],
      });
      const brokenApi = TestBed.inject(CatalogApi);

      await expect(firstValueFrom(brokenApi.getProduct(broken.id))).rejects.toBeInstanceOf(
        ProductNotFoundError,
      );
      const feed = await firstValueFrom(brokenApi.getRecommendations({ offset: 0, limit: 100 }));
      expect(feed.items.some((product) => product.id === broken.id)).toBe(false);
      expect(feed.total).toBe(fixtures.products.length - 1);
      expect(sink).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'warn',
          name: 'InvalidCatalogRecord',
          context: { problems: expect.any(Array) },
        }),
      );
    });
  });
});
