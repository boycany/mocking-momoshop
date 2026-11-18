import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuickEntrySection } from '../../../data-access/models';

@Component({
  selector: 'app-quick-entry',
  imports: [RouterLink],
  template: `
    <section class="quick-entry">
      <ul class="page-container">
        @for (item of section().items; track item.id) {
          <li>
            <a [routerLink]="item.link.commands" [queryParams]="item.link.queryParams">
              <img [src]="item.image" alt="" width="88" height="88" />
              <span class="title">{{ item.title }}</span>
              <strong>{{ item.caption }}</strong>
            </a>
          </li>
        }
      </ul>
    </section>
  `,
  styles: `
    .quick-entry {
      padding: 16px 0;
      background: #fff6cc;
    }
    ul {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      margin-block: 0;
      padding: 0;
      list-style: none;
    }
    a {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    img {
      border-radius: 50%;
    }
    .title {
      padding: 2px 14px;
      border-radius: 16px;
      background: #fff;
      font-size: 20px;
    }
    strong {
      font-size: 20px;
      font-weight: 500;
    }
  `,
})
export class QuickEntry {
  readonly section = input.required<QuickEntrySection>();
}
