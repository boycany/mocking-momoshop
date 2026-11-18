import { Injectable, InjectionToken, inject } from '@angular/core';

/** Typed analytics events; `list` names where the product was shown (e.g. a rail title or "search"). */
export type TrackingEvent =
  | {
      readonly type: 'product_impression';
      readonly productId: string;
      readonly list: string;
      readonly position: number;
    }
  | {
      readonly type: 'product_click';
      readonly productId: string;
      readonly list: string;
      readonly position: number;
    }
  | {
      readonly type: 'add_to_cart';
      readonly productId: string;
      readonly quantity: number;
      readonly price: number;
    };

export type TrackingSink = (event: TrackingEvent & { readonly timestamp: string }) => void;

/** Console in development; swap for GA4 or an internal collector without touching callers. */
export const TRACKING_SINK = new InjectionToken<TrackingSink>('TRACKING_SINK', {
  providedIn: 'root',
  factory: () => (event) => console.debug('[track]', event),
});

@Injectable({ providedIn: 'root' })
export class TrackingService {
  private readonly sink = inject(TRACKING_SINK);

  track(event: TrackingEvent): void {
    try {
      this.sink({ ...event, timestamp: new Date().toISOString() });
    } catch {
      // Analytics must never break the user flow.
    }
  }
}
