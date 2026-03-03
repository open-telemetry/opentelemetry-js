/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { BasicTracerProvider, Span } from '@opentelemetry/sdk-trace-base';
import { SessionSpanProcessor } from '../src/SessionSpanProcessor';
import { ROOT_CONTEXT } from '@opentelemetry/api';

describe('SessionSpanProcessor', function () {
  it('adds session.id attribute', function () {
    const expectedAttributes = {
      'session.id': '12345678',
    };

    const tracer = new BasicTracerProvider().getTracer('session-testing');
    const span = tracer.startSpan('test-span');

    const sessionProvider = {
      getSessionId: () => {
        return '12345678';
      },
    };

    const processor = new SessionSpanProcessor(sessionProvider);
    processor.onStart(span as Span, ROOT_CONTEXT);

    assert.deepEqual((span as Span).attributes, expectedAttributes);
  });

  it('does not add session.id attribute when there is no session', function () {
    const tracer = new BasicTracerProvider().getTracer('session-testing');
    const span = tracer.startSpan('test-span');

    const sessionProvider = {
      getSessionId: () => {
        return null;
      },
    };

    const processor = new SessionSpanProcessor(sessionProvider);
    processor.onStart(span as Span, ROOT_CONTEXT);

    assert.deepEqual((span as Span).attributes, {});
  });

  it('does not add session.id attribute when there is no provider', function () {
    const tracer = new BasicTracerProvider().getTracer('session-testing');
    const span = tracer.startSpan('test-span');

    const processor = new SessionSpanProcessor(null as any);
    processor.onStart(span as Span, ROOT_CONTEXT);

    assert.deepEqual((span as Span).attributes, {});
  });

  it('forceFlush is a no-op and does not throw error', async function () {
    const processor = new SessionSpanProcessor({
      getSessionId: () => {
        return null;
      },
    });
    await processor.forceFlush();
  });

  it('onEnd is a no-op and does not throw error', async function () {
    const tracer = new BasicTracerProvider().getTracer('session-testing');
    const span = tracer.startSpan('test-span');

    const processor = new SessionSpanProcessor({
      getSessionId: () => {
        return null;
      },
    });

    assert.doesNotThrow(() => {
      processor.onEnd(span as Span);
    }, 'onEnd threw an error when it should not have');
  });

  it('shutdown is a no-op and does not throw error', async function () {
    const processor = new SessionSpanProcessor({
      getSessionId: () => {
        return null;
      },
    });
    await processor.shutdown();
  });
});
