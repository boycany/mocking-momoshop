import { Component, ElementRef, afterNextRender, input, signal, viewChild } from '@angular/core';

/**
 * Horizontal scroller with prev/next arrows. Items are projected content; each arrow press
 * scrolls by one visible width. Uses native scrolling, so it stays accessible and touch-friendly.
 */
@Component({
  selector: 'app-carousel',
  template: `
    <div class="carousel">
      <button
        type="button"
        class="arrow prev"
        aria-label="上一頁"
        [disabled]="!canScrollPrev()"
        (click)="scrollPage(-1)"
      >
        ‹
      </button>
      <div #track class="track" [style.gap.px]="gap()" (scroll)="updateArrows()">
        <ng-content />
      </div>
      <button
        type="button"
        class="arrow next"
        aria-label="下一頁"
        [disabled]="!canScrollNext()"
        (click)="scrollPage(1)"
      >
        ›
      </button>
    </div>
  `,
  styleUrl: './carousel.scss',
})
export class Carousel {
  readonly gap = input(16);

  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  protected readonly canScrollPrev = signal(false);
  protected readonly canScrollNext = signal(false);

  constructor() {
    afterNextRender(() => this.updateArrows());
  }

  protected scrollPage(direction: 1 | -1): void {
    const track = this.track().nativeElement;
    track.scrollBy({ left: direction * track.clientWidth, behavior: 'smooth' });
  }

  protected updateArrows(): void {
    const { scrollLeft, scrollWidth, clientWidth } = this.track().nativeElement;
    this.canScrollPrev.set(scrollLeft > 0);
    this.canScrollNext.set(scrollLeft + clientWidth < scrollWidth - 1);
  }
}
