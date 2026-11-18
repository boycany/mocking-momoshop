import { AppLink } from './link.model';

export interface Banner {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly image: string;
  readonly link: AppLink;
}

export interface PromoTile {
  readonly id: string;
  readonly title: string;
  readonly caption: string;
  readonly image: string;
  readonly link: AppLink;
}

export interface HeroCarouselSection {
  readonly type: 'hero-carousel';
  readonly id: string;
  readonly banners: readonly Banner[];
  /** The "today's brands" grid rendered next to the carousel on the real site. */
  readonly todayBrand: {
    readonly title: string;
    readonly tiles: readonly PromoTile[];
  };
}

export interface QuickEntrySection {
  readonly type: 'quick-entry';
  readonly id: string;
  readonly items: readonly PromoTile[];
}

export interface PromoBannerSection {
  readonly type: 'promo-banner';
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly image: string;
  readonly link: AppLink;
}

export interface ProductRailSection {
  readonly type: 'product-rail';
  readonly id: string;
  readonly title: string;
  readonly productIds: readonly string[];
  readonly moreLink?: AppLink;
}

/** Infinite-scroll product wall at the bottom of the home page. */
export interface ProductFeedSection {
  readonly type: 'product-feed';
  readonly id: string;
  readonly title: string;
  readonly pageSize: number;
  /** Batches loaded automatically on scroll before the "看更多" button takes over again. */
  readonly autoLoadPerRound: number;
}

/** Discriminated union describing the CMS-like home page layout. See ADR 0004. */
export type HomeSection =
  | HeroCarouselSection
  | QuickEntrySection
  | PromoBannerSection
  | ProductRailSection
  | ProductFeedSection;

export type HomeSectionType = HomeSection['type'];
