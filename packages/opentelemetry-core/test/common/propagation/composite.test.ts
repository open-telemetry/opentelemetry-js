/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  defaultTextMapGetter,
  defaultTextMapSetter,
  TextMapPropagator,
  SpanContext,
  TextMapGetter,
  TextMapSetter,
  trace,
} from '@opentelemetry/api';
import { Context, ROOT_CONTEXT } from '@opentelemetry/api';
import * as assert from 'assert';
import { CompositePropagator, W3CTraceContextPropagator } from '../../../src';
import {
  TRACE_PARENT_HEADER,
  TRACE_STATE_HEADER,
} from '../../../src/trace/W3CTraceContextPropagator';
import { TraceState } from '../../../src/trace/TraceState';

class DummyPropagator implements TextMapPropagator {
  inject(context: Context, carrier: any, setter: TextMapSetter<any>): void {
    carrier['dummy'] = trace.getSpanContext(context);
  }
  extract(context: Context, carrier: any, getter: TextMapGetter<any>): Context {
    if (carrier['dummy']) {
      return trace.setSpanContext(context, carrier['dummy']);
    }
    return context;
  }
  fields(): string[] {
    return ['dummy'];
  }
}

describe('Composite Propagator', () => {
  const traceId = 'd4cda95b652f4a1592b449d5929fda1b';
  const spanId = '6e0c63257de34c92';

  describe('inject', () => {
    let carrier: { [key: string]: unknown };
    let spanContext: SpanContext;
    let ctxWithSpanContext: Context;

    beforeEach(() => {
      carrier = {};
      spanContext = {
        spanId,
        traceId,
        traceFlags: 1,
        traceState: new TraceState('foo=bar'),
      };
      ctxWithSpanContext = trace.setSpanContext(ROOT_CONTEXT, spanContext);
    });

    it('should inject context using all configured propagators', () => {
      const composite = new CompositePropagator({
        propagators: [new DummyPropagator(), new W3CTraceContextPropagator()],
      });
      composite.inject(ctxWithSpanContext, carrier, defaultTextMapSetter);

      assert.strictEqual(carrier['dummy'], spanContext);
      assert.strictEqual(
        carrier[TRACE_PARENT_HEADER],
        `00-${traceId}-${spanId}-01`
      );
      assert.strictEqual(carrier[TRACE_STATE_HEADER], 'foo=bar');
    });

    it('should not throw', () => {
      const composite = new CompositePropagator({
        propagators: [
          new ThrowingPropagator(),
          new W3CTraceContextPropagator(),
        ],
      });
      composite.inject(ctxWithSpanContext, carrier, defaultTextMapSetter);

      assert.strictEqual(
        carrier[TRACE_PARENT_HEADER],
        `00-${traceId}-${spanId}-01`
      );
    });
  });

  describe('extract', () => {
    let carrier: { [key: string]: unknown };

    beforeEach(() => {
      carrier = {
        ['dummy']: { traceId, spanId },
        [TRACE_PARENT_HEADER]: `00-${traceId}-${spanId}-01`,
        [TRACE_STATE_HEADER]: 'foo=bar',
      };
    });

    it('should extract context using all configured propagators', () => {
      const composite = new CompositePropagator({
        propagators: [new DummyPropagator(), new W3CTraceContextPropagator()],
      });
      const spanContext = trace.getSpanContext(
        composite.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
      );

      if (!spanContext) {
        throw new Error('no extracted context');
      }

      assert.strictEqual(spanContext.traceId, traceId);
      assert.strictEqual(spanContext.spanId, spanId);
      assert.strictEqual(spanContext.traceFlags, 1);
      assert.strictEqual(spanContext.isRemote, true);
      assert.strictEqual(spanContext.traceState!.get('foo'), 'bar');
    });

    it('should not throw', () => {
      const composite = new CompositePropagator({
        propagators: [
          new ThrowingPropagator(),
          new W3CTraceContextPropagator(),
        ],
      });
      const spanContext = trace.getSpanContext(
        composite.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
      );

      if (!spanContext) {
        throw new Error('no extracted context');
      }

      assert.strictEqual(spanContext.traceId, traceId);
      assert.strictEqual(spanContext.spanId, spanId);
      assert.strictEqual(spanContext.traceFlags, 1);
      assert.strictEqual(spanContext.isRemote, true);
      assert.strictEqual(spanContext.traceState!.get('foo'), 'bar');
    });
  });

  describe('fields()', () => {
    it('should combine fields from both propagators', () => {
      const composite = new CompositePropagator({
        propagators: [
          {
            extract: c => c,
            inject: () => {},
            fields: () => ['p1'],
          },
          {
            extract: c => c,
            inject: () => {},
            fields: () => ['p2'],
          },
        ],
      });

      assert.deepStrictEqual(composite.fields(), ['p1', 'p2']);
    });

    it('should ignore propagators without fields function', () => {
      const composite = new CompositePropagator({
        propagators: [
          {
            extract: c => c,
            inject: () => {},
            fields: () => ['p1'],
          },
          // @ts-expect-error verify missing fields case
          {
            extract: c => c,
            inject: () => {},
          },
        ],
      });

      assert.deepStrictEqual(composite.fields(), ['p1']);
    });

    it('should not allow caller to modify fields', () => {
      const composite = new CompositePropagator({
        propagators: [
          {
            extract: c => c,
            inject: () => {},
            fields: () => ['p1'],
          },
          {
            extract: c => c,
            inject: () => {},
            fields: () => ['p2'],
          },
        ],
      });

      const fields = composite.fields();
      assert.deepStrictEqual(fields, ['p1', 'p2']);
      fields[1] = 'p3';
      assert.deepStrictEqual(composite.fields(), ['p1', 'p2']);
    });
  });
});

class ThrowingPropagator implements TextMapPropagator {
  inject(context: Context, carrier: unknown) {
    throw new Error('this propagator throws');
  }

  extract(context: Context, carrier: unknown): Context {
    throw new Error('This propagator throws');
  }

  fields(): string[] {
    return [];
  }
}
