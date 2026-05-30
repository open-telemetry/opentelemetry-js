/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SpanContext } from '@opentelemetry/api';
import {
  context,
  trace,
  TraceFlags,
  ROOT_CONTEXT,
  diag,
} from '@opentelemetry/api';
import { TraceState } from '@opentelemetry/core';
import {
  defaultResource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import * as assert from 'assert';
import * as sinon from 'sinon';
import type { Span } from '../../src';
import {
  NoopSpanProcessor,
  AlwaysOnSampler,
  AlwaysOffSampler,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '../../src';
import { BasicTracerProvider } from '../../src';
import { TestRecordOnlySampler } from './export/TestRecordOnlySampler';
import {
  TestMetricReader,
  cheatResourceFromTracerProvider,
  cheatSpanLimitsFromTracer,
  cheatSpanProcessorsFromTracerProvider,
} from './util';

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

        assert.strictEqual(
          cheatSpanProcessorsFromTracerProvider(tracer).length,
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

        const processors = cheatSpanProcessorsFromTracerProvider(tracer);
        assert.ok(processors.length === 1);
        assert.ok(processors[0] instanceof SimpleSpanProcessor);
        assert.ok(processors[0]['_exporter'] instanceof ConsoleSpanExporter);
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

    describe('spanLimits', () => {
      describe('when not defined default values', () => {
        it('should have tracer with default values', () => {
          const tracer = new BasicTracerProvider({}).getTracer('default');
          assert.deepStrictEqual(cheatSpanLimitsFromTracer(tracer), {
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
          }).getTracer('default');
          const spanLimits = cheatSpanLimitsFromTracer(tracer);
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
          const spanLimits = cheatSpanLimitsFromTracer(tracer);
          assert.strictEqual(spanLimits.attributeValueLengthLimit, 10);
        });

        it('should have tracer with negative "attributeValueLengthLimit" value', () => {
          const tracer = new BasicTracerProvider({
            spanLimits: {
              attributeValueLengthLimit: -10,
            },
          }).getTracer('default');
          const spanLimits = cheatSpanLimitsFromTracer(tracer);
          assert.strictEqual(spanLimits.attributeValueLengthLimit, -10);
        });
      });
    });
  });

  describe('.startSpan()', () => {
    it('should start a span with name only', () => {
      const tracer = new BasicTracerProvider().getTracer('default');
      const span = tracer.startSpan('my-span');
      assert.ok(span);
    });

    it('should start a span with name and options', () => {
      const tracer = new BasicTracerProvider().getTracer('default');
      const span = tracer.startSpan('my-span', {});
      assert.ok(span);
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
      assert.deepStrictEqual(
        cheatResourceFromTracerProvider(tracerProvider),
        defaultResource()
      );
    });

    it('should use not use the default if resource passed', function () {
      const providedResource = resourceFromAttributes({ foo: 'bar' });
      const tracerProvider = new BasicTracerProvider({
        resource: providedResource,
      });
      assert.deepStrictEqual(
        cheatResourceFromTracerProvider(tracerProvider),
        providedResource
      );
    });
  });

  describe('TracerMetrics', () => {
    it('should record metrics for sampled spans', async () => {
      const metricReader = new TestMetricReader();
      const meterProvider = new MeterProvider({
        readers: [metricReader],
      });
      const tracerProvider = new BasicTracerProvider({
        meterProvider,
        sampler: new AlwaysOnSampler(),
      });
      const tracer = tracerProvider.getTracer('test');
      const span = tracer.startSpan('span');
      let { resourceMetrics } = await metricReader.collect();
      let metrics = resourceMetrics.scopeMetrics[0].metrics;
      let spansStartedMetric = metrics.find(
        metric => metric.descriptor.name === 'otel.sdk.span.started'
      );
      let spansLiveMetric = metrics.find(
        metric => metric.descriptor.name === 'otel.sdk.span.live'
      );
      assert.ok(spansStartedMetric);
      assert.strictEqual(spansStartedMetric.dataPoints[0].value, 1);
      assert.deepStrictEqual(spansStartedMetric.dataPoints[0].attributes, {
        'otel.span.parent.origin': 'none',
        'otel.span.sampling_result': 'RECORD_AND_SAMPLE',
      });
      assert.ok(spansLiveMetric);
      assert.strictEqual(spansLiveMetric.dataPoints[0].value, 1);
      assert.deepStrictEqual(spansLiveMetric.dataPoints[0].attributes, {
        'otel.span.sampling_result': 'RECORD_AND_SAMPLE',
      });
      span.end();
      ({ resourceMetrics } = await metricReader.collect());
      metrics = resourceMetrics.scopeMetrics[0].metrics;
      spansStartedMetric = metrics.find(
        metric => metric.descriptor.name === 'otel.sdk.span.started'
      );
      spansLiveMetric = metrics.find(
        metric => metric.descriptor.name === 'otel.sdk.span.live'
      );
      assert.ok(spansStartedMetric);
      assert.strictEqual(spansStartedMetric.dataPoints[0].value, 1);
      assert.deepStrictEqual(spansStartedMetric.dataPoints[0].attributes, {
        'otel.span.parent.origin': 'none',
        'otel.span.sampling_result': 'RECORD_AND_SAMPLE',
      });
      assert.ok(spansLiveMetric);
      assert.strictEqual(spansLiveMetric.dataPoints[0].value, 0);
      assert.deepStrictEqual(spansLiveMetric.dataPoints[0].attributes, {
        'otel.span.sampling_result': 'RECORD_AND_SAMPLE',
      });
    });

    it('should record metrics for record-only spans', async () => {
      const metricReader = new TestMetricReader();
      const meterProvider = new MeterProvider({
        readers: [metricReader],
      });
      const tracerProvider = new BasicTracerProvider({
        meterProvider,
        sampler: new TestRecordOnlySampler(),
      });
      const tracer = tracerProvider.getTracer('test');
      const span = tracer.startSpan('span');
      let { resourceMetrics } = await metricReader.collect();
      let metrics = resourceMetrics.scopeMetrics[0].metrics;
      let spansStartedMetric = metrics.find(
        metric => metric.descriptor.name === 'otel.sdk.span.started'
      );
      let spansLiveMetric = metrics.find(
        metric => metric.descriptor.name === 'otel.sdk.span.live'
      );
      assert.ok(spansStartedMetric);
      assert.strictEqual(spansStartedMetric.dataPoints[0].value, 1);
      assert.deepStrictEqual(spansStartedMetric.dataPoints[0].attributes, {
        'otel.span.parent.origin': 'none',
        'otel.span.sampling_result': 'RECORD_ONLY',
      });
      assert.ok(spansLiveMetric);
      assert.strictEqual(spansLiveMetric.dataPoints[0].value, 1);
      assert.deepStrictEqual(spansLiveMetric.dataPoints[0].attributes, {
        'otel.span.sampling_result': 'RECORD_ONLY',
      });
      span.end();
      ({ resourceMetrics } = await metricReader.collect());
      metrics = resourceMetrics.scopeMetrics[0].metrics;
      spansStartedMetric = metrics.find(
        metric => metric.descriptor.name === 'otel.sdk.span.started'
      );
      spansLiveMetric = metrics.find(
        metric => metric.descriptor.name === 'otel.sdk.span.live'
      );
      assert.ok(spansStartedMetric);
      assert.strictEqual(spansStartedMetric.dataPoints[0].value, 1);
      assert.deepStrictEqual(spansStartedMetric.dataPoints[0].attributes, {
        'otel.span.parent.origin': 'none',
        'otel.span.sampling_result': 'RECORD_ONLY',
      });
      assert.ok(spansLiveMetric);
      assert.strictEqual(spansLiveMetric.dataPoints[0].value, 0);
      assert.deepStrictEqual(spansLiveMetric.dataPoints[0].attributes, {
        'otel.span.sampling_result': 'RECORD_ONLY',
      });
    });

    it('should record metrics for dropped spans', async () => {
      const metricReader = new TestMetricReader();
      const meterProvider = new MeterProvider({
        readers: [metricReader],
      });
      const tracerProvider = new BasicTracerProvider({
        meterProvider,
        sampler: new AlwaysOffSampler(),
      });
      const tracer = tracerProvider.getTracer('test');
      const span = tracer.startSpan('span');
      let { resourceMetrics } = await metricReader.collect();
      let metrics = resourceMetrics.scopeMetrics[0].metrics;
      let spansStartedMetric = metrics.find(
        metric => metric.descriptor.name === 'otel.sdk.span.started'
      );
      let spansLiveMetric = metrics.find(
        metric => metric.descriptor.name === 'otel.sdk.span.live'
      );
      assert.ok(spansStartedMetric);
      assert.strictEqual(spansStartedMetric.dataPoints[0].value, 1);
      assert.deepStrictEqual(spansStartedMetric.dataPoints[0].attributes, {
        'otel.span.parent.origin': 'none',
        'otel.span.sampling_result': 'DROP',
      });
      assert.strictEqual(spansLiveMetric, undefined);
      span.end();
      ({ resourceMetrics } = await metricReader.collect());
      metrics = resourceMetrics.scopeMetrics[0].metrics;
      spansStartedMetric = metrics.find(
        metric => metric.descriptor.name === 'otel.sdk.span.started'
      );
      spansLiveMetric = metrics.find(
        metric => metric.descriptor.name === 'otel.sdk.span.live'
      );
      assert.ok(spansStartedMetric);
      assert.strictEqual(spansStartedMetric.dataPoints[0].value, 1);
      assert.deepStrictEqual(spansStartedMetric.dataPoints[0].attributes, {
        'otel.span.parent.origin': 'none',
        'otel.span.sampling_result': 'DROP',
      });
      assert.strictEqual(spansLiveMetric, undefined);
    });

    it('should record metrics for dropped spans with remote parent', async () => {
      const metricReader = new TestMetricReader();
      const meterProvider = new MeterProvider({
        readers: [metricReader],
      });
      const tracerProvider = new BasicTracerProvider({
        meterProvider,
        sampler: new AlwaysOffSampler(),
      });
      const tracer = tracerProvider.getTracer('test');
      const parentContext = trace.setSpanContext(context.active(), {
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        spanId: '6e0c63257de34c92',
        traceFlags: TraceFlags.SAMPLED,
        isRemote: true,
      });
      const span = tracer.startSpan('span', undefined, parentContext);
      let { resourceMetrics } = await metricReader.collect();
      let metrics = resourceMetrics.scopeMetrics[0].metrics;
      let spansStartedMetric = metrics.find(
        metric => metric.descriptor.name === 'otel.sdk.span.started'
      );
      let spansLiveMetric = metrics.find(
        metric => metric.descriptor.name === 'otel.sdk.span.live'
      );
      assert.ok(spansStartedMetric);
      assert.strictEqual(spansStartedMetric.dataPoints[0].value, 1);
      assert.deepStrictEqual(spansStartedMetric.dataPoints[0].attributes, {
        'otel.span.parent.origin': 'remote',
        'otel.span.sampling_result': 'DROP',
      });
      assert.strictEqual(spansLiveMetric, undefined);
      span.end();
      ({ resourceMetrics } = await metricReader.collect());
      metrics = resourceMetrics.scopeMetrics[0].metrics;
      spansStartedMetric = metrics.find(
        metric => metric.descriptor.name === 'otel.sdk.span.started'
      );
      spansLiveMetric = metrics.find(
        metric => metric.descriptor.name === 'otel.sdk.span.live'
      );
      assert.ok(spansStartedMetric);
      assert.strictEqual(spansStartedMetric.dataPoints[0].value, 1);
      assert.deepStrictEqual(spansStartedMetric.dataPoints[0].attributes, {
        'otel.span.parent.origin': 'remote',
        'otel.span.sampling_result': 'DROP',
      });
      assert.strictEqual(spansLiveMetric, undefined);
    });

    it('should record metrics for dropped spans with local parent', async () => {
      const metricReader = new TestMetricReader();
      const meterProvider = new MeterProvider({
        readers: [metricReader],
      });
      const tracerProvider = new BasicTracerProvider({
        meterProvider,
        sampler: new AlwaysOffSampler(),
      });
      const tracer = tracerProvider.getTracer('test');
      const parentContext = trace.setSpanContext(context.active(), {
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        spanId: '6e0c63257de34c92',
        traceFlags: TraceFlags.SAMPLED,
        isRemote: false,
      });
      const span = tracer.startSpan('span', undefined, parentContext);
      let { resourceMetrics } = await metricReader.collect();
      let metrics = resourceMetrics.scopeMetrics[0].metrics;
      let spansStartedMetric = metrics.find(
        metric => metric.descriptor.name === 'otel.sdk.span.started'
      );
      let spansLiveMetric = metrics.find(
        metric => metric.descriptor.name === 'otel.sdk.span.live'
      );
      assert.ok(spansStartedMetric);
      assert.strictEqual(spansStartedMetric.dataPoints[0].value, 1);
      assert.deepStrictEqual(spansStartedMetric.dataPoints[0].attributes, {
        'otel.span.parent.origin': 'local',
        'otel.span.sampling_result': 'DROP',
      });
      assert.strictEqual(spansLiveMetric, undefined);
      span.end();
      ({ resourceMetrics } = await metricReader.collect());
      metrics = resourceMetrics.scopeMetrics[0].metrics;
      spansStartedMetric = metrics.find(
        metric => metric.descriptor.name === 'otel.sdk.span.started'
      );
      spansLiveMetric = metrics.find(
        metric => metric.descriptor.name === 'otel.sdk.span.live'
      );
      assert.ok(spansStartedMetric);
      assert.strictEqual(spansStartedMetric.dataPoints[0].value, 1);
      assert.deepStrictEqual(spansStartedMetric.dataPoints[0].attributes, {
        'otel.span.parent.origin': 'local',
        'otel.span.sampling_result': 'DROP',
      });
      assert.strictEqual(spansLiveMetric, undefined);
    });
  });
});
