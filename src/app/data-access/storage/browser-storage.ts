import { DOCUMENT, Injectable, inject } from '@angular/core';

/**
 * JSON wrapper around localStorage. Safe on the server (no window) and when storage is blocked
 * or full: reads fall back to null and writes are dropped instead of throwing.
 */
@Injectable({ providedIn: 'root' })
export class BrowserStorage {
  private readonly storage: Storage | null = this.resolveStorage();

  get<T>(key: string): T | null {
    try {
      const raw = this.storage?.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  set(key: string, value: unknown): void {
    try {
      this.storage?.setItem(key, JSON.stringify(value));
    } catch {
      // Quota exceeded or storage disabled: persistence is best-effort.
    }
  }

  private resolveStorage(): Storage | null {
    try {
      return inject(DOCUMENT).defaultView?.localStorage ?? null;
    } catch {
      return null;
    }
  }
}
