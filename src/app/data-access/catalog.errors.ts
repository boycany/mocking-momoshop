export class ProductNotFoundError extends Error {
  constructor(readonly productId: string) {
    super(`Product not found: ${productId}`);
    this.name = 'ProductNotFoundError';
  }
}

/** Simulated transport failure raised by the mock API. */
export class CatalogNetworkError extends Error {
  constructor(message = 'Catalog request failed') {
    super(message);
    this.name = 'CatalogNetworkError';
  }
}
