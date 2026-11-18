import { Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

/**
 * Reads a query param of the current URL as a signal. For layout components that live outside
 * the routed component tree, where withComponentInputBinding() does not apply.
 */
export function injectQueryParam(name: string): Signal<string> {
  const router = inject(Router);
  const read = (): string => router.parseUrl(router.url).queryParamMap.get(name) ?? '';

  return toSignal(
    router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(read),
    ),
    { initialValue: read() },
  );
}
