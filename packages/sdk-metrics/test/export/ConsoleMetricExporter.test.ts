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
import * as metrics from '@opentelemetry/api';
import { ExportResult } from '@opentelemetry/core';
import { ConsoleMetricExporter } from '../../src/export/ConsoleMetricExporter';
import { PeriodicExportingMetricReader } from '../../src/export/PeriodicExportingMetricReader';
import { ResourceMetrics } from '../../src/export/MetricData';
import { MeterProvider } from '../../src/MeterProvider';
import { testResource } from '../util';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { assertAggregationTemporalitySelector } from './utils';
import { DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR } from '../../src/export/AggregationSelector';
import { AggregationTemporality, InstrumentType } from '../../src';

async function waitForNumberOfExports(
  exporter: sinon.SinonSpy<
    [metrics: ResourceMetrics, resultCallback: (result: ExportResult) => void],
    void
  >,
  numberOfExports: number
): Promise<void> {
  if (numberOfExports <= 0) {
    throw new Error('numberOfExports must be greater than or equal to 0');
  }

  let totalExports = 0;
  while (totalExports < numberOfExports) {
    await new Promise(resolve => setTimeout(resolve, 20));
    totalExports = exporter.callCount;
  }
}

/* eslint-disable no-console */
describe('ConsoleMetricExporter', () => {
  describe('export', () => {
    let previousConsoleDir: any;
    let exporter: ConsoleMetricExporter;
    let meterProvider: MeterProvider;
    let metricReader: PeriodicExportingMetricReader;
    let meter: metrics.Meter;

    beforeEach(() => {
      previousConsoleDir = console.dir;
      console.dir = () => {};

      exporter = new ConsoleMetricExporter();
      metricReader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: 100,
        exportTimeoutMillis: 100,
      });
      meterProvider = new MeterProvider({
        resource: testResource,
        readers: [metricReader],
      });
      meter = meterProvider.getMeter('ConsoleMetricExporter', '1.0.0');
    });

    afterEach(async () => {
      console.dir = previousConsoleDir;

      await metricReader.shutdown();
    });

    it('should export information about metric', async () => {
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

      const spyConsole = sinon.spy(console, 'dir');
      const spyExport = sinon.spy(exporter, 'export');

      await waitForNumberOfExports(spyExport, 1);
      const resourceMetrics = spyExport.args[0];
      const firstResourceMetric = resourceMetrics[0];
      const consoleArgs = spyConsole.args[0];
      const consoleMetric = consoleArgs[0];
      const keys = Object.keys(consoleMetric).sort().join(',');

      const expectedKeys = ['dataPointType', 'dataPoints', 'descriptor'].join(
        ','
      );

      assert.ok(
        firstResourceMetric.resource.attributes.resourceKey === 'my-resource',
        'resourceKey'
      );
      assert.ok(keys === expectedKeys, 'expectedKeys');
      assert.ok(consoleMetric.descriptor.name === 'counter_total', 'name');
      assert.ok(
        consoleMetric.descriptor.description === 'a test description',
        'description'
      );
      assert.ok(consoleMetric.descriptor.type === 'COUNTER', 'type');
      assert.ok(consoleMetric.descriptor.unit === '', 'unit');
      assert.ok(consoleMetric.descriptor.valueType === 1, 'valueType');
      assert.ok(
        consoleMetric.dataPoints[0].attributes.key1 === 'attributeValue1',
        'ensure metric attributes exists'
      );

      assert.ok(spyExport.calledOnce);
    });
  });

  describe('constructor', () => {
    it('with no arguments should select cumulative temporality', () => {
      const exporter = new ConsoleMetricExporter();
      assertAggregationTemporalitySelector(
        exporter,
        DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR
      );
    });

    it('with empty options should select cumulative temporality', () => {
      const exporter = new ConsoleMetricExporter({});
      assertAggregationTemporalitySelector(
        exporter,
        DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR
      );
    });

    it('with cumulative preference should select cumulative temporality', () => {
      const exporter = new ConsoleMetricExporter({
        temporalitySelector: _ => AggregationTemporality.CUMULATIVE,
      });
      assertAggregationTemporalitySelector(
        exporter,
        _ => AggregationTemporality.CUMULATIVE
      );
    });

    it('with mixed preference should select matching temporality', () => {
      // use delta-ish example as a representation of a commonly used "mixed" preference.
      const selector = (instrumentType: InstrumentType) => {
        switch (instrumentType) {
          case InstrumentType.COUNTER:
          case InstrumentType.OBSERVABLE_COUNTER:
          case InstrumentType.GAUGE:
          case InstrumentType.HISTOGRAM:
          case InstrumentType.OBSERVABLE_GAUGE:
            return AggregationTemporality.DELTA;
          case InstrumentType.UP_DOWN_COUNTER:
          case InstrumentType.OBSERVABLE_UP_DOWN_COUNTER:
            return AggregationTemporality.CUMULATIVE;
        }
      };
      const exporter = new ConsoleMetricExporter({
        temporalitySelector: selector,
      });
      assertAggregationTemporalitySelector(exporter, selector);
    });

    it('should use default depth of null', async () => {
      const previousConsoleDir = console.dir;
      console.dir = () => {};

      const exporter = new ConsoleMetricExporter();
      const metricReader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: 100,
        exportTimeoutMillis: 100,
      });
      const meterProvider = new MeterProvider({
        resource: testResource,
        readers: [metricReader],
      });
      const meter = meterProvider.getMeter('test', '1.0.0');
      const counter = meter.createCounter('test_counter');
      counter.add(1);

      const spyConsole = sinon.spy(console, 'dir');
      const spyExport = sinon.spy(exporter, 'export');

      await waitForNumberOfExports(spyExport, 1);

      const consoleArgs = spyConsole.args[0];
      const options = consoleArgs[1];
      assert.strictEqual(options?.depth, null);

      console.dir = previousConsoleDir;
      await metricReader.shutdown();
    });

    it('should use custom depth when provided', async () => {
      const previousConsoleDir = console.dir;
      console.dir = () => {};

      const exporter = new ConsoleMetricExporter({ depth: 5 });
      const metricReader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: 100,
        exportTimeoutMillis: 100,
      });
      const meterProvider = new MeterProvider({
        resource: testResource,
        readers: [metricReader],
      });
      const meter = meterProvider.getMeter('test', '1.0.0');
      const counter = meter.createCounter('test_counter');
      counter.add(1);

      const spyConsole = sinon.spy(console, 'dir');
      const spyExport = sinon.spy(exporter, 'export');

      await waitForNumberOfExports(spyExport, 1);

      const consoleArgs = spyConsole.args[0];
      const options = consoleArgs[1];
      assert.strictEqual(options?.depth, 5);

      console.dir = previousConsoleDir;
      await metricReader.shutdown();
    });
  });
});
