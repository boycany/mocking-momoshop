import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LOG_SINK } from '../../shared/observability/log-sink';
import { GlobalErrorHandler } from './global-error-handler';

describe('GlobalErrorHandler', () => {
  function setup(sink = vi.fn()) {
    TestBed.configureTestingModule({
      providers: [
        { provide: ErrorHandler, useClass: GlobalErrorHandler },
        { provide: LOG_SINK, useValue: sink },
      ],
    });
    return { handler: TestBed.inject(ErrorHandler), sink };
  }

  it('reports a structured record', () => {
    const { handler, sink } = setup();
    handler.handleError(new TypeError('boom'));
    expect(sink).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'error',
        name: 'TypeError',
        message: 'boom',
        url: expect.any(String),
      }),
    );
  });

  it('normalizes non-Error values', () => {
    const { handler, sink } = setup();
    handler.handleError('plain string');
    expect(sink).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Error', message: 'plain string' }),
    );
  });

  it('survives a failing sink', () => {
    const { handler } = setup(
      vi.fn(() => {
        throw new Error('sink down');
      }),
    );
    expect(() => handler.handleError(new Error('boom'))).not.toThrow();
  });
});
