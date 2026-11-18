import { ViewportScroller } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartStore } from '../../../data-access/stores/cart.store';
import { RecentlyViewedStore } from '../../../data-access/stores/recently-viewed.store';

/** Site-wide floating column on the right: recently viewed, cart shortcut and back-to-top. */
@Component({
  selector: 'app-floating-sidebar',
  imports: [RouterLink],
  templateUrl: './floating-sidebar.html',
  styleUrl: './floating-sidebar.scss',
})
export class FloatingSidebar {
  private readonly scroller = inject(ViewportScroller);

  protected readonly cart = inject(CartStore);
  protected readonly recentlyViewed = inject(RecentlyViewedStore);

  protected scrollToTop(): void {
    this.scroller.scrollToPosition([0, 0], { behavior: 'smooth' });
  }
}
