import { DOCUMENT, ErrorHandler, Injectable, inject } from '@angular/core';
import { LOG_SINK } from '../../shared/observability/log-sink';

/**
 * Single funnel for uncaught errors. With provideBrowserGlobalErrorListeners(), window errors and
 * unhandled promise rejections arrive here too.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly sink = inject(LOG_SINK);
  private readonly document = inject(DOCUMENT);

  handleError(error: unknown): void {
    const normalized = error instanceof Error ? error : new Error(String(error));
    try {
      this.sink({
        level: 'error',
        name: normalized.name,
        message: normalized.message,
        url: this.document.location?.href ?? '',
        timestamp: new Date().toISOString(),
        context: { stack: normalized.stack },
      });
    } catch {
      // A failing sink must never take the app down with it.
    }
  }
}
