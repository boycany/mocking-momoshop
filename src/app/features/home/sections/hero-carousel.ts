import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroCarouselSection } from '../../../data-access/models';
import { Carousel } from '../../../shared/ui/carousel/carousel';

@Component({
  selector: 'app-hero-carousel',
  imports: [RouterLink, Carousel],
  template: `
    @let data = section();
    <section class="hero">
      <app-carousel class="banners" [gap]="12">
        @for (banner of data.banners; track banner.id) {
          <a
            class="banner"
            [routerLink]="banner.link.commands"
            [queryParams]="banner.link.queryParams"
          >
            <img
              [src]="banner.image"
              [alt]="banner.title + ' ' + banner.subtitle"
              width="278"
              height="362"
            />
          </a>
        }
      </app-carousel>

      <aside class="today-brand">
        <h2>{{ data.todayBrand.title }}</h2>
        <ul>
          @for (tile of data.todayBrand.tiles; track tile.id) {
            <li>
              <a [routerLink]="tile.link.commands" [queryParams]="tile.link.queryParams">
                <img [src]="tile.image" alt="" width="96" height="96" />
                <strong>{{ tile.title }}</strong>
                <span>{{ tile.caption }}</span>
              </a>
            </li>
          }
        </ul>
      </aside>
    </section>
  `,
  styles: `
    .hero {
      display: flex;
      gap: 12px;
      padding: 20px 0;
    }
    .banners {
      width: 858px;
    }
    .banner img {
      display: block;
      border-radius: 6px;
    }
    .today-brand {
      flex: 1;
      border: 4px solid var(--momo-primary);
      background: var(--momo-primary);
    }
    h2 {
      margin: 0;
      padding: 4px 0;
      color: #fff;
      font-size: 22px;
      text-align: center;
    }
    ul {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    li a {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 0;
      background: #fff;
      font-size: 18px;
    }
  `,
})
export class HeroCarousel {
  readonly section = input.required<HeroCarouselSection>();
}
