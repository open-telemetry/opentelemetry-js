/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import type { SpanProcessor } from '../../src';
import { TracerProvider } from '../../src';

describe('TracerProvider attempt-all lifecycle', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('rejects after a synchronous throw without leaving its timeout armed', async () => {
    const clock = sinon.useFakeTimers();
    const error = new Error('trace provider forceFlush failure');
    let firstCalls = 0;
    let secondCalls = 0;
    const first: SpanProcessor = {
      onStart() {},
      onEnd() {},
      shutdown: () => Promise.resolve(),
      forceFlush: () => {
        firstCalls += 1;
        throw error;
      },
    };
    const second: SpanProcessor = {
      onStart() {},
      onEnd() {},
      shutdown: () => Promise.resolve(),
      forceFlush: () => {
        secondCalls += 1;
        return Promise.resolve();
      },
    };
    const provider = new TracerProvider({
      spanProcessors: [first, second],
    });

    await assert.rejects(
      provider.forceFlush({ timeoutMillis: 1000 }),
      candidate =>
        Array.isArray(candidate) &&
        candidate.length === 1 &&
        candidate[0] === error
    );

    assert.strictEqual(firstCalls, 1);
    assert.strictEqual(secondCalls, 1);
    assert.strictEqual(clock.countTimers(), 0);

    await provider.shutdown();
  });

  it('uses the opening processor snapshot during forceFlush', async () => {
    const processors: SpanProcessor[] = [];
    let secondCalls = 0;
    const first: SpanProcessor = {
      onStart() {},
      onEnd() {},
      shutdown: () => Promise.resolve(),
      forceFlush: () => {
        processors.splice(1, 1);
        return Promise.resolve();
      },
    };
    const second: SpanProcessor = {
      onStart() {},
      onEnd() {},
      shutdown: () => Promise.resolve(),
      forceFlush: () => {
        secondCalls += 1;
        return Promise.resolve();
      },
    };
    processors.push(first, second);

    const provider = new TracerProvider({ spanProcessors: processors });
    await provider.forceFlush();

    assert.strictEqual(secondCalls, 1);
    assert.deepStrictEqual(processors, [first]);

    processors.push(second);
    await provider.shutdown();
  });

  it('preserves timeout rejection for a processor that does not settle', async () => {
    const clock = sinon.useFakeTimers();
    const processor: SpanProcessor = {
      onStart() {},
      onEnd() {},
      shutdown: () => Promise.resolve(),
      forceFlush: () => new Promise<void>(() => {}),
    };
    const provider = new TracerProvider({
      spanProcessors: [processor],
    });

    const result = provider.forceFlush({ timeoutMillis: 1000 });
    await clock.tickAsync(1000);

    await assert.rejects(
      result,
      candidate =>
        Array.isArray(candidate) &&
        candidate.length === 1 &&
        candidate[0] instanceof Error
    );
    assert.strictEqual(clock.countTimers(), 0);

    await provider.shutdown();
  });
});
