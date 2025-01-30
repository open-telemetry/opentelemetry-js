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
import { CompositePropagator, W3CTraceContextPropagator } from '../../src';
import {
  TRACE_PARENT_HEADER,
  TRACE_STATE_HEADER,
} from '../../src/trace/W3CTraceContextPropagator';
import { TraceState } from '../../src/trace/TraceState';

class DummyPropagator implements TextMapPropagator<unknown> {
  inject(
    context: Context,
    carrier: unknown,
    setter: TextMapSetter<unknown>
  ): void {
    const spanContext = trace.getSpanContext(context);

    if (spanContext) {
      const { traceId, spanId, traceFlags } = spanContext;
      setter.set(carrier, 'dummy-trace-id', traceId);
      setter.set(carrier, 'dummy-span-id', spanId);
      setter.set(carrier, 'dummy-trace-flags', String(traceFlags));
    }
  }
  extract(
    context: Context,
    carrier: unknown,
    getter: TextMapGetter<unknown>
  ): Context {
    const traceId = getter.get(carrier, 'dummy-trace-id');
    const spanId = getter.get(carrier, 'dummy-span-id');
    const traceFlags = getter.get(carrier, 'dummy-trace-flags');

    if (
      typeof traceId === 'string' &&
      typeof spanId === 'string' &&
      typeof traceFlags === 'string'
    ) {
      return trace.setSpanContext(context, {
        traceId,
        spanId,
        traceFlags: parseInt(traceFlags),
      });
    }

    return context;
  }
  fields(): string[] {
    return ['dummy-trace-id', 'dummy-span-id', 'dummy-trace-flags'];
  }
}

describe('Composite Propagator', () => {
  const traceId = 'd4cda95b652f4a1592b449d5929fda1b';
  const spanId = '6e0c63257de34c92';
  const traceFlags = 1;

  describe('inject', () => {
    let carrier: { [key: string]: unknown };
    let spanContext: SpanContext;
    let ctxWithSpanContext: Context;

    beforeEach(() => {
      carrier = {};
      spanContext = {
        spanId,
        traceId,
        traceFlags,
        traceState: new TraceState('foo=bar'),
      };
      ctxWithSpanContext = trace.setSpanContext(ROOT_CONTEXT, spanContext);
    });

    it('should inject context using all configured propagators', () => {
      const composite = new CompositePropagator({
        propagators: [new DummyPropagator(), new W3CTraceContextPropagator()],
      });
      composite.inject(ctxWithSpanContext, carrier, defaultTextMapSetter);

      assert.strictEqual(carrier['dummy-trace-id'], traceId);
      assert.strictEqual(carrier['dummy-span-id'], spanId);
      assert.strictEqual(carrier['dummy-trace-flags'], String(traceFlags));
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
        ['dummy-trace-id']: traceId,
        ['dummy-span-id']: spanId,
        ['dummy-trace-flags']: String(traceFlags),
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

class ThrowingPropagator implements TextMapPropagator<unknown> {
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
