export type ProductTagType = 'coupon' | 'mo-coin' | 'fast-delivery' | 'free-shipping' | 'limited';

export interface ProductTag {
  readonly type: ProductTagType;
  readonly label: string;
}

export interface SpecOption {
  readonly id: string;
  readonly label: string;
}

export interface SpecGroup {
  readonly name: string;
  readonly options: readonly SpecOption[];
}

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly brand: string;
  /** Short red campaign line shown above the name on product cards, e.g. "滿1000折200". */
  readonly promoText: string | null;
  readonly categoryId: string;
  /** Selling price in TWD. */
  readonly price: number;
  /** List price in TWD, or null when the product is not discounted. */
  readonly originalPrice: number | null;
  readonly images: readonly string[];
  readonly tags: readonly ProductTag[];
  readonly specs: readonly SpecGroup[];
  readonly rating: number;
  readonly reviewCount: number;
  readonly soldCount: number;
  readonly description: string;
  /** ISO 8601 date, used for "newest" sorting. */
  readonly createdAt: string;
}
