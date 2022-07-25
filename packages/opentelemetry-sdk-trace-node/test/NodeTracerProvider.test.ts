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

import * as sinon from 'sinon';
import * as assert from 'assert';

import {
  context,
  Context,
  ContextManager,
  propagation,
  ROOT_CONTEXT,
  TextMapGetter,
  TextMapPropagator,
  TextMapSetter,
  trace,
  TraceFlags,
} from '@opentelemetry/api';
import { AlwaysOnSampler, AlwaysOffSampler } from '@opentelemetry/core';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import {
  BatchSpanProcessor,
  InMemorySpanExporter,
  Span,
  SpanExporter,
} from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

import { NodeTracerProvider } from '../src/NodeTracerProvider';

const sleep = (time: number) =>
  new Promise(resolve => {
    return setTimeout(resolve, time);
  });

describe('NodeTracerProvider', () => {
  let provider: NodeTracerProvider;
  let contextManager: ContextManager;

  beforeEach(() => {
    contextManager = new AsyncHooksContextManager();
    context.setGlobalContextManager(contextManager.enable());
  });

  afterEach(() => {
    contextManager.disable();
    context.disable();
  });

  describe('constructor', () => {
    it('should construct an instance with required only options', () => {
      provider = new NodeTracerProvider();
      assert.ok(provider instanceof NodeTracerProvider);
    });

    it('should construct an instance with logger', () => {
      provider = new NodeTracerProvider();
      assert.ok(provider instanceof NodeTracerProvider);
    });

    it('should construct an instance with sampler', () => {
      provider = new NodeTracerProvider({
        sampler: new AlwaysOnSampler(),
      });
      assert.ok(provider instanceof NodeTracerProvider);
    });
  });

  describe('.startSpan()', () => {
    it('should start a span with name only', () => {
      provider = new NodeTracerProvider();
      const span = provider.getTracer('default').startSpan('my-span');
      assert.ok(span);
    });

    it('should start a span with name and options', () => {
      provider = new NodeTracerProvider();
      const span = provider.getTracer('default').startSpan('my-span', {});
      assert.ok(span);
    });

    it('should return a default span with no sampling (AlwaysOffSampler)', () => {
      provider = new NodeTracerProvider({
        sampler: new AlwaysOffSampler(),
      });
      const span = provider.getTracer('default').startSpan('my-span');
      assert.strictEqual(span.spanContext().traceFlags, TraceFlags.NONE);
      assert.strictEqual(span.isRecording(), false);
    });

    it('should start a recording span with always sampling (AlwaysOnSampler)', () => {
      provider = new NodeTracerProvider({
        sampler: new AlwaysOnSampler(),
      });
      const span = provider.getTracer('default').startSpan('my-span');
      assert.ok(span instanceof Span);
      assert.strictEqual(span.spanContext().traceFlags, TraceFlags.SAMPLED);
      assert.strictEqual(span.isRecording(), true);
    });

    it('should sample with AlwaysOnSampler if parent was not sampled', () => {
      provider = new NodeTracerProvider({
        sampler: new AlwaysOnSampler(),
      });

      const sampledParent = provider.getTracer('default').startSpan(
        'not-sampled-span',
        {},
        trace.setSpanContext(ROOT_CONTEXT, {
          traceId: 'd4cda95b652f4a1592b449d5929fda1b',
          spanId: '6e0c63257de34c92',
          traceFlags: TraceFlags.NONE,
        })
      );
      assert.ok(sampledParent instanceof Span);
      assert.strictEqual(
        sampledParent.spanContext().traceFlags,
        TraceFlags.SAMPLED
      );
      assert.strictEqual(sampledParent.isRecording(), true);

      const span = provider
        .getTracer('default')
        .startSpan('child-span', {}, trace.setSpan(ROOT_CONTEXT, sampledParent));
      assert.ok(span instanceof Span);
      assert.strictEqual(span.spanContext().traceFlags, TraceFlags.SAMPLED);
      assert.strictEqual(span.isRecording(), true);
    });

    it('should assign resource to span', () => {
      provider = new NodeTracerProvider();
      const span = provider.getTracer('default').startSpan('my-span') as Span;
      assert.ok(span);
      assert.ok(span.resource instanceof Resource);
      assert.equal(
        span.resource.attributes[SemanticResourceAttributes.TELEMETRY_SDK_LANGUAGE],
        'nodejs'
      );
    });
  });

  describe('.withSpan()', () => {
    it('should run context with AsyncHooksContextManager context manager', done => {
      provider = new NodeTracerProvider({});
      const span = provider.getTracer('default').startSpan('my-span');
      context.with(trace.setSpan(context.active(), span), () => {
        assert.deepStrictEqual(trace.getSpan(context.active()), span);
        return done();
      });
      assert.deepStrictEqual(trace.getSpan(context.active()), undefined);
    });

    it('should run context with AsyncHooksContextManager context manager with multiple spans', done => {
      provider = new NodeTracerProvider({});
      const span = provider.getTracer('default').startSpan('my-span');
      context.with(trace.setSpan(context.active(), span), () => {
        assert.deepStrictEqual(trace.getSpan(context.active()), span);

        const span1 = provider.getTracer('default').startSpan('my-span1');

        context.with(trace.setSpan(context.active(), span1), () => {
          assert.deepStrictEqual(trace.getSpan(context.active()), span1);
          assert.deepStrictEqual(
            span1.spanContext().traceId,
            span.spanContext().traceId
          );
          return done();
        });
      });
      // when span ended.
      // @todo: below check is not running.
      assert.deepStrictEqual(trace.getSpan(context.active()), undefined);
    });

    it('should find correct context with promises', async () => {
      provider = new NodeTracerProvider();
      const span = provider.getTracer('default').startSpan('my-span');
      await context.with(trace.setSpan(context.active(), span), async () => {
        for (let i = 0; i < 3; i++) {
          await sleep(5).then(() => {
            assert.deepStrictEqual(trace.getSpan(context.active()), span);
          });
        }
      });
      assert.deepStrictEqual(trace.getSpan(context.active()), undefined);
    });
  });

  describe('.bind()', () => {
    it('should bind context with AsyncHooksContextManager context manager', done => {
      const provider = new NodeTracerProvider({});
      const span = provider.getTracer('default').startSpan('my-span');
      const fn = () => {
        assert.deepStrictEqual(trace.getSpan(context.active()), span);
        return done();
      };
      const patchedFn = context.bind(trace.setSpan(context.active(), span), fn);
      return patchedFn();
    });
  });

  describe('.register()', () => {
    let originalPropagators: string | number | undefined | string[];
    beforeEach(() => {
      originalPropagators = process.env.OTEL_PROPAGATORS;
    });

    afterEach(() => {
      // otherwise we may assign 'undefined' (a string)
      if (originalPropagators !== undefined) {
        (process.env as any).OTEL_PROPAGATORS = originalPropagators;
      } else {
        delete (process.env as any).OTEL_PROPAGATORS;
      }
    });

    it('should allow propagators as per the specification', () => {
      (process.env as any).OTEL_PROPAGATORS = 'b3,b3multi,jaeger';

      const provider = new NodeTracerProvider();
      provider.register();

      assert.deepStrictEqual(propagation.fields(), [
        'b3',
        'x-b3-traceid',
        'x-b3-spanid',
        'x-b3-flags',
        'x-b3-sampled',
        'x-b3-parentspanid',
        'uber-trace-id',
      ]);
    });
  });


  describe('Custom TracerProvider through inheritance', () => {
    class DummyPropagator implements TextMapPropagator {
      inject(
        context: Context,
        carrier: any,
        setter: TextMapSetter<any>
      ): void {
        throw new Error('Method not implemented.');
      }
      extract(
        context: Context,
        carrier: any,
        getter: TextMapGetter<any>
      ): Context {
        throw new Error('Method not implemented.');
      }
      fields(): string[] {
        throw new Error('Method not implemented.');
      }
    }

    class DummyExporter extends InMemorySpanExporter {}

    beforeEach(() => {
      process.env.OTEL_TRACES_EXPORTER = 'custom-exporter';
      process.env.OTEL_PROPAGATORS = 'custom-propagator';

      propagation.disable();
      trace.disable();
    });

    afterEach(() => {
      delete process.env.OTEL_TRACES_EXPORTER;
      delete process.env.OTEL_PROPAGATORS;

      propagation.disable();
      trace.disable();

      sinon.restore();
    });

    it('can be extended by overriding registered components', () => {
      const propagator = new DummyPropagator();

      class CustomTracerProvider extends NodeTracerProvider {
        protected static override readonly _registeredPropagators = new Map<
          string,
          () => TextMapPropagator
            >([
              ['custom-propagator', () => propagator],
            ]);

        protected static override readonly _registeredExporters = new Map<
          string,
          () => SpanExporter
            >([
              ['custom-exporter', () => new DummyExporter()],
            ]);
      }

      const provider = new CustomTracerProvider({});
      provider.register();
      const processor = provider.getActiveSpanProcessor();
      assert(processor instanceof BatchSpanProcessor);
      // @ts-expect-error access configured to verify its the correct one
      const exporter = processor._exporter;
      assert(exporter instanceof DummyExporter);

      assert.strictEqual(propagation['_getGlobalPropagator'](), propagator);
    });

    it('the old way of extending still works', () => {
      const propagator = new DummyPropagator();

      // this is an anti-pattern, but we test that for backwards compatibility
      class CustomTracerProvider extends NodeTracerProvider {
        protected static override readonly _registeredPropagators = new Map<
          string,
          () => TextMapPropagator
            >([
              ['custom-propagator', () => propagator],
            ]);

        protected static override readonly _registeredExporters = new Map<
          string,
          () => SpanExporter
            >([
              ['custom-exporter', () => new DummyExporter()],
            ]);

        protected override  _getPropagator(name: string): TextMapPropagator | undefined {
          return (
            super._getPropagator(name) ||
            CustomTracerProvider._registeredPropagators.get(name)?.()
          );
        }

        protected override _getSpanExporter(name: string): SpanExporter | undefined {
          return (
            super._getSpanExporter(name) ||
            CustomTracerProvider._registeredExporters.get(name)?.()
          );
        }
      }

      const provider = new CustomTracerProvider({});
      provider.register();
      const processor = provider.getActiveSpanProcessor();
      assert(processor instanceof BatchSpanProcessor);
      // @ts-expect-error access configured to verify its the correct one
      const exporter = processor._exporter;
      assert(exporter instanceof DummyExporter);

      assert.strictEqual(propagation['_getGlobalPropagator'](), propagator);
    });
  });
});
