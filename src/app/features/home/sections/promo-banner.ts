import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PromoBannerSection } from '../../../data-access/models';

@Component({
  selector: 'app-promo-banner',
  imports: [RouterLink],
  template: `
    @let data = section();
    <a
      class="page-container promo"
      [routerLink]="data.link.commands"
      [queryParams]="data.link.queryParams"
    >
      <img [src]="data.image" [alt]="data.title + ' ' + data.subtitle" width="1200" height="240" />
    </a>
  `,
  styles: `
    .promo {
      display: block;
      padding: 20px 0;
    }
    img {
      display: block;
      width: 100%;
      height: auto;
      border-radius: 8px;
    }
  `,
})
export class PromoBanner {
  readonly section = input.required<PromoBannerSection>();
}
