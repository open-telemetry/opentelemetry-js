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
  diag,
} from '@opentelemetry/api';
import { TraceState } from '@opentelemetry/core';
import {
  defaultResource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import * as assert from 'assert';
import * as sinon from 'sinon';
import {
  BasicTracerProvider,
  NoopSpanProcessor,
  Span,
  AlwaysOnSampler,
  AlwaysOffSampler,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '../../src';
import { SpanImpl } from '../../src/Span';
import { MultiSpanProcessor } from '../../src/MultiSpanProcessor';
import { Tracer } from '../../src/Tracer';

describe('BasicTracerProvider', () => {
  beforeEach(() => {
    context.disable();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    describe('when options not defined', () => {
      it('should construct an instance', () => {
        const tracer = new BasicTracerProvider();
        assert.ok(tracer instanceof BasicTracerProvider);
      });

      it('should use empty span processor by default', () => {
        const errorStub = sinon.spy(diag, 'error');
        const tracer = new BasicTracerProvider();

        assert.ok(tracer['_activeSpanProcessor'] instanceof MultiSpanProcessor);
        assert.strictEqual(
          tracer['_activeSpanProcessor']['_spanProcessors'].length,
          0
        );
        sinon.assert.notCalled(errorStub);
      });
    });

    describe('when user sets span processors', () => {
      it('should use the span processors defined in the config', () => {
        const traceExporter = new ConsoleSpanExporter();
        const spanProcessor = new SimpleSpanProcessor(traceExporter);
        const tracer = new BasicTracerProvider({
          spanProcessors: [spanProcessor],
        });

        assert.ok(tracer['_activeSpanProcessor'] instanceof MultiSpanProcessor);
        assert.ok(
          tracer['_activeSpanProcessor']['_spanProcessors'].length === 1
        );
        assert.ok(
          tracer['_activeSpanProcessor']['_spanProcessors'][0] instanceof
            SimpleSpanProcessor
        );
        assert.ok(
          tracer['_activeSpanProcessor']['_spanProcessors'][0][
            '_exporter'
          ] instanceof ConsoleSpanExporter
        );
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

    describe('when "tracerFactory" option defined', () => {
      it('should use custom tracer factory when provided', () => {
        const customTracerFactory = sinon
          .stub()
          .returns(
            new Tracer(
              { name: 'test', version: '1.0.0' },
              {},
              defaultResource(),
              new NoopSpanProcessor()
            )
          );

        const tracerProvider = new BasicTracerProvider({
          tracerFactory: customTracerFactory,
        });

        const tracer = tracerProvider.getTracer('test-tracer');

        sinon.assert.calledOnce(customTracerFactory);

        assert.ok(tracer instanceof Tracer);
      });

      it('should use default factory when tracerFactory is undefined', () => {
        const tracerProvider = new BasicTracerProvider({});
        const tracer = tracerProvider.getTracer('default-tracer');

        assert.ok(tracer instanceof Tracer);
      });
    });

    describe('generalLimits', () => {
      describe('when not defined default values', () => {
        it('should have tracer with default values', () => {
          const tracer = new BasicTracerProvider({}).getTracer(
            'default'
          ) as Tracer;
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
          }).getTracer('default') as Tracer;
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
          }).getTracer('default') as Tracer;
          const generalLimits = tracer.getGeneralLimits();
          assert.strictEqual(generalLimits.attributeValueLengthLimit, 10);
        });

        it('should have tracer with negative "attributeValueLengthLimit" value', () => {
          const tracer = new BasicTracerProvider({
            generalLimits: {
              attributeValueLengthLimit: -10,
            },
          }).getTracer('default') as Tracer;
          const generalLimits = tracer.getGeneralLimits();
          assert.strictEqual(generalLimits.attributeValueLengthLimit, -10);
        });
      });
    });

    describe('spanLimits', () => {
      describe('when not defined default values', () => {
        it('should have tracer with default values', () => {
          const tracer = new BasicTracerProvider({}).getTracer(
            'default'
          ) as Tracer;
          assert.deepStrictEqual(tracer.getSpanLimits(), {
            attributeValueLengthLimit: Infinity,
            attributeCountLimit: 128,
            eventCountLimit: 128,
            linkCountLimit: 128,
            attributePerEventCountLimit: 128,
            attributePerLinkCountLimit: 128,
          });
        });
      });

      describe('when "attributeCountLimit" is defined', () => {
        it('should have tracer with defined value', () => {
          const tracer = new BasicTracerProvider({
            spanLimits: {
              attributeCountLimit: 100,
            },
          }).getTracer('default') as Tracer;
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
          }).getTracer('default') as Tracer;
          const spanLimits = tracer.getSpanLimits();
          assert.strictEqual(spanLimits.attributeValueLengthLimit, 10);
        });

        it('should have tracer with negative "attributeValueLengthLimit" value', () => {
          const tracer = new BasicTracerProvider({
            spanLimits: {
              attributeValueLengthLimit: -10,
            },
          }).getTracer('default') as Tracer;
          const spanLimits = tracer.getSpanLimits();
          assert.strictEqual(spanLimits.attributeValueLengthLimit, -10);
        });
      });

      describe('when attribute value length limit is not defined', () => {
        it('should use default value of Infinity', () => {
          const tracer = new BasicTracerProvider().getTracer(
            'default'
          ) as Tracer;
          const spanLimits = tracer.getSpanLimits();
          const generalLimits = tracer.getGeneralLimits();
          assert.strictEqual(generalLimits.attributeValueLengthLimit, Infinity);
          assert.strictEqual(spanLimits.attributeValueLengthLimit, Infinity);
        });
      });

      describe('when attribute count limit is not defined', () => {
        it('should use default value of 128', () => {
          const tracer = new BasicTracerProvider().getTracer(
            'default'
          ) as Tracer;
          const spanLimits = tracer.getSpanLimits();
          const generalLimits = tracer.getGeneralLimits();
          assert.strictEqual(generalLimits.attributeCountLimit, 128);
          assert.strictEqual(spanLimits.attributeCountLimit, 128);
        });
      });

      describe('when "eventCountLimit" is defined', () => {
        it('should have tracer with defined value', () => {
          const tracer = new BasicTracerProvider({
            spanLimits: {
              eventCountLimit: 300,
            },
          }).getTracer('default') as Tracer;
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
          }).getTracer('default') as Tracer;
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
          }).getTracer('default') as Tracer;
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
          }).getTracer('default') as Tracer;
          const spanLimits = tracer.getSpanLimits();
          assert.strictEqual(spanLimits.attributeValueLengthLimit, 10);
          assert.strictEqual(spanLimits.attributeCountLimit, 20);
        });
      });
    });
  });

  describe('.startSpan()', () => {
    it('should start a span with name only', () => {
      const tracer = new BasicTracerProvider().getTracer('default');
      const span = tracer.startSpan('my-span');
      assert.ok(span);
      assert.ok(span instanceof SpanImpl);
    });

    it('should propagate resources', () => {
      const tracerProvider = new BasicTracerProvider();
      const tracer = tracerProvider.getTracer('default') as Tracer;
      const span = tracer.startSpan('my-span') as Span;
      assert.strictEqual(tracer['_resource'], tracerProvider['_resource']);
      assert.strictEqual(span.resource, tracerProvider['_resource']);
    });

    it('should start a span with name and options', () => {
      const tracer = new BasicTracerProvider().getTracer('default');
      const span = tracer.startSpan('my-span', {});
      assert.ok(span);
      assert.ok(span instanceof SpanImpl);
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
      assert.ok(span instanceof SpanImpl);
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
      assert.notStrictEqual(
        context.traceId,
        overrideParent.spanContext().traceId
      );
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
          'invalid-parent' as unknown as SpanContext
        )
      );
      assert.ok(span instanceof SpanImpl);
      assert.deepStrictEqual(
        (span as Span).parentSpanContext?.spanId,
        undefined
      );
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
      assert.ok(span instanceof SpanImpl);
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
      assert.ok(span instanceof SpanImpl);
      assert.strictEqual(span.spanContext().traceFlags, TraceFlags.SAMPLED);
      assert.strictEqual(span.isRecording(), true);
    });

    it('should assign a resource', () => {
      const tracer = new BasicTracerProvider().getTracer('default');
      const span = tracer.startSpan('my-span') as Span;
      assert.ok(span);
      assert.ok(span.resource);
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

      const spanProcessorOne = new NoopSpanProcessor();
      const spanProcessorTwo = new NoopSpanProcessor();
      const tracerProvider = new BasicTracerProvider({
        spanProcessors: [spanProcessorOne, spanProcessorTwo],
      });

      tracerProvider
        .forceFlush()
        .then(() => {
          sinon.restore();
          assert.ok(forceFlushStub.calledTwice);
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

      const spanProcessorOne = new NoopSpanProcessor();
      const spanProcessorTwo = new NoopSpanProcessor();
      const tracerProvider = new BasicTracerProvider({
        spanProcessors: [spanProcessorOne, spanProcessorTwo],
      });

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
    it('should use the default resource when no resource is provided', function () {
      const tracerProvider = new BasicTracerProvider();
      assert.deepStrictEqual(tracerProvider['_resource'], defaultResource());
    });

    it('should use not use the default if resource passed', function () {
      const providedResource = resourceFromAttributes({ foo: 'bar' });
      const tracerProvider = new BasicTracerProvider({
        resource: providedResource,
      });
      assert.deepStrictEqual(tracerProvider['_resource'], providedResource);
    });
  });

  describe('.shutdown()', () => {
    it('should trigger shutdown when manually invoked', () => {
      const tracerProvider = new BasicTracerProvider();
      const shutdownStub = sinon.stub(
        tracerProvider['_activeSpanProcessor'],
        'shutdown'
      );
      tracerProvider.shutdown();
      sinon.assert.calledOnce(shutdownStub);
    });
  });
});
