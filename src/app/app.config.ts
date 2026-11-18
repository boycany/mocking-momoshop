import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { GlobalErrorHandler } from './core/observability/global-error-handler';
import { CatalogApi } from './data-access/catalog.api';
import { MockCatalogApi } from './data-access/mock-catalog.api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideRouter(
      routes,
      withComponentInputBinding(),
      // New pages start at the top; back/forward restores the previous position.
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
    ),
    // Swap for an HTTP implementation when a real backend exists. See ADR 0003.
    { provide: CatalogApi, useClass: MockCatalogApi },
  ],
};
