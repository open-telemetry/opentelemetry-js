/**
 * Copyright 2019, OpenTelemetry Authors
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

import * as assert from 'assert';
import * as types from '@opentelemetry/types';
import * as opentracing from 'opentracing';
import { Tracer } from 'opentracing';
import { BasicTracer, Span } from '@opentelemetry/basic-tracer';
import { NoopScopeManager } from '@opentelemetry/scope-base';
import { TracerShim, SpanShim, SpanContextShim } from '../src/Shim';
import { INVALID_SPAN_CONTEXT } from '@opentelemetry/core';
import { performance } from 'perf_hooks';

describe('OpenTracing Shim', () => {
  const tracer = new BasicTracer({
    scopeManager: new NoopScopeManager(),
  });
  const shimTracer: opentracing.Tracer = new TracerShim(tracer);
  opentracing.initGlobalTracer(shimTracer);

  describe('TracerShim', () => {
    let span: opentracing.Span;
    let spanShim: SpanShim;
    let context: opentracing.SpanContext;

    beforeEach(() => {
      span = shimTracer.startSpan('my-span');
      spanShim = span as SpanShim;
      context = span.context();
    });

    describe('propagation', () => {
      it('injects/extracts a span object', () => {
        const carrier: { [key: string]: unknown } = {};
        shimTracer.inject(span, opentracing.FORMAT_HTTP_HEADERS, carrier);
        const extractedContext = shimTracer.extract(
          opentracing.FORMAT_HTTP_HEADERS,
          carrier
        );
        assert.strictEqual(context.toTraceId(), extractedContext.toTraceId());
        assert.strictEqual(context.toSpanId(), extractedContext.toSpanId());
      });

      it('injects/extracts HTTP carriers', () => {
        const carrier: { [key: string]: unknown } = {};
        shimTracer.inject(context, opentracing.FORMAT_HTTP_HEADERS, carrier);
        const extractedContext = shimTracer.extract(
          opentracing.FORMAT_HTTP_HEADERS,
          carrier
        );
        assert.strictEqual(context.toTraceId(), extractedContext.toTraceId());
        assert.strictEqual(context.toSpanId(), extractedContext.toSpanId());
      });

      it('injects/extracts TextMap carriers', () => {
        const carrier: { [key: string]: unknown } = {};
        shimTracer.inject(context, opentracing.FORMAT_TEXT_MAP, carrier);
        const extractedContext = shimTracer.extract(
          opentracing.FORMAT_TEXT_MAP,
          carrier
        );
        assert.strictEqual(context.toTraceId(), extractedContext.toTraceId());
        assert.strictEqual(context.toSpanId(), extractedContext.toSpanId());
      });

      it('injects/extracts Binary carriers', () => {
        /* const carrier = new Array(); */
        /* shimTracer.inject(context, opentracing.FORMAT_BINARY, carrier); */
        /* const extractedContext = shimTracer.extract(opentracing.FORMAT_BINARY, { buffer: new Uint8Array(carrier)}); */
        /* assert.strictEqual(context.toSpanId(), extractedContext.toSpanId()) */
      });
    });

    it('creates parent/child relationship using a span object', () => {
      const childSpan = shimTracer.startSpan('other-span', {
        childOf: span,
      }) as SpanShim;
      assert.strictEqual(childSpan.getSpan().parentSpanId, context.toSpanId());
      assert.strictEqual(
        childSpan.context().toTraceId(),
        span.context().toTraceId()
      );
    });
    it('creates parent/child relationship using a context object', () => {
      const childSpan = shimTracer.startSpan('other-span', {
        childOf: context,
      });
      assert.strictEqual(childSpan.getSpan().parentSpanId, context.toSpanId());
      assert.strictEqual(
        childSpan.context().toTraceId(),
        span.context().toTraceId()
      );
    });

    it('translates span options correctly', () => {
      const opentracingOptions: opentracing.SpanOptions = {
        startTime: 123,
        tags: { key: 'value', count: 1 },
        references: [
          new opentracing.Reference(opentracing.FOLLOWS_FROM, context),
        ],
      };
      span = shimTracer.startSpan('my-span', opentracingOptions);
      assert.strictEqual((span.getSpan() as Span).links.length, 1);
      assert.strictEqual(
        span.getSpan().startTime,
        opentracingOptions.startTime
      );
      assert.deepStrictEqual(
        span.getSpan().attributes,
        opentracingOptions.tags
      );
    });
  });

  describe('SpanContextShim', () => {
    it('returns the correct context', () => {
      const shim = new SpanContextShim(INVALID_SPAN_CONTEXT);
      assert.strictEqual(shim.getSpanContext(), INVALID_SPAN_CONTEXT);
      assert.strictEqual(shim.toTraceId(), INVALID_SPAN_CONTEXT.traceId);
      assert.strictEqual(shim.toSpanId(), INVALID_SPAN_CONTEXT.spanId);
    });
  });

  describe('span', () => {
    let span: SpanShim;
    let otSpan: Span;

    beforeEach(() => {
      span = shimTracer.startSpan('my-span', { startTime: 100 }) as SpanShim;
      otSpan = (span as SpanShim).getSpan() as Span;
    });

    it('sets tags', () => {
      span.setTag('hello', 'world');
      assert.strictEqual(otSpan.attributes.hello, 'world');

      span.addTags({ hello: 'stars', from: 'earth' });
      assert.strictEqual(otSpan.attributes.hello, 'stars');
      assert.strictEqual(otSpan.attributes.from, 'earth');
    });

    it('logs KV pairs', () => {
      const kvLogs = { key: 'value', error: 'not a valid span' };
      span.log(kvLogs);
      assert.strictEqual(otSpan.events[0].name, 'log');
      assert.strictEqual(otSpan.events[0].attributes, kvLogs);
    });

    it('logs an event with a payload', () => {
      const payload = { user: 'payload', request: 1 };
      span.logEvent('some log', payload);
      assert.strictEqual(otSpan.events[0].name, 'some log');
      assert.deepStrictEqual(otSpan.events[0].attributes, { payload: payload });
    });

    it('updates the name', () => {
      assert.strictEqual(otSpan.name, 'my-span');
      span.setOperationName('your-span');
      assert.strictEqual(otSpan.name, 'your-span');
    });

    it('sets explicit end timestamp', () => {
      const now = performance.now();
      span.finish(now);
      assert.strictEqual(otSpan.endTime, now);
    });

    it('can set and retrieve baggage', () => {
      span.setBaggageItem('baggage', 'item');
      // TODO: baggage
    });
  });
});
