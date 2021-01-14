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

import * as assert from 'assert';
import api, {
  TraceFlags,
  NoopSpan,
  NoopTracerProvider,
  NoopTracer,
  SpanOptions,
  Span,
  context,
  trace,
  propagation,
  metrics,
  TextMapPropagator,
  Context,
  TextMapSetter,
  TextMapGetter,
  ROOT_CONTEXT,
  defaultTextMapSetter,
  defaultTextMapGetter,
} from '../../src';

describe('API', () => {
  it('should expose a tracer provider via getTracerProvider', () => {
    const tracer = api.trace.getTracerProvider();
    assert.ok(tracer);
    assert.strictEqual(typeof tracer, 'object');
  });

  describe('GlobalTracerProvider', () => {
    const spanContext = {
      traceId: 'd4cda95b652f4a1592b449d5929fda1b',
      spanId: '6e0c63257de34c92',
      traceFlags: TraceFlags.NONE,
    };
    const dummySpan = new NoopSpan(spanContext);

    beforeEach(() => {
      context.disable();
      trace.disable();
      propagation.disable();
      metrics.disable();
    });

    it('should use the global tracer provider', () => {
      api.trace.setGlobalTracerProvider(new TestTracerProvider());
      const tracer = api.trace.getTracerProvider().getTracer('name');
      const span = tracer.startSpan('test');
      assert.deepStrictEqual(span, dummySpan);
    });

    class TestTracer extends NoopTracer {
      startSpan(name: string, options?: SpanOptions): Span {
        return dummySpan;
      }
    }

    class TestTracerProvider extends NoopTracerProvider {
      getTracer(_name: string, version?: string) {
        return new TestTracer();
      }
    }

    describe('should use the global propagation', () => {
      const testKey = Symbol('kTestKey');

      interface Carrier {
        context?: Context;
        setter?: TextMapSetter;
      }

      class TestTextMapPropagation implements TextMapPropagator<Carrier> {
        inject(
          context: Context,
          carrier: Carrier,
          setter: TextMapSetter
        ): void {
          carrier.context = context;
          carrier.setter = setter;
        }

        extract(
          context: Context,
          carrier: Carrier,
          getter: TextMapGetter
        ): Context {
          return context.setValue(testKey, {
            context,
            carrier,
            getter,
          });
        }

        fields(): string[] {
          return ['TestField'];
        }
      }

      it('inject', () => {
        api.propagation.setGlobalPropagator(new TestTextMapPropagation());

        const context = ROOT_CONTEXT.setValue(testKey, 15);
        const carrier: Carrier = {};
        api.propagation.inject(context, carrier);
        assert.strictEqual(carrier.context, context);
        assert.strictEqual(carrier.setter, defaultTextMapSetter);

        const setter: TextMapSetter = {
          set: () => {},
        };
        api.propagation.inject(context, carrier, setter);
        assert.strictEqual(carrier.context, context);
        assert.strictEqual(carrier.setter, setter);
      });

      it('extract', () => {
        api.propagation.setGlobalPropagator(new TestTextMapPropagation());

        const carrier: Carrier = {};
        let context = api.propagation.extract(ROOT_CONTEXT, carrier);
        let data: any = context.getValue(testKey);
        assert.ok(data != null);
        assert.strictEqual(data.context, ROOT_CONTEXT);
        assert.strictEqual(data.carrier, carrier);
        assert.strictEqual(data.getter, defaultTextMapGetter);

        const getter: TextMapGetter = {
          keys: () => [],
          get: () => undefined,
        };
        context = api.propagation.extract(ROOT_CONTEXT, carrier, getter);
        data = context.getValue(testKey);
        assert.ok(data != null);
        assert.strictEqual(data.context, ROOT_CONTEXT);
        assert.strictEqual(data.carrier, carrier);
        assert.strictEqual(data.getter, getter);
      });

      it('fields', () => {
        api.propagation.setGlobalPropagator(new TestTextMapPropagation());

        const fields = api.propagation.fields();
        assert.deepStrictEqual(fields, ['TestField']);
      });
    });
  });
});
