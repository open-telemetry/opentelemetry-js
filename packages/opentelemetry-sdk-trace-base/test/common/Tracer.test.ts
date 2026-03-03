/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  Attributes,
  Context,
  context,
  createContextKey,
  createTraceState,
  INVALID_TRACEID,
  Link,
  ROOT_CONTEXT,
  SpanContext,
  SpanKind,
  trace,
  TraceFlags,
  TraceState,
} from '@opentelemetry/api';
import {
  InstrumentationScope,
  sanitizeAttributes,
  suppressTracing,
} from '@opentelemetry/core';
import * as assert from 'assert';
import {
  AlwaysOffSampler,
  AlwaysOnSampler,
  BasicTracerProvider,
  Sampler,
  SamplingDecision,
  Span,
  SpanProcessor,
} from '../../src';
import { TestStackContextManager } from './export/TestStackContextManager';
import * as sinon from 'sinon';
import { invalidAttributes, validAttributes } from './util';
import { Tracer } from '../../src/Tracer';

describe('Tracer', () => {
  const tracerProvider = new BasicTracerProvider();

  class TestSampler implements Sampler {
    private readonly traceState?: TraceState;

    constructor(traceState?: TraceState) {
      this.traceState = traceState;
    }

    shouldSample(
      _context: Context,
      _traceId: string,
      _spanName: string,
      _spanKind: SpanKind,
      attributes: Attributes,
      links: Link[]
    ) {
      // The attributes object should be valid.
      assert.deepStrictEqual(sanitizeAttributes(attributes), attributes);
      links.forEach(link => {
        assert.deepStrictEqual(
          sanitizeAttributes(link.attributes),
          link.attributes
        );
      });
      return {
        decision: SamplingDecision.RECORD_AND_SAMPLED,
        attributes: {
          testAttribute: 'foobar',
          // invalid attributes should be sanitized.
          ...invalidAttributes,
        } as unknown as Attributes,
        traceState: this.traceState,
      };
    }
  }

  class DummySpanProcessor implements SpanProcessor {
    forceFlush() {
      return Promise.resolve();
    }
    onStart() {}
    onEnd() {}
    shutdown() {
      return Promise.resolve();
    }
  }

  beforeEach(() => {
    const contextManager = new TestStackContextManager().enable();
    context.setGlobalContextManager(contextManager);
  });

  afterEach(() => {
    context.disable();
  });

  it('should create a Tracer instance', () => {
    const tracer = new Tracer(
      { name: 'default', version: '0.0.1' },
      {},
      tracerProvider['_resource'],
      tracerProvider['_activeSpanProcessor']
    );
    assert.ok(tracer instanceof Tracer);
  });

  it('should use an ParentBasedSampler by default', () => {
    const tracer = new Tracer(
      { name: 'default', version: '0.0.1' },
      {},
      tracerProvider['_resource'],
      tracerProvider['_activeSpanProcessor']
    );
    assert.strictEqual(
      tracer['_sampler'].toString(),
      'ParentBased{root=AlwaysOnSampler, remoteParentSampled=AlwaysOnSampler, remoteParentNotSampled=AlwaysOffSampler, localParentSampled=AlwaysOnSampler, localParentNotSampled=AlwaysOffSampler}'
    );
  });

  it('should respect NO_RECORD sampling result', () => {
    const tracer = new Tracer(
      { name: 'default', version: '0.0.1' },
      { sampler: new AlwaysOffSampler() },
      tracerProvider['_resource'],
      tracerProvider['_activeSpanProcessor']
    );
    const span = tracer.startSpan('span1');
    assert.ok(!span.isRecording());
    span.end();
  });

  it('should respect RECORD_AND_SAMPLE sampling result', () => {
    const tracer = new Tracer(
      { name: 'default', version: '0.0.1' },
      { sampler: new AlwaysOnSampler() },
      tracerProvider['_resource'],
      tracerProvider['_activeSpanProcessor']
    );
    const span = tracer.startSpan('span2');
    assert.ok(span.isRecording());
    span.end();
  });

  it('should start a span with attributes in sampling result', () => {
    const tracer = new Tracer(
      { name: 'default', version: '0.0.1' },
      { sampler: new TestSampler() },
      tracerProvider['_resource'],
      tracerProvider['_activeSpanProcessor']
    );
    const span = tracer.startSpan('span3');
    assert.strictEqual((span as Span).attributes.testAttribute, 'foobar');
    span.end();
  });

  it('should start a span with traceState in sampling result', () => {
    const traceState = createTraceState();
    const tracer = new Tracer(
      { name: 'default', version: '0.0.1' },
      { sampler: new TestSampler(traceState) },
      tracerProvider['_resource'],
      tracerProvider['_activeSpanProcessor']
    );
    const span = tracer.startSpan('stateSpan');
    assert.strictEqual(span.spanContext().traceState, traceState);
  });

  it('should have an instrumentationScope', () => {
    const tracer = new Tracer(
      { name: 'default', version: '0.0.1' },
      {},
      tracerProvider['_resource'],
      tracerProvider['_activeSpanProcessor']
    );

    const lib: InstrumentationScope = tracer.instrumentationScope;

    assert.strictEqual(lib.name, 'default');
    assert.strictEqual(lib.version, '0.0.1');
  });

  describe('when suppressTracing true', () => {
    const context = suppressTracing(ROOT_CONTEXT);

    it('should return cached no-op span ', done => {
      const tracer = new Tracer(
        { name: 'default', version: '0.0.1' },
        { sampler: new TestSampler() },
        tracerProvider['_resource'],
        tracerProvider['_activeSpanProcessor']
      );

      const span = tracer.startSpan('span3', undefined, context);

      assert.ok(!span.isRecording());
      span.end();

      done();
    });
  });

  it('should use traceId, spanId and traceState from parent', () => {
    const traceState = createTraceState();
    const parent: SpanContext = {
      traceId: '00112233445566778899001122334455',
      spanId: '0011223344556677',
      traceFlags: TraceFlags.SAMPLED,
      traceState,
    };
    const tracer = new Tracer(
      { name: 'default', version: '0.0.1' },
      {},
      tracerProvider['_resource'],
      tracerProvider['_activeSpanProcessor']
    );
    const span = tracer.startSpan(
      'aSpan',
      undefined,
      trace.setSpanContext(ROOT_CONTEXT, parent)
    );
    assert.strictEqual((span as Span).parentSpanContext?.spanId, parent.spanId);
    assert.strictEqual(span.spanContext().traceId, parent.traceId);
    assert.strictEqual(span.spanContext().traceState, traceState);
  });

  it('should not use spanId from invalid parent', () => {
    const parent: SpanContext = {
      traceId: INVALID_TRACEID,
      spanId: '0011223344556677',
      traceFlags: TraceFlags.SAMPLED,
    };
    const tracer = new Tracer(
      { name: 'default', version: '0.0.1' },
      {},
      tracerProvider['_resource'],
      tracerProvider['_activeSpanProcessor']
    );
    const span = tracer.startSpan(
      'aSpan',
      undefined,
      trace.setSpanContext(ROOT_CONTEXT, parent)
    );
    assert.strictEqual((span as Span).parentSpanContext?.spanId, undefined);
  });

  it('should pass the same context to sampler and spanprocessor', () => {
    const parent: SpanContext = {
      traceId: '00112233445566778899001122334455',
      spanId: '0011223344556677',
      traceFlags: TraceFlags.SAMPLED,
    };
    const context = trace.setSpanContext(ROOT_CONTEXT, parent);

    const sp: SpanProcessor = new DummySpanProcessor();
    const onStartSpy = sinon.spy(sp, 'onStart');
    const tp = new BasicTracerProvider({
      spanProcessors: [sp],
    });

    const sampler: Sampler = new AlwaysOnSampler();
    const shouldSampleSpy = sinon.spy(sampler, 'shouldSample');
    const tracer = new Tracer(
      { name: 'default' },
      { sampler },
      tp['_resource'],
      tp['_activeSpanProcessor']
    );
    const span = tracer.startSpan('a', {}, context) as Span;
    assert.strictEqual(span.parentSpanContext?.spanId, parent.spanId);
    sinon.assert.calledOnceWithExactly(
      shouldSampleSpy,
      context,
      parent.traceId,
      'a',
      SpanKind.INTERNAL,
      {},
      []
    );
    sinon.assert.calledOnceWithExactly(onStartSpy, span, context);
  });

  it('should pass the same context to sampler and spanprocessor if options.root is true', () => {
    const parent: SpanContext = {
      traceId: '00112233445566778899001122334455',
      spanId: '0011223344556677',
      traceFlags: TraceFlags.SAMPLED,
    };
    const context = trace.setSpanContext(ROOT_CONTEXT, parent);

    const sp: SpanProcessor = new DummySpanProcessor();
    const onStartSpy = sinon.spy(sp, 'onStart');
    const tp = new BasicTracerProvider({
      spanProcessors: [sp],
    });

    const sampler: Sampler = new AlwaysOnSampler();
    const shouldSampleSpy = sinon.spy(sampler, 'shouldSample');
    const tracer = new Tracer(
      { name: 'default' },
      { sampler },
      tp['_resource'],
      tp['_activeSpanProcessor']
    );
    const span = tracer.startSpan('a', { root: true }, context) as Span;
    assert.strictEqual(span.parentSpanContext?.spanId, undefined);
    sinon.assert.calledOnce(shouldSampleSpy);
    sinon.assert.calledOnce(onStartSpy);
    const samplerContext = shouldSampleSpy.firstCall.args[0];
    const processorContext = onStartSpy.firstCall.args[1];
    assert.strictEqual(samplerContext, processorContext);
    assert.strictEqual(trace.getSpan(samplerContext), undefined);
  });

  it('should start an active span with name and function args', () => {
    const tracer = new Tracer(
      { name: 'default', version: '0.0.1' },
      { sampler: new TestSampler() },
      tracerProvider['_resource'],
      tracerProvider['_activeSpanProcessor']
    );

    const spy = sinon.spy(tracer, 'startSpan');

    assert.strictEqual(
      tracer.startActiveSpan('my-span', span => {
        try {
          assert.ok(spy.calledWith('my-span'));
          assert.strictEqual(trace.getSpan(context.active()), span);
          return 1;
        } finally {
          span.end();
        }
      }),
      1
    );
  });

  it('should start an active span with name, options and function args', () => {
    const tracer = new Tracer(
      { name: 'default', version: '0.0.1' },
      { sampler: new TestSampler() },
      tracerProvider['_resource'],
      tracerProvider['_activeSpanProcessor']
    );

    const spy = sinon.spy(tracer, 'startSpan');

    assert.strictEqual(
      tracer.startActiveSpan(
        'my-span',
        { attributes: { foo: 'bar' } },
        span => {
          try {
            assert.ok(
              spy.calledWith('my-span', { attributes: { foo: 'bar' } })
            );
            assert.strictEqual(trace.getSpan(context.active()), span);
            return 1;
          } finally {
            span.end();
          }
        }
      ),
      1
    );
  });

  it('should start an active span with name, options, context and function args', () => {
    const tracer = new Tracer(
      { name: 'default', version: '0.0.1' },
      { sampler: new TestSampler() },
      tracerProvider['_resource'],
      tracerProvider['_activeSpanProcessor']
    );

    const ctxKey = createContextKey('foo');

    const ctx = context.active().setValue(ctxKey, 'bar');

    const spy = sinon.spy(tracer, 'startSpan');

    assert.strictEqual(
      tracer.startActiveSpan(
        'my-span',
        { attributes: { foo: 'bar' } },
        ctx,
        span => {
          try {
            assert.ok(
              spy.calledWith('my-span', { attributes: { foo: 'bar' } }, ctx)
            );
            assert.strictEqual(trace.getSpan(context.active()), span);
            assert.strictEqual(ctx.getValue(ctxKey), 'bar');
            return 1;
          } finally {
            span.end();
          }
        }
      ),
      1
    );
  });

  it('should sample with valid attributes', () => {
    const tracer = new Tracer(
      { name: 'default', version: '0.0.1' },
      { sampler: new TestSampler() },
      tracerProvider['_resource'],
      tracerProvider['_activeSpanProcessor']
    );

    const attributes = {
      ...validAttributes,
      ...invalidAttributes,
    } as unknown as Attributes;
    const links = [
      {
        context: {
          traceId: 'b3cda95b652f4a1592b449d5929fda1b',
          spanId: '6e0c63257de34c92',
          traceFlags: TraceFlags.SAMPLED,
        },
        attributes: { ...attributes },
      },
    ];
    // TestSampler should validate the attributes and links.
    const span = tracer.startSpan('my-span', { attributes, links }) as Span;
    span.end();

    assert.deepStrictEqual(span.attributes, {
      ...validAttributes,
      testAttribute: 'foobar',
    });
    assert.strictEqual(span.links.length, 1);
    assert.deepStrictEqual(span.links[0].attributes, validAttributes);
  });
});
