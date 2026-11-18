import { InjectionToken } from '@angular/core';

export interface LogRecord {
  readonly level: 'error' | 'warn';
  readonly name: string;
  readonly message: string;
  readonly url: string;
  readonly timestamp: string;
  readonly context?: Readonly<Record<string, unknown>>;
}

export type LogSink = (record: LogRecord) => void;

/**
 * Where structured logs go. Console by default; swap the provider for Sentry, Datadog or an
 * internal endpoint without touching any caller.
 */
export const LOG_SINK = new InjectionToken<LogSink>('LOG_SINK', {
  providedIn: 'root',
  factory: () => (record) => console[record.level]('[log]', record),
});
