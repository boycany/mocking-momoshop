import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { CatalogApi } from './data-access/catalog.api';
import { MockCatalogApi } from './data-access/mock-catalog.api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    // Swap for an HTTP implementation when a real backend exists. See ADR 0003.
    { provide: CatalogApi, useClass: MockCatalogApi },
  ],
};
