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
  context,
  trace,
  SpanContext,
  TraceFlags,
  ROOT_CONTEXT,
  TextMapPropagator,
  TextMapSetter,
  Context,
  TextMapGetter,
  propagation,
  diag,
} from '@opentelemetry/api';
import { CompositePropagator } from '@opentelemetry/core';
import {
  AlwaysOnSampler,
  AlwaysOffSampler,
  TraceState,
} from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import * as assert from 'assert';
import * as sinon from 'sinon';
import {
  BasicTracerProvider,
  NoopSpanProcessor,
  Span,
  InMemorySpanExporter,
  SpanExporter,
  BatchSpanProcessor,
} from '../../src';

describe('BasicTracerProvider', () => {
  let removeEvent: (() => void) | undefined;

  let envSource: Record<string, any>;
  if (typeof process === 'undefined') {
    envSource = (globalThis as unknown) as Record<string, any>;
  } else {
    envSource = process.env as Record<string, any>;
  }

  beforeEach(() => {
    context.disable();
  });

  afterEach(() => {
    sinon.restore();
    if (removeEvent) {
      removeEvent();
      removeEvent = undefined;
    }
  });

  describe('constructor', () => {
    describe('when options not defined', () => {
      it('should construct an instance', () => {
        const tracer = new BasicTracerProvider();
        assert.ok(tracer instanceof BasicTracerProvider);
      });

      it('should use noop span processor by default', () => {
        const tracer = new BasicTracerProvider();
        assert.ok(tracer.activeSpanProcessor instanceof NoopSpanProcessor);
      });
    });

    describe('when "sampler" option defined', () => {
      it('should have an instance with sampler', () => {
        const tracer = new BasicTracerProvider({
          sampler: new AlwaysOnSampler(),
        });
        assert.ok(tracer instanceof BasicTracerProvider);
      });
    });

    describe('generalLimits', () => {
      describe('when not defined default values', () => {
        it('should have tracer with default values', () => {
          const tracer = new BasicTracerProvider({}).getTracer('default');
          assert.deepStrictEqual(tracer.getGeneralLimits(), {
            attributeValueLengthLimit: Infinity,
            attributeCountLimit: 128,
          });
        });
      });

      describe('when "attributeCountLimit" is defined', () => {
        it('should have tracer with defined value', () => {
          const tracer = new BasicTracerProvider({
            generalLimits: {
              attributeCountLimit: 100,
            },
          }).getTracer('default');
          const generalLimits = tracer.getGeneralLimits();
          assert.strictEqual(generalLimits.attributeCountLimit, 100);
        });
      });

      describe('when "attributeValueLengthLimit" is defined', () => {
        it('should have tracer with defined value', () => {
          const tracer = new BasicTracerProvider({
            generalLimits: {
              attributeValueLengthLimit: 10,
            },
          }).getTracer('default');
          const generalLimits = tracer.getGeneralLimits();
          assert.strictEqual(generalLimits.attributeValueLengthLimit, 10);
        });

        it('should have tracer with negative "attributeValueLengthLimit" value', () => {
          const tracer = new BasicTracerProvider({
            generalLimits: {
              attributeValueLengthLimit: -10,
            },
          }).getTracer('default');
          const generalLimits = tracer.getGeneralLimits();
          assert.strictEqual(generalLimits.attributeValueLengthLimit, -10);
        });
      });
    });

    describe('spanLimits', () => {
      describe('when not defined default values', () => {
        it('should have tracer with default values', () => {
          const tracer = new BasicTracerProvider({}).getTracer('default');
          assert.deepStrictEqual(tracer.getSpanLimits(), {
            attributeValueLengthLimit: Infinity,
            attributeCountLimit: 128,
            eventCountLimit: 128,
            linkCountLimit: 128,
          });
        });
      });

      describe('when "attributeCountLimit" is defined', () => {
        it('should have tracer with defined value', () => {
          const tracer = new BasicTracerProvider({
            spanLimits: {
              attributeCountLimit: 100,
            },
          }).getTracer('default');
          const spanLimits = tracer.getSpanLimits();
          assert.strictEqual(spanLimits.attributeCountLimit, 100);
        });
      });

      describe('when "attributeValueLengthLimit" is defined', () => {
        it('should have tracer with defined value', () => {
          const tracer = new BasicTracerProvider({
            spanLimits: {
              attributeValueLengthLimit: 10,
            },
          }).getTracer('default');
          const spanLimits = tracer.getSpanLimits();
          assert.strictEqual(spanLimits.attributeValueLengthLimit, 10);
        });

        it('should have tracer with negative "attributeValueLengthLimit" value', () => {
          const tracer = new BasicTracerProvider({
            spanLimits: {
              attributeValueLengthLimit: -10,
            },
          }).getTracer('default');
          const spanLimits = tracer.getSpanLimits();
          assert.strictEqual(spanLimits.attributeValueLengthLimit, -10);
        });
      });

      describe('when "eventCountLimit" is defined', () => {
        it('should have tracer with defined value', () => {
          const tracer = new BasicTracerProvider({
            spanLimits: {
              eventCountLimit: 300,
            },
          }).getTracer('default');
          const spanLimits = tracer.getSpanLimits();
          assert.strictEqual(spanLimits.eventCountLimit, 300);
        });
      });

      describe('when "linkCountLimit" is defined', () => {
        it('should have tracer with defined value', () => {
          const tracer = new BasicTracerProvider({
            spanLimits: {
              linkCountLimit: 10,
            },
          }).getTracer('default');
          const spanLimits = tracer.getSpanLimits();
          assert.strictEqual(spanLimits.linkCountLimit, 10);
        });
      });

      describe('when only generalLimits are defined', () => {
        it('should have span limits as general limits', () => {
          const tracer = new BasicTracerProvider({
            generalLimits: {
              attributeValueLengthLimit: 100,
              attributeCountLimit: 200,
            },
          }).getTracer('default');
          const spanLimits = tracer.getSpanLimits();
          assert.strictEqual(spanLimits.attributeValueLengthLimit, 100);
          assert.strictEqual(spanLimits.attributeCountLimit, 200);
        });
      });

      describe('when both generalLimits and spanLimits defined', () => {
        it('should have span limits as priority than general limits', () => {
          const tracer = new BasicTracerProvider({
            generalLimits: {
              attributeValueLengthLimit: 100,
              attributeCountLimit: 200,
            },
            spanLimits: {
              attributeValueLengthLimit: 10,
              attributeCountLimit: 20,
            },
          }).getTracer('default');
          const spanLimits = tracer.getSpanLimits();
          assert.strictEqual(spanLimits.attributeValueLengthLimit, 10);
          assert.strictEqual(spanLimits.attributeCountLimit, 20);
        });
      });
    });
  });

  describe('.register()', () => {
    describe('propagator', () => {
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

      let setGlobalPropagatorStub: sinon.SinonSpy<
        [TextMapPropagator],
        boolean
      >;
      let originalPropagators: string | number | undefined | string[];
      beforeEach(() => {
        setGlobalPropagatorStub = sinon.spy(propagation, 'setGlobalPropagator');
        originalPropagators = envSource.OTEL_PROPAGATORS;
      });

      afterEach(() => {
        setGlobalPropagatorStub.restore();

        // otherwise we may assign 'undefined' (a string)
        if (originalPropagators !== undefined) {
          envSource.OTEL_PROPAGATORS = originalPropagators;
        } else {
          delete envSource.OTEL_PROPAGATORS;
        }
      });

      it('should be set to a given value if it it provided', () => {
        const provider = new BasicTracerProvider();
        provider.register({
          propagator: new DummyPropagator(),
        });
        assert.ok(
          setGlobalPropagatorStub.calledOnceWithExactly(
            sinon.match.instanceOf(DummyPropagator)
          )
        );
      });

      it('should be composite if 2 or more propagators provided in an environment variable', () => {
        const provider = new BasicTracerProvider();
        provider.register();

        assert.ok(
          setGlobalPropagatorStub.calledOnceWithExactly(
            sinon.match.instanceOf(CompositePropagator)
          )
        );
        assert.deepStrictEqual(setGlobalPropagatorStub.args[0][0].fields(), [
          'traceparent',
          'tracestate',
          'baggage',
        ]);
      });

      it('warns if there is no propagator registered with a given name', () => {
        const warnStub = sinon.spy(diag, 'warn');

        envSource.OTEL_PROPAGATORS = 'missing-propagator';
        const provider = new BasicTracerProvider({});
        provider.register();

        assert.ok(
          warnStub.calledOnceWithExactly(
            'Propagator "missing-propagator" requested through environment variable is unavailable.'
          )
        );

        warnStub.restore();
      });
    });

    describe('exporter', () => {
      class CustomTracerProvider extends BasicTracerProvider {
        protected override _getSpanExporter(name: string): SpanExporter | undefined {
          return name === 'memory'
            ? new InMemorySpanExporter()
            : BasicTracerProvider._registeredExporters.get(name)?.();
        }
      }

      afterEach(() => {
        delete envSource.OTEL_TRACES_EXPORTER;
      });

      it('logs error if there is no exporter registered with a given name', () => {
        const errorStub = sinon.spy(diag, 'error');

        envSource.OTEL_TRACES_EXPORTER = 'missing-exporter';
        const provider = new BasicTracerProvider({});
        provider.register();
        assert.ok(
          errorStub.getCall(0).args[0] ===
          'Exporter "missing-exporter" requested through environment variable is unavailable.'
        );
        errorStub.restore();
      });

      it('registers trace exporter from environment variable', () => {
        envSource.OTEL_TRACES_EXPORTER = 'memory';
        const provider = new CustomTracerProvider({});
        provider.register();
        const processor = provider.getActiveSpanProcessor();
        assert(processor instanceof BatchSpanProcessor);
        // @ts-expect-error access configured to verify its the correct one
        const exporter = processor._exporter;
        assert(exporter instanceof InMemorySpanExporter);
      });
    });
  });

  describe('.startSpan()', () => {
    it('should start a span with name only', () => {
      const tracer = new BasicTracerProvider().getTracer('default');
      const span = tracer.startSpan('my-span');
      assert.ok(span);
      assert.ok(span instanceof Span);
    });

    it('should propagate resources', () => {
      const tracerProvider = new BasicTracerProvider();
      const tracer = tracerProvider.getTracer('default');
      const span = tracer.startSpan('my-span') as Span;
      assert.strictEqual(tracer.resource, tracerProvider.resource);
      assert.strictEqual(span.resource, tracerProvider.resource);
    });

    it('should start a span with name and options', () => {
      const tracer = new BasicTracerProvider().getTracer('default');
      const span = tracer.startSpan('my-span', {});
      assert.ok(span);
      assert.ok(span instanceof Span);
      const context = span.spanContext();
      assert.ok(context.traceId.match(/[a-f0-9]{32}/));
      assert.ok(context.spanId.match(/[a-f0-9]{16}/));
      assert.strictEqual(context.traceFlags, TraceFlags.SAMPLED);
      assert.deepStrictEqual(context.traceState, undefined);
      span.end();
    });

    it('should start a span with given attributes', () => {
      const tracer = new BasicTracerProvider().getTracer('default');
      const span = tracer.startSpan('my-span', {
        attributes: { foo: 'foo', bar: 'bar' },
      }) as Span;
      assert.deepStrictEqual(span.attributes, { bar: 'bar', foo: 'foo' });
      span.end();
    });

    it('should start a span with spanoptions->attributes', () => {
      const tracer = new BasicTracerProvider().getTracer('default');
      const span = tracer.startSpan('my-span', {
        attributes: { foo: 'foo', bar: 'bar' },
      }) as Span;
      assert.deepStrictEqual(span.attributes, { foo: 'foo', bar: 'bar' });
      span.end();
    });

    it('should start a span with name and parent spancontext', () => {
      const tracer = new BasicTracerProvider().getTracer('default');
      const state = new TraceState('a=1,b=2');

      const span = tracer.startSpan(
        'my-span',
        {},
        trace.setSpanContext(ROOT_CONTEXT, {
          traceId: 'd4cda95b652f4a1592b449d5929fda1b',
          spanId: '6e0c63257de34c92',
          traceFlags: TraceFlags.SAMPLED,
          traceState: state,
        })
      );
      assert.ok(span instanceof Span);
      const context = span.spanContext();
      assert.strictEqual(context.traceId, 'd4cda95b652f4a1592b449d5929fda1b');
      assert.strictEqual(context.traceFlags, TraceFlags.SAMPLED);
      assert.deepStrictEqual(context.traceState, state);
      span.end();
    });

    it('should start a span with name and parent span', () => {
      const tracer = new BasicTracerProvider().getTracer('default');
      const span = tracer.startSpan('my-span');
      const childSpan = tracer.startSpan(
        'child-span',
        {},
        trace.setSpan(ROOT_CONTEXT, span)
      );
      const context = childSpan.spanContext();
      assert.strictEqual(context.traceId, span.spanContext().traceId);
      assert.strictEqual(context.traceFlags, TraceFlags.SAMPLED);
      span.end();
      childSpan.end();
    });

    it('should create a root span when root is true', () => {
      const tracer = new BasicTracerProvider().getTracer('default');
      const span = tracer.startSpan('my-span');
      const overrideParent = tracer.startSpan('my-parent-override-span');
      const rootSpan = tracer.startSpan(
        'root-span',
        { root: true },
        trace.setSpan(ROOT_CONTEXT, span)
      );
      const context = rootSpan.spanContext();
      assert.notStrictEqual(context.traceId, overrideParent.spanContext().traceId);
      span.end();
      rootSpan.end();
    });

    it('should start a span with name and with invalid parent span', () => {
      const tracer = new BasicTracerProvider({
        sampler: new AlwaysOnSampler(),
      }).getTracer('default');
      const span = tracer.startSpan(
        'my-span',
        {},
        trace.setSpanContext(
          ROOT_CONTEXT,
          ('invalid-parent' as unknown) as SpanContext
        )
      );
      assert.ok(span instanceof Span);
      assert.deepStrictEqual((span as Span).parentSpanId, undefined);
    });

    it('should start a span with name and with invalid spancontext', () => {
      const tracer = new BasicTracerProvider().getTracer('default');
      const span = tracer.startSpan(
        'my-span',
        {},
        trace.setSpanContext(ROOT_CONTEXT, {
          traceId: '0',
          spanId: '0',
          traceFlags: TraceFlags.SAMPLED,
        })
      );
      assert.ok(span instanceof Span);
      const context = span.spanContext();
      assert.ok(context.traceId.match(/[a-f0-9]{32}/));
      assert.ok(context.spanId.match(/[a-f0-9]{16}/));
      assert.strictEqual(context.traceFlags, TraceFlags.SAMPLED);
      assert.deepStrictEqual(context.traceState, undefined);
    });

    it('should return a non recording span when never sampling', () => {
      const tracer = new BasicTracerProvider({
        sampler: new AlwaysOffSampler(),
      }).getTracer('default');
      const span = tracer.startSpan('my-span');
      assert.ok(!span.isRecording());
      const context = span.spanContext();
      assert.ok(context.traceId.match(/[a-f0-9]{32}/));
      assert.ok(context.spanId.match(/[a-f0-9]{16}/));
      assert.strictEqual(context.traceFlags, TraceFlags.NONE);
      assert.deepStrictEqual(context.traceState, undefined);
      span.end();
    });

    it('should create real span when sampled', () => {
      const tracer = new BasicTracerProvider({
        sampler: new AlwaysOnSampler(),
      }).getTracer('default');
      const span = tracer.startSpan('my-span');
      assert.ok(span instanceof Span);
      assert.strictEqual(span.spanContext().traceFlags, TraceFlags.SAMPLED);
      assert.strictEqual(span.isRecording(), true);
    });

    it('should assign a resource', () => {
      const tracer = new BasicTracerProvider().getTracer('default');
      const span = tracer.startSpan('my-span') as Span;
      assert.ok(span);
      assert.ok(span.resource instanceof Resource);
    });
  });

  describe('.withSpan()', () => {
    it('should run context with NoopContextManager context manager', done => {
      const tracer = new BasicTracerProvider().getTracer('default');
      const span = tracer.startSpan('my-span');
      context.with(trace.setSpan(context.active(), span), () => {
        assert.deepStrictEqual(trace.getSpan(context.active()), undefined);
        return done();
      });
    });
  });

  describe('.forceFlush()', () => {
    it('should call forceFlush on all registered span processors', done => {
      sinon.restore();
      const forceFlushStub = sinon.stub(
        NoopSpanProcessor.prototype,
        'forceFlush'
      );
      forceFlushStub.resolves();

      const tracerProvider = new BasicTracerProvider();
      const spanProcessorOne = new NoopSpanProcessor();
      const spanProcessorTwo = new NoopSpanProcessor();

      tracerProvider.addSpanProcessor(spanProcessorOne);
      tracerProvider.addSpanProcessor(spanProcessorTwo);

      tracerProvider
        .forceFlush()
        .then(() => {
          sinon.restore();
          assert(forceFlushStub.calledTwice);
          done();
        })
        .catch(error => {
          sinon.restore();
          done(error);
        });
    });

    it('should throw error when calling forceFlush on all registered span processors fails', done => {
      sinon.restore();

      const forceFlushStub = sinon.stub(
        NoopSpanProcessor.prototype,
        'forceFlush'
      );
      forceFlushStub.returns(Promise.reject('Error'));

      const tracerProvider = new BasicTracerProvider();
      const spanProcessorOne = new NoopSpanProcessor();
      const spanProcessorTwo = new NoopSpanProcessor();
      tracerProvider.addSpanProcessor(spanProcessorOne);
      tracerProvider.addSpanProcessor(spanProcessorTwo);

      tracerProvider
        .forceFlush()
        .then(() => {
          sinon.restore();
          done(new Error('Successful forceFlush not expected'));
        })
        .catch(_error => {
          sinon.restore();
          sinon.assert.calledTwice(forceFlushStub);
          done();
        });
    });
  });

  describe('.bind()', () => {
    it('should bind context with NoopContextManager context manager', done => {
      const tracer = new BasicTracerProvider().getTracer('default');
      const span = tracer.startSpan('my-span');
      const fn = () => {
        assert.deepStrictEqual(trace.getSpan(context.active()), undefined);
        return done();
      };
      const patchedFn = context.bind(trace.setSpan(context.active(), span), fn);
      return patchedFn();
    });
  });

  describe('.resource', () => {
    it('should return a Resource', () => {
      const tracerProvider = new BasicTracerProvider();
      assert.ok(tracerProvider.resource instanceof Resource);
    });
  });

  describe('.shutdown()', () => {
    it('should trigger shutdown when manually invoked', () => {
      const tracerProvider = new BasicTracerProvider();
      const shutdownStub = sinon.stub(
        tracerProvider.getActiveSpanProcessor(),
        'shutdown'
      );
      tracerProvider.shutdown();
      sinon.assert.calledOnce(shutdownStub);
    });
  });
});
