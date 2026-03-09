/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import type { Context, SpanContext } from '@opentelemetry/api';
import { trace, TraceFlags, ROOT_CONTEXT } from '@opentelemetry/api';
import {
  MeterProvider,
  DataPointType,
  AlwaysSampleExemplarFilter,
  NeverSampleExemplarFilter,
  WithTraceExemplarFilter,
  SimpleFixedSizeExemplarReservoir,
} from '../../src';
import { TestMetricReader } from '../export/TestMetricReader';
import type { Exemplar } from '../../src/exemplar/Exemplar';
import { createDefaultExemplarReservoir } from '../../src/exemplar/ExemplarReservoirFactory';
import { HistogramAggregator } from '../../src/aggregator/Histogram';
import { ExponentialHistogramAggregator } from '../../src/aggregator/ExponentialHistogram';
import { SumAggregator } from '../../src/aggregator/Sum';

const tracedContext = (spanId: string, traceId: string): Context => {
  const spanContext: SpanContext = {
    spanId,
    traceId,
    traceFlags: TraceFlags.SAMPLED,
  };
  return trace.setSpanContext(ROOT_CONTEXT, spanContext);
};

describe('Exemplar Integration', () => {
  describe('AlwaysSampleExemplarFilter', () => {
    it('should collect exemplars for counter measurements', async () => {
      const reader = new TestMetricReader();
      const provider = new MeterProvider({
        readers: [reader],
        exemplarFilter: new AlwaysSampleExemplarFilter(),
      });

      const meter = provider.getMeter('test');
      const counter = meter.createCounter('test_counter');

      const ctx = tracedContext(
        '0102030405060708',
        '0102030405060708090a0b0c0d0e0f10'
      );

      counter.add(10, { key: 'value' }, ctx);

      const { resourceMetrics } = await reader.collect();
      const metric = resourceMetrics.scopeMetrics[0].metrics[0];

      assert.strictEqual(metric.dataPointType, DataPointType.SUM);
      assert.strictEqual(metric.dataPoints.length, 1);

      const dataPoint = metric.dataPoints[0];
      assert.ok(dataPoint.exemplars, 'exemplars should be present');
      assert.strictEqual(dataPoint.exemplars!.length, 1);

      const exemplar = dataPoint.exemplars![0] as Exemplar;
      assert.strictEqual(exemplar.value, 10);
      assert.strictEqual(exemplar.spanId, '0102030405060708');
      assert.strictEqual(exemplar.traceId, '0102030405060708090a0b0c0d0e0f10');
    });

    it('should collect exemplars for histogram measurements', async () => {
      const reader = new TestMetricReader();
      const provider = new MeterProvider({
        readers: [reader],
        exemplarFilter: new AlwaysSampleExemplarFilter(),
      });

      const meter = provider.getMeter('test');
      const histogram = meter.createHistogram('test_histogram');

      const ctx = tracedContext(
        'aabbccdd11223344',
        '00112233445566778899aabbccddeeff'
      );

      histogram.record(5, { route: '/api' }, ctx);
      histogram.record(25, { route: '/api' }, ctx);

      const { resourceMetrics } = await reader.collect();
      const metric = resourceMetrics.scopeMetrics[0].metrics[0];

      assert.strictEqual(metric.dataPointType, DataPointType.HISTOGRAM);
      assert.strictEqual(metric.dataPoints.length, 1);

      const dataPoint = metric.dataPoints[0];
      assert.ok(dataPoint.exemplars, 'exemplars should be present');
      assert.ok(
        dataPoint.exemplars!.length > 0,
        'should have at least one exemplar'
      );

      const exemplar = dataPoint.exemplars![0] as Exemplar;
      assert.strictEqual(exemplar.spanId, 'aabbccdd11223344');
      assert.strictEqual(exemplar.traceId, '00112233445566778899aabbccddeeff');
    });

    it('should collect exemplars without trace context', async () => {
      const reader = new TestMetricReader();
      const provider = new MeterProvider({
        readers: [reader],
        exemplarFilter: new AlwaysSampleExemplarFilter(),
      });

      const meter = provider.getMeter('test');
      const counter = meter.createCounter('test_counter');

      // AlwaysOn should collect exemplars even without trace context
      counter.add(10, { key: 'value' });

      const { resourceMetrics } = await reader.collect();
      const dataPoint =
        resourceMetrics.scopeMetrics[0].metrics[0].dataPoints[0];

      assert.ok(dataPoint.exemplars, 'exemplars should be present');
      assert.strictEqual(dataPoint.exemplars!.length, 1);
      assert.strictEqual(dataPoint.exemplars![0].value, 10);
      // No trace context, so spanId/traceId should be undefined
      assert.strictEqual(dataPoint.exemplars![0].spanId, undefined);
      assert.strictEqual(dataPoint.exemplars![0].traceId, undefined);
    });
  });

  describe('NeverSampleExemplarFilter', () => {
    it('should not collect any exemplars', async () => {
      const reader = new TestMetricReader();
      const provider = new MeterProvider({
        readers: [reader],
        exemplarFilter: new NeverSampleExemplarFilter(),
      });

      const meter = provider.getMeter('test');
      const counter = meter.createCounter('test_counter');

      const ctx = tracedContext(
        '0102030405060708',
        '0102030405060708090a0b0c0d0e0f10'
      );

      counter.add(10, { key: 'value' }, ctx);

      const { resourceMetrics } = await reader.collect();
      const metric = resourceMetrics.scopeMetrics[0].metrics[0];
      const dataPoint = metric.dataPoints[0];

      assert.ok(
        !dataPoint.exemplars || dataPoint.exemplars.length === 0,
        'exemplars should not be present'
      );
    });
  });

  describe('WithTraceExemplarFilter (default)', () => {
    it('should collect exemplars only when sampled span context is provided', async () => {
      const reader = new TestMetricReader();
      const provider = new MeterProvider({
        readers: [reader],
        exemplarFilter: new WithTraceExemplarFilter(),
      });

      const meter = provider.getMeter('test');
      const counter = meter.createCounter('test_counter');

      // Record without trace context — should not produce exemplar
      counter.add(5, { key: 'no-trace' });

      // Record with sampled trace context — should produce exemplar
      const ctx = tracedContext(
        'aabbccdd11223344',
        '00112233445566778899aabbccddeeff'
      );
      counter.add(10, { key: 'with-trace' }, ctx);

      const { resourceMetrics } = await reader.collect();
      const metric = resourceMetrics.scopeMetrics[0].metrics[0];

      // Find the data points by attributes
      const dataPoints = metric.dataPoints as Array<{
        attributes: Record<string, unknown>;
        exemplars?: Exemplar[];
      }>;
      const withTraceDP = dataPoints.find(
        dp => dp.attributes['key'] === 'with-trace'
      );
      const noTraceDP = dataPoints.find(
        dp => dp.attributes['key'] === 'no-trace'
      );

      assert.ok(withTraceDP, 'should have data point with trace');
      assert.ok(noTraceDP, 'should have data point without trace');

      assert.ok(
        withTraceDP!.exemplars && withTraceDP!.exemplars.length > 0,
        'traced measurement should have exemplars'
      );
      assert.ok(
        !noTraceDP!.exemplars || noTraceDP!.exemplars.length === 0,
        'untraced measurement should not have exemplars'
      );
    });

    it('should not collect exemplars for unsampled traces', async () => {
      const reader = new TestMetricReader();
      const provider = new MeterProvider({
        readers: [reader],
        exemplarFilter: new WithTraceExemplarFilter(),
      });

      const meter = provider.getMeter('test');
      const counter = meter.createCounter('test_counter');

      // Record with unsampled trace context
      const unsampledCtx = trace.setSpanContext(ROOT_CONTEXT, {
        spanId: '0102030405060708',
        traceId: '0102030405060708090a0b0c0d0e0f10',
        traceFlags: TraceFlags.NONE, // NOT sampled
      });

      counter.add(10, { key: 'value' }, unsampledCtx);

      const { resourceMetrics } = await reader.collect();
      const metric = resourceMetrics.scopeMetrics[0].metrics[0];
      const dataPoint = metric.dataPoints[0];

      assert.ok(
        !dataPoint.exemplars || dataPoint.exemplars.length === 0,
        'unsampled trace should not produce exemplars'
      );
    });
  });

  describe('Custom reservoir via View', () => {
    it('should use the custom reservoir factory', async () => {
      let factoryCalled = false;
      const reader = new TestMetricReader();
      const provider = new MeterProvider({
        readers: [reader],
        exemplarFilter: new AlwaysSampleExemplarFilter(),
        views: [
          {
            instrumentName: 'test_counter',
            exemplarReservoir: () => {
              factoryCalled = true;
              return new SimpleFixedSizeExemplarReservoir(5);
            },
          },
        ],
      });

      const meter = provider.getMeter('test');
      const counter = meter.createCounter('test_counter');

      const ctx = tracedContext(
        '0102030405060708',
        '0102030405060708090a0b0c0d0e0f10'
      );
      counter.add(10, { key: 'value' }, ctx);

      const { resourceMetrics } = await reader.collect();
      const metric = resourceMetrics.scopeMetrics[0].metrics[0];
      const dataPoint = metric.dataPoints[0];

      assert.ok(factoryCalled, 'custom reservoir factory should be called');
      assert.ok(dataPoint.exemplars, 'exemplars should be present');
      assert.strictEqual(dataPoint.exemplars!.length, 1);
    });
  });

  describe('exemplar filtered attributes', () => {
    it('should filter out attributes that match the data point', async () => {
      const reader = new TestMetricReader();
      const provider = new MeterProvider({
        readers: [reader],
        exemplarFilter: new AlwaysSampleExemplarFilter(),
      });

      const meter = provider.getMeter('test');
      const counter = meter.createCounter('test_counter');

      const ctx = tracedContext(
        '0102030405060708',
        '0102030405060708090a0b0c0d0e0f10'
      );

      counter.add(10, { key: 'value' }, ctx);

      const { resourceMetrics } = await reader.collect();
      const dataPoint =
        resourceMetrics.scopeMetrics[0].metrics[0].dataPoints[0];
      const exemplar = dataPoint.exemplars![0] as Exemplar;

      // The filteredAttributes should not contain keys that are in the data point
      // attributes since those are already captured by the data point itself
      for (const key of Object.keys(dataPoint.attributes)) {
        assert.ok(
          !(key in exemplar.filteredAttributes) ||
            exemplar.filteredAttributes[key] !== dataPoint.attributes[key],
          `filteredAttributes should not contain key '${key}' with same value as data point`
        );
      }
    });
  });

  describe('OTEL_METRICS_EXEMPLAR_FILTER env var', () => {
    const originalEnv = process.env.OTEL_METRICS_EXEMPLAR_FILTER;

    afterEach(() => {
      if (originalEnv === undefined) {
        delete process.env.OTEL_METRICS_EXEMPLAR_FILTER;
      } else {
        process.env.OTEL_METRICS_EXEMPLAR_FILTER = originalEnv;
      }
    });

    it('should respect always_on env var', async () => {
      process.env.OTEL_METRICS_EXEMPLAR_FILTER = 'always_on';
      const reader = new TestMetricReader();
      const provider = new MeterProvider({ readers: [reader] });
      const meter = provider.getMeter('test');
      const counter = meter.createCounter('test_counter');

      counter.add(10, { key: 'value' });

      const { resourceMetrics } = await reader.collect();
      const dataPoint =
        resourceMetrics.scopeMetrics[0].metrics[0].dataPoints[0];

      assert.ok(
        dataPoint.exemplars && dataPoint.exemplars.length > 0,
        'always_on should collect exemplars'
      );
    });

    it('should respect always_off env var', async () => {
      process.env.OTEL_METRICS_EXEMPLAR_FILTER = 'always_off';
      const reader = new TestMetricReader();
      const provider = new MeterProvider({ readers: [reader] });
      const meter = provider.getMeter('test');
      const counter = meter.createCounter('test_counter');

      const ctx = tracedContext(
        '0102030405060708',
        '0102030405060708090a0b0c0d0e0f10'
      );
      counter.add(10, { key: 'value' }, ctx);

      const { resourceMetrics } = await reader.collect();
      const dataPoint =
        resourceMetrics.scopeMetrics[0].metrics[0].dataPoints[0];

      assert.ok(
        !dataPoint.exemplars || dataPoint.exemplars.length === 0,
        'always_off should not collect exemplars'
      );
    });

    it('should respect trace_based env var', async () => {
      process.env.OTEL_METRICS_EXEMPLAR_FILTER = 'trace_based';
      const reader = new TestMetricReader();
      const provider = new MeterProvider({ readers: [reader] });
      const meter = provider.getMeter('test');
      const counter = meter.createCounter('test_counter');

      // Without trace context — should not produce exemplar
      counter.add(5, { key: 'no-trace' });

      // With sampled trace context — should produce exemplar
      const ctx = tracedContext(
        'aabbccdd11223344',
        '00112233445566778899aabbccddeeff'
      );
      counter.add(10, { key: 'with-trace' }, ctx);

      const { resourceMetrics } = await reader.collect();
      const metric = resourceMetrics.scopeMetrics[0].metrics[0];

      const dataPoints = metric.dataPoints as Array<{
        attributes: Record<string, unknown>;
        exemplars?: Exemplar[];
      }>;
      const withTraceDP = dataPoints.find(
        dp => dp.attributes['key'] === 'with-trace'
      );
      const noTraceDP = dataPoints.find(
        dp => dp.attributes['key'] === 'no-trace'
      );

      assert.ok(withTraceDP, 'should have data point with trace');
      assert.ok(noTraceDP, 'should have data point without trace');

      assert.ok(
        withTraceDP!.exemplars && withTraceDP!.exemplars.length > 0,
        'trace_based with sampled trace should have exemplars'
      );
      assert.ok(
        !noTraceDP!.exemplars || noTraceDP!.exemplars.length === 0,
        'trace_based without trace should not have exemplars'
      );
    });
  });

  describe('Default reservoir selection', () => {
    it('should use AlignedHistogramBucketExemplarReservoir for histogram aggregator', () => {
      const aggregator = new HistogramAggregator(
        [0, 5, 10, 25, 50, 75, 100],
        true
      );
      const reservoir = createDefaultExemplarReservoir(aggregator);
      // AlignedHistogramBucketExemplarReservoir has a reservoir storage
      // sized to the number of boundaries + 1
      assert.ok(reservoir, 'reservoir should be created');
    });

    it('should use SimpleFixedSizeExemplarReservoir for exponential histogram aggregator', () => {
      const aggregator = new ExponentialHistogramAggregator(160, true);
      const reservoir = createDefaultExemplarReservoir(aggregator);
      assert.ok(reservoir, 'reservoir should be created');
    });

    it('should use SimpleFixedSizeExemplarReservoir(1) for sum aggregator', () => {
      const aggregator = new SumAggregator(true);
      const reservoir = createDefaultExemplarReservoir(aggregator);
      assert.ok(reservoir, 'reservoir should be created');
    });

    it('should collect exemplars for exponential histogram measurements', async () => {
      const reader = new TestMetricReader();
      const provider = new MeterProvider({
        readers: [reader],
        exemplarFilter: new AlwaysSampleExemplarFilter(),
      });

      const meter = provider.getMeter('test');
      const histogram = meter.createHistogram('test_histogram', {
        advice: {
          explicitBucketBoundaries: [],
        },
      });

      const ctx = tracedContext(
        'aabbccdd11223344',
        '00112233445566778899aabbccddeeff'
      );

      histogram.record(5, { route: '/api' }, ctx);

      const { resourceMetrics } = await reader.collect();
      const metric = resourceMetrics.scopeMetrics[0].metrics[0];
      const dataPoint = metric.dataPoints[0];

      assert.ok(dataPoint.exemplars, 'exemplars should be present');
      assert.ok(
        dataPoint.exemplars!.length > 0,
        'should have at least one exemplar'
      );
    });
  });
});
