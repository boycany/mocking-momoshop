import { Component, effect, input, isDevMode } from '@angular/core';
import { HomeSection, HomeSectionType } from '../../data-access/models';
import { HeroCarousel } from './sections/hero-carousel';
import { ProductFeed } from './sections/product-feed';
import { ProductRail } from './sections/product-rail';
import { PromoBanner } from './sections/promo-banner';
import { QuickEntry } from './sections/quick-entry';

const KNOWN_TYPES: ReadonlySet<HomeSectionType> = new Set([
  'hero-carousel',
  'quick-entry',
  'promo-banner',
  'product-rail',
  'product-feed',
]);

/**
 * Maps a CMS section to its component. Unknown types are skipped so a new section type from the
 * CMS cannot break the page; in development they are reported loudly instead. See ADR 0004.
 */
@Component({
  selector: 'app-home-section-host',
  imports: [HeroCarousel, QuickEntry, PromoBanner, ProductRail, ProductFeed],
  template: `
    @let data = section();
    @switch (data.type) {
      @case ('hero-carousel') {
        <app-hero-carousel class="page-container" [section]="data" />
      }
      @case ('quick-entry') {
        <app-quick-entry [section]="data" />
      }
      @case ('promo-banner') {
        <app-promo-banner [section]="data" />
      }
      @case ('product-rail') {
        <app-product-rail [section]="data" />
      }
      @case ('product-feed') {
        <app-product-feed [section]="data" />
      }
    }
  `,
  styles: `
    :host,
    app-hero-carousel {
      display: block;
    }
  `,
})
export class HomeSectionHost {
  readonly section = input.required<HomeSection>();

  constructor() {
    effect(() => {
      const { type } = this.section();
      if (isDevMode() && !KNOWN_TYPES.has(type)) {
        console.error(`[home] Unknown section type "${type}" was skipped.`);
      }
    });
  }
}
