/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import type {
  Context,
  Span,
  SpanOptions,
  TextMapGetter,
  TextMapPropagator,
  TextMapSetter,
} from '../../../src';
import api, {
  context,
  defaultTextMapGetter,
  defaultTextMapSetter,
  diag,
  metrics,
  propagation,
  ROOT_CONTEXT,
  trace,
  TraceFlags,
} from '../../../src';
import { DiagAPI } from '../../../src/api/diag';
import { NoopMeter } from '../../../src/metrics/NoopMeter';
import { NoopMeterProvider } from '../../../src/metrics/NoopMeterProvider';
import { NonRecordingSpan } from '../../../src/trace/NonRecordingSpan';
import { NoopTracer } from '../../../src/trace/NoopTracer';
import { NoopTracerProvider } from '../../../src/trace/NoopTracerProvider';

// DiagLogger implementation
const diagLoggerFunctions = [
  'verbose',
  'debug',
  'info',
  'warn',
  'error',
] as const;

describe('API', function () {
  it('should expose a tracer provider via getTracerProvider', function () {
    const tracer = api.trace.getTracerProvider();
    assert.ok(tracer);
    assert.strictEqual(typeof tracer, 'object');
  });

  it('getActiveSpan should get the current span', function () {
    const span = new NonRecordingSpan();
    const ctx = trace.setSpan(ROOT_CONTEXT, span);
    context.setGlobalContextManager({
      active: () => ctx,
      disable: () => {},
    } as any);

    const active = trace.getActiveSpan();
    assert.strictEqual(active, span);

    context.disable();
  });

  describe('Context', function () {
    it('with should forward this, arguments and return value', function () {
      function fnWithThis(this: string, a: string, b: number): string {
        assert.strictEqual(this, 'that');
        assert.strictEqual(arguments.length, 2);
        assert.strictEqual(a, 'one');
        assert.strictEqual(b, 2);
        return 'done';
      }

      const res = context.with(ROOT_CONTEXT, fnWithThis, 'that', 'one', 2);
      assert.strictEqual(res, 'done');

      assert.strictEqual(
        context.with(ROOT_CONTEXT, () => 3.14),
        3.14
      );
    });
  });

  describe('GlobalTracerProvider', function () {
    const spanContext = {
      traceId: 'd4cda95b652f4a1592b449d5929fda1b',
      spanId: '6e0c63257de34c92',
      traceFlags: TraceFlags.NONE,
    };
    const dummySpan = new NonRecordingSpan(spanContext);

    beforeEach(() => {
      context.disable();
      trace.disable();
      propagation.disable();
    });

    it('should use the global tracer provider', function () {
      api.trace.setGlobalTracerProvider(new TestTracerProvider());
      const tracer = api.trace.getTracerProvider().getTracer('name');
      const span = tracer.startSpan('test');
      assert.deepStrictEqual(span, dummySpan);
    });

    it('should set delegate only on success', function () {
      assert.strictEqual(
        api.trace.setGlobalTracerProvider(new TestTracerProvider()),
        true
      );
      assert.strictEqual(
        api.trace.setGlobalTracerProvider(new NoopTracerProvider()),
        false
      );
      assert.ok(api.trace.getTracer('name') instanceof TestTracer);
    });

    class TestTracer extends NoopTracer {
      override startSpan(name: string, options?: SpanOptions): Span {
        return dummySpan;
      }
    }

    class TestTracerProvider extends NoopTracerProvider {
      override getTracer(_name: string, version?: string) {
        return new TestTracer();
      }
    }

    describe('should use the global propagation', function () {
      const testKey = Symbol('kTestKey');

      class TestTextMapPropagation implements TextMapPropagator {
        injectedWith?: {
          context: Context;
          carrier: unknown;
          setter: TextMapSetter;
        };

        inject(
          context: Context,
          carrier: unknown,
          setter: TextMapSetter
        ): void {
          this.injectedWith = { context, carrier, setter };
        }

        extract(
          context: Context,
          carrier: unknown,
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

      it('inject', function () {
        const propagator = new TestTextMapPropagation();
        api.propagation.setGlobalPropagator(propagator);

        const context = ROOT_CONTEXT.setValue(testKey, 15);
        const carrier: Record<string, string> = {};
        api.propagation.inject(context, carrier);
        assert.strictEqual(propagator.injectedWith?.context, context);
        assert.strictEqual(propagator.injectedWith?.carrier, carrier);
        assert.strictEqual(
          propagator.injectedWith?.setter,
          defaultTextMapSetter
        );

        const setter: TextMapSetter = {
          set: () => {},
        };
        api.propagation.inject(context, carrier, setter);
        assert.strictEqual(propagator.injectedWith?.context, context);
        assert.strictEqual(propagator.injectedWith?.carrier, carrier);
        assert.strictEqual(propagator.injectedWith?.setter, setter);
      });

      it('inject with a non-record carrier and an explicit setter', function () {
        const propagator = new TestTextMapPropagation();
        api.propagation.setGlobalPropagator(propagator);

        const context = ROOT_CONTEXT.setValue(testKey, 15);
        const carrier: string[] = [];
        const setter: TextMapSetter<string[]> = {
          set: () => {},
        };
        api.propagation.inject(context, carrier, setter);
        assert.strictEqual(propagator.injectedWith?.context, context);
        assert.strictEqual(propagator.injectedWith?.carrier, carrier);
        assert.strictEqual(propagator.injectedWith?.setter, setter);
      });

      it('extract', function () {
        api.propagation.setGlobalPropagator(new TestTextMapPropagation());

        const carrier: Record<string, string> = {};
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

      it('extract with a non-record carrier and an explicit getter', function () {
        api.propagation.setGlobalPropagator(new TestTextMapPropagation());

        const carrier: string[] = [];
        const getter: TextMapGetter<string[]> = {
          keys: () => [],
          get: () => undefined,
        };
        const context = api.propagation.extract(ROOT_CONTEXT, carrier, getter);
        const data: any = context.getValue(testKey);
        assert.ok(data != null);
        assert.strictEqual(data.context, ROOT_CONTEXT);
        assert.strictEqual(data.carrier, carrier);
        assert.strictEqual(data.getter, getter);
      });

      it('fields', function () {
        api.propagation.setGlobalPropagator(new TestTextMapPropagation());

        const fields = api.propagation.fields();
        assert.deepStrictEqual(fields, ['TestField']);
      });
    });
  });

  describe('Global diag', function () {
    it('initialization', function () {
      const inst = DiagAPI.instance();
      assert.deepStrictEqual(diag, inst);
    });

    diagLoggerFunctions.forEach(fName => {
      it(`no argument logger ${fName} message doesn't throw`, function () {
        // @ts-expect-error an undefined logger is not allowed
        diag.setLogger();
        diag[fName](`${fName} message`);
      });

      it(`null logger ${fName} message doesn't throw`, function () {
        diag.setLogger(null as any);
        diag[fName](`${fName} message`);
      });

      it(`undefined logger ${fName} message doesn't throw`, function () {
        diag.setLogger(undefined as any);
        diag[fName](`${fName} message`);
      });

      it(`empty logger ${fName} message doesn't throw`, function () {
        diag.setLogger({} as any);
        diag[fName](`${fName} message`);
      });
    });
  });

  describe('Global metrics', function () {
    it('should expose a meter provider via getMeterProvider', function () {
      const meter = metrics.getMeterProvider();
      assert.ok(meter);
      assert.strictEqual(typeof meter, 'object');
    });

    describe('GlobalMeterProvider', function () {
      const dummyMeter = new NoopMeter();

      beforeEach(() => {
        metrics.disable();
      });

      it('should use the global meter provider', function () {
        metrics.setGlobalMeterProvider(new TestMeterProvider());
        const meter = metrics.getMeterProvider().getMeter('name');
        assert.deepStrictEqual(meter, dummyMeter);
      });

      class TestMeterProvider extends NoopMeterProvider {
        override getMeter() {
          return dummyMeter;
        }
      }
    });
  });
});
