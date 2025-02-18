/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import * as oc from '@opencensus/core';
import * as assert from 'assert';
import { withTestTracer, setupNodeContextManager } from './util';
import { ShimSpan } from '../src/ShimSpan';

async function withTestSpan(
  func: (span: ShimSpan) => void | Promise<void>
): Promise<ReadableSpan[]> {
  return await withTestTracer(tracer =>
    tracer.startRootSpan({ name: 'test' }, span => func(span as ShimSpan))
  );
}

describe('ShimSpan', () => {
  setupNodeContextManager(before, after);

  describe('id', () => {
    it('should return the span id of the underlying otel span', async () => {
      await withTestSpan(span => {
        assert.strictEqual(span.id, span.otelSpan.spanContext().spanId);
      });
    });
  });

  describe('traceId', () => {
    it('should return the trace id of the underlying otel span', async () => {
      await withTestSpan(span => {
        assert.strictEqual(span.traceId, span.otelSpan.spanContext().traceId);
      });
    });
  });

  describe('addAttribute', () => {
    it('should add attributes', async () => {
      const [span] = await withTestSpan(span => {
        span.addAttribute('foo', 'bar');
        span.end();
      });

      assert.deepStrictEqual(span.attributes, { foo: 'bar' });
    });
  });

  describe('addAnnotation', () => {
    it('should add an event', async () => {
      const [span] = await withTestSpan(span => {
        span.addAnnotation('the annotation', { foo: 'bar' });
        span.end();
      });

      assert.strictEqual(span.events.length, 1);
      const [{ time, ...event }] = span.events;
      assert.deepStrictEqual(event, {
        attributes: {
          foo: 'bar',
        },
        droppedAttributesCount: 0,
        name: 'the annotation',
      });
    });
  });

  describe('addMessageEvent', () => {
    it('should add an event', async () => {
      const [span] = await withTestSpan(span => {
        span.addMessageEvent(oc.MessageEventType.SENT, 98, undefined, 12, 15);
        span.end();
      });

      assert.strictEqual(span.events.length, 1);
      const [{ time, ...event }] = span.events;
      assert.deepStrictEqual(event, {
        attributes: {
          'message.event.size.compressed': 15,
          'message.event.size.uncompressed': 12,
          'message.event.type': 'SENT',
        },
        droppedAttributesCount: 0,
        name: '98',
      });
    });
  });

  describe('startChildSpan', () => {
    it('should start a child of the current span without options', async () => {
      const [childSpan, parentSpan] = await withTestSpan(span => {
        span.startChildSpan().end();
        span.end();
      });

      assert.strictEqual(childSpan.name, 'span');
      assert.deepStrictEqual(
        childSpan.parentSpanContext?.spanId,
        parentSpan.spanContext().spanId
      );
    });

    it('should start a child of the current span with options', async () => {
      const [childSpan, parentSpan] = await withTestSpan(span => {
        span.startChildSpan({ name: 'child' }).end();
        span.end();
      });

      assert.strictEqual(childSpan.name, 'child');
      assert.deepStrictEqual(
        childSpan.parentSpanContext?.spanId,
        parentSpan.spanContext().spanId
      );
    });
  });
});
