/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import { ExportResultCode } from '@opentelemetry/core';
import * as metrics from '@opentelemetry/api';
import * as assert from 'assert';
import { AggregationTemporality } from '../../src/export/AggregationTemporality';
import { InMemoryMetricExporter } from '../../src/export/InMemoryMetricExporter';
import { ResourceMetrics } from '../../src/export/MetricData';
import { PeriodicExportingMetricReader } from '../../src/export/PeriodicExportingMetricReader';
import { MeterProvider } from '../../src/MeterProvider';
import { testResource } from '../util';
import { resourceFromAttributes } from '@opentelemetry/resources';

async function waitForNumberOfExports(
  exporter: InMemoryMetricExporter,
  numberOfExports: number
): Promise<ResourceMetrics[]> {
  if (numberOfExports <= 0) {
    throw new Error('numberOfExports must be greater than or equal to 0');
  }

  let totalExports = 0;
  while (totalExports < numberOfExports) {
    await new Promise(resolve => setTimeout(resolve, 20));
    const exportedMetrics = exporter.getMetrics();
    totalExports = exportedMetrics.length;
  }

  return exporter.getMetrics();
}

describe('InMemoryMetricExporter', () => {
  let exporter: InMemoryMetricExporter;
  let meterProvider: MeterProvider;
  let metricReader: PeriodicExportingMetricReader;
  let meter: metrics.Meter;

  beforeEach(() => {
    exporter = new InMemoryMetricExporter(AggregationTemporality.CUMULATIVE);
    metricReader = new PeriodicExportingMetricReader({
      exporter: exporter,
      exportIntervalMillis: 100,
      exportTimeoutMillis: 100,
    });
    meterProvider = new MeterProvider({
      resource: testResource,
      readers: [metricReader],
    });
    meter = meterProvider.getMeter('InMemoryMetricExporter', '1.0.0');
  });

  afterEach(async () => {
    await exporter.shutdown();
    await metricReader.shutdown();
  });

  it('should return failed result code', done => {
    exporter.shutdown().then(() => {
      const resource = resourceFromAttributes({
        'resource-attribute': 'resource attribute value',
      });
      const resourceMetrics: ResourceMetrics = {
        resource: resource,
        scopeMetrics: [
          {
            scope: {
              name: 'mylib',
              version: '0.1.0',
              schemaUrl: 'http://url.to.schema',
            },
            metrics: [],
          },
        ],
      };
      exporter.export(resourceMetrics, result => {
        assert.ok(result.code === ExportResultCode.FAILED);
        metricReader.shutdown().then(() => {
          done();
        });
      });
    });
  });

  it('should reset metrics when reset is called', async () => {
    const counter = meter.createCounter('counter_total', {
      description: 'a test description',
    });
    const counterAttribute = { key1: 'attributeValue1' };
    counter.add(10, counterAttribute);

    const exportedMetrics = await waitForNumberOfExports(exporter, 1);
    assert.ok(exportedMetrics.length > 0);

    exporter.reset();

    const otherMetrics = exporter.getMetrics();
    assert.ok(otherMetrics.length === 0);

    await exporter.shutdown();
    await metricReader.shutdown();
  });

  it('should be able to access metric', async () => {
    const counter = meter.createCounter('counter_total', {
      description: 'a test description',
    });
    const counterAttribute = { key1: 'attributeValue1' };
    counter.add(10, counterAttribute);
    counter.add(10, counterAttribute);

    const histogram = meter.createHistogram('histogram', {
      description: 'a histogram',
    });
    histogram.record(10);
    histogram.record(100);
    histogram.record(1000);

    const exportedMetrics = await waitForNumberOfExports(exporter, 1);
    assert.ok(exportedMetrics.length > 0);

    const resourceMetrics = exportedMetrics.shift();
    assert.ok(resourceMetrics);
    const firstScopeMetric = resourceMetrics?.scopeMetrics.shift();
    assert.ok(firstScopeMetric);
    assert.ok(firstScopeMetric.metrics.length > 0);
    const [counterMetric, histogramMetric] = firstScopeMetric.metrics;
    assert.ok(counterMetric.descriptor.name, 'counter_total');
    assert.ok(counterMetric.dataPoints.length > 0);
    const counterDataPoint = counterMetric.dataPoints.shift();
    assert.ok(counterDataPoint);
    assert.strictEqual(counterDataPoint.attributes, counterAttribute);

    assert.ok(histogramMetric.descriptor.name, 'histogram');
    assert.ok(histogramMetric.dataPoints.length > 0);
    const histogramDataPoint = histogramMetric.dataPoints.shift();
    assert.ok(histogramDataPoint);

    await metricReader.shutdown();
  });
});
