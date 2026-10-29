/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import type { Context } from '@opentelemetry/api';
import {
  loggingErrorHandler,
  setGlobalErrorHandler,
} from '@opentelemetry/core';
import type { ReadableSpan, Span, SpanProcessor } from '../../src';
import { MultiSpanProcessor } from '../../src/MultiSpanProcessor';

function deferred(): { promise: Promise<void>; resolve: () => void } {
  let resolve!: () => void;
  const promise = new Promise<void>(res => {
    resolve = res;
  });
  return { promise, resolve };
}

class ConfigurableProcessor implements SpanProcessor {
  private readonly _shutdown: () => Promise<void>;
  private readonly _forceFlush: () => Promise<void>;

  constructor(
    shutdown: () => Promise<void> = () => Promise.resolve(),
    forceFlush: () => Promise<void> = () => Promise.resolve()
  ) {
    this._shutdown = shutdown;
    this._forceFlush = forceFlush;
  }

  onStart(_span: Span, _parentContext: Context): void {}

  onEnd(_span: ReadableSpan): void {}

  forceFlush(): Promise<void> {
    return this._forceFlush();
  }

  shutdown(): Promise<void> {
    return this._shutdown();
  }
}

/** Lets every already-queued microtask and timer callback run. */
function tick(): Promise<void> {
  return new Promise(resolve => setImmediate(resolve));
}

describe('MultiSpanProcessor settlement', () => {
  afterEach(() => {
    setGlobalErrorHandler(loggingErrorHandler());
  });

  describe('shutdown()', () => {
    it('waits for every processor to settle before rejecting', async () => {
      const failure = new Error('export failed');
      const slow = deferred();
      let slowFinished = false;

      const multi = new MultiSpanProcessor([
        new ConfigurableProcessor(() => Promise.reject(failure)),
        new ConfigurableProcessor(() =>
          slow.promise.then(() => {
            slowFinished = true;
          })
        ),
      ]);

      let settled = false;
      const shutdown = multi.shutdown().then(
        () => {
          settled = true;
        },
        () => {
          settled = true;
        }
      );

      await tick();

      assert.strictEqual(
        settled,
        false,
        'shutdown() settled while a processor was still shutting down'
      );
      assert.strictEqual(slowFinished, false);

      slow.resolve();
      await shutdown;

      assert.strictEqual(slowFinished, true);
      assert.strictEqual(settled, true);
    });

    it('rejects with the first failure in processor order', async () => {
      const first = new Error('first');
      const second = new Error('second');

      const multi = new MultiSpanProcessor([
        new ConfigurableProcessor(
          () =>
            new Promise<void>((_resolve, reject) => {
              setTimeout(() => reject(first), 10);
            })
        ),
        // Rejects before the first processor does.
        new ConfigurableProcessor(() => Promise.reject(second)),
      ]);

      await assert.rejects(multi.shutdown(), (error: Error) => error === first);
    });

    it('resolves once every processor has shut down', async () => {
      const shutDown: string[] = [];

      const multi = new MultiSpanProcessor([
        new ConfigurableProcessor(() => {
          shutDown.push('p1');
          return Promise.resolve();
        }),
        new ConfigurableProcessor(() => {
          shutDown.push('p2');
          return Promise.resolve();
        }),
      ]);

      await multi.shutdown();

      assert.deepStrictEqual(shutDown, ['p1', 'p2']);
    });
  });

  describe('forceFlush()', () => {
    it('waits for every processor to settle before reporting a failure', async () => {
      const failure = new Error('export failed');
      const slow = deferred();
      const reported: Error[] = [];
      let slowFinished = false;

      setGlobalErrorHandler(error => reported.push(error as Error));

      const multi = new MultiSpanProcessor([
        new ConfigurableProcessor(undefined, () => Promise.reject(failure)),
        new ConfigurableProcessor(undefined, () =>
          slow.promise.then(() => {
            slowFinished = true;
          })
        ),
      ]);

      let settled = false;
      const flush = multi.forceFlush().then(() => {
        settled = true;
      });

      await tick();

      assert.strictEqual(
        settled,
        false,
        'forceFlush() settled while a processor was still flushing'
      );

      slow.resolve();
      await flush;

      assert.strictEqual(slowFinished, true);
      assert.deepStrictEqual(reported, [failure]);
    });

    it('resolves when a processor rejects', async () => {
      setGlobalErrorHandler(() => {});

      const multi = new MultiSpanProcessor([
        new ConfigurableProcessor(undefined, () =>
          Promise.reject(new Error('whoops'))
        ),
      ]);

      await multi.forceFlush();
    });

    it('does not report an error when every processor succeeds', async () => {
      const reported: Error[] = [];
      setGlobalErrorHandler(error => reported.push(error as Error));

      const multi = new MultiSpanProcessor([
        new ConfigurableProcessor(),
        new ConfigurableProcessor(),
      ]);

      await multi.forceFlush();

      assert.deepStrictEqual(reported, []);
    });
  });
});
