import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  inject,
  input,
  output,
} from '@angular/core';

/**
 * Emits `true` when the host enters the viewport and `false` when it leaves.
 * The observer is created after render, so nothing touches browser APIs during SSR.
 */
@Directive({ selector: '[appInViewport]' })
export class InViewport {
  /** Starts loading slightly before the element is actually visible. */
  readonly rootMargin = input('200px 0px');
  readonly appInViewport = output<boolean>();

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      // Unsupported environments (old browsers, jsdom) simply never report visibility.
      if (typeof IntersectionObserver === 'undefined') {
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => this.appInViewport.emit(entries.some((entry) => entry.isIntersecting)),
        { rootMargin: this.rootMargin() },
      );
      observer.observe(element);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
