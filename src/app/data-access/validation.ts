import { Product } from './models';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;
const isPositiveNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

/**
 * Lists what is wrong with a product payload; an empty list means it is safe to render.
 * Used on mock fixtures today and meant for HTTP responses once a real backend exists.
 */
export function productProblems(value: unknown): string[] {
  if (typeof value !== 'object' || value === null) {
    return ['not an object'];
  }
  const product = value as Partial<Record<keyof Product, unknown>>;
  const problems: string[] = [];

  if (!isNonEmptyString(product.id)) problems.push('missing id');
  if (!isNonEmptyString(product.name)) problems.push('missing name');
  if (!isNonEmptyString(product.categoryId)) problems.push('missing categoryId');
  if (!isPositiveNumber(product.price)) problems.push('price must be a positive number');
  if (
    product.originalPrice !== null &&
    !(
      isPositiveNumber(product.originalPrice) &&
      isPositiveNumber(product.price) &&
      product.originalPrice > product.price
    )
  ) {
    problems.push('originalPrice must be null or greater than price');
  }
  if (!Array.isArray(product.images) || product.images.length === 0)
    problems.push('missing images');
  if (!Array.isArray(product.tags)) problems.push('tags must be an array');
  if (!Array.isArray(product.specs)) problems.push('specs must be an array');

  return problems;
}
