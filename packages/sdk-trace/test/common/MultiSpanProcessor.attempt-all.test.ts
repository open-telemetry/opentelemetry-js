/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import {
  loggingErrorHandler,
  setGlobalErrorHandler,
} from '@opentelemetry/core';
import type { SpanProcessor } from '../../src';
import { MultiSpanProcessor } from '../../src/MultiSpanProcessor';

describe('MultiSpanProcessor attempt-all lifecycle', () => {
  afterEach(() => {
    setGlobalErrorHandler(loggingErrorHandler());
  });

  it('rejects shutdown after attempting every processor', async () => {
    const error = new Error('trace shutdown failure');
    let firstCalls = 0;
    let secondCalls = 0;
    const first: SpanProcessor = {
      onStart() {},
      onEnd() {},
      forceFlush: () => Promise.resolve(),
      shutdown: () => {
        firstCalls += 1;
        throw error;
      },
    };
    const second: SpanProcessor = {
      onStart() {},
      onEnd() {},
      forceFlush: () => Promise.resolve(),
      shutdown: () => {
        secondCalls += 1;
        return Promise.resolve();
      },
    };
    const processor = new MultiSpanProcessor([first, second]);

    await assert.rejects(
      processor.shutdown(),
      candidate => candidate === error
    );
    assert.strictEqual(firstCalls, 1);
    assert.strictEqual(secondCalls, 1);
  });

  it('uses the opening processor snapshot during shutdown', async () => {
    const processors: SpanProcessor[] = [];
    let secondCalls = 0;
    const first: SpanProcessor = {
      onStart() {},
      onEnd() {},
      forceFlush: () => Promise.resolve(),
      shutdown: () => {
        processors.splice(1, 1);
        return Promise.resolve();
      },
    };
    const second: SpanProcessor = {
      onStart() {},
      onEnd() {},
      forceFlush: () => Promise.resolve(),
      shutdown: () => {
        secondCalls += 1;
        return Promise.resolve();
      },
    };
    processors.push(first, second);

    await new MultiSpanProcessor(processors).shutdown();

    assert.strictEqual(secondCalls, 1);
    assert.deepStrictEqual(processors, [first]);
  });

  it('reports forceFlush failure after attempting every processor', async () => {
    const error = new Error('trace forceFlush failure');
    let firstCalls = 0;
    let secondCalls = 0;
    let handledError: unknown;
    setGlobalErrorHandler(candidate => {
      handledError = candidate;
    });
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
    const processor = new MultiSpanProcessor([first, second]);

    await processor.forceFlush();
    assert.strictEqual(firstCalls, 1);
    assert.strictEqual(secondCalls, 1);
    assert.strictEqual(handledError, error);
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

    await new MultiSpanProcessor(processors).forceFlush();

    assert.strictEqual(secondCalls, 1);
    assert.deepStrictEqual(processors, [first]);
  });
});
