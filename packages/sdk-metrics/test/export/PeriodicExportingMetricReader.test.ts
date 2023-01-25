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

import { PeriodicExportingMetricReader } from '../../src/export/PeriodicExportingMetricReader';
import { AggregationTemporality } from '../../src/export/AggregationTemporality';
import { Aggregation, InstrumentType, PushMetricExporter } from '../../src';
import { ResourceMetrics } from '../../src/export/MetricData';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { TimeoutError } from '../../src/utils';
import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import { assertRejects } from '../test-utils';
import { emptyResourceMetrics, TestMetricProducer } from './TestMetricProducer';
import {
  assertAggregationSelector,
  assertAggregationTemporalitySelector,
} from './utils';
import {
  DEFAULT_AGGREGATION_SELECTOR,
  DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR,
} from '../../src/export/AggregationSelector';

const MAX_32_BIT_INT = 2 ** 31 - 1;

class TestMetricExporter implements PushMetricExporter {
  public exportTime = 0;
  public forceFlushTime = 0;
  public throwExport = false;
  public throwFlush = false;
  public rejectExport = false;
  private _batches: ResourceMetrics[] = [];
  private _shutdown: boolean = false;

  export(
    metrics: ResourceMetrics,
    resultCallback: (result: ExportResult) => void
  ): void {
    this._batches.push(metrics);

    if (this.throwExport) {
      throw new Error('Error during export');
    }
    setTimeout(() => {
      if (this.rejectExport) {
        resultCallback({
          code: ExportResultCode.FAILED,
          error: new Error('some error'),
        });
      } else {
        resultCallback({ code: ExportResultCode.SUCCESS });
      }
    }, this.exportTime);
  }

  async shutdown(): Promise<void> {
    if (this._shutdown) return;
    const flushPromise = this.forceFlush();
    this._shutdown = true;
    await flushPromise;
  }

  async forceFlush(): Promise<void> {
    if (this.throwFlush) {
      throw new Error('Error during forceFlush');
    }

    await new Promise(resolve => setTimeout(resolve, this.forceFlushTime));
  }

  async waitForNumberOfExports(
    numberOfExports: number
  ): Promise<ResourceMetrics[]> {
    if (numberOfExports <= 0) {
      throw new Error('numberOfExports must be greater than or equal to 0');
    }

    while (this._batches.length < numberOfExports) {
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    return this._batches.slice(0, numberOfExports);
  }

  getExports(): ResourceMetrics[] {
    return this._batches.slice(0);
  }
}

class TestDeltaMetricExporter extends TestMetricExporter {
  selectAggregationTemporality(
    _instrumentType: InstrumentType
  ): AggregationTemporality {
    return AggregationTemporality.DELTA;
  }
}

class TestDropMetricExporter extends TestMetricExporter {
  selectAggregation(_instrumentType: InstrumentType): Aggregation {
    return Aggregation.Drop();
  }
}

describe('PeriodicExportingMetricReader', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('should construct PeriodicExportingMetricReader without exceptions', () => {
      const exporter = new TestDeltaMetricExporter();
      assert.doesNotThrow(
        () =>
          new PeriodicExportingMetricReader({
            exporter,
            exportIntervalMillis: 4000,
            exportTimeoutMillis: 3000,
          })
      );
    });

    it('should throw when interval less or equal to 0', () => {
      const exporter = new TestDeltaMetricExporter();
      assert.throws(
        () =>
          new PeriodicExportingMetricReader({
            exporter: exporter,
            exportIntervalMillis: 0,
            exportTimeoutMillis: 0,
          }),
        /exportIntervalMillis must be greater than 0/
      );
    });

    it('should throw when timeout less or equal to 0', () => {
      const exporter = new TestDeltaMetricExporter();
      assert.throws(
        () =>
          new PeriodicExportingMetricReader({
            exporter: exporter,
            exportIntervalMillis: 1,
            exportTimeoutMillis: 0,
          }),
        /exportTimeoutMillis must be greater than 0/
      );
    });

    it('should throw when timeout less or equal to interval', () => {
      const exporter = new TestDeltaMetricExporter();
      assert.throws(
        () =>
          new PeriodicExportingMetricReader({
            exporter: exporter,
            exportIntervalMillis: 100,
            exportTimeoutMillis: 200,
          }),
        /exportIntervalMillis must be greater than or equal to exportTimeoutMillis/
      );
    });

    it('should not start exporting', async () => {
      const exporter = new TestDeltaMetricExporter();
      const exporterMock = sinon.mock(exporter);
      exporterMock.expects('export').never();

      new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: 1,
        exportTimeoutMillis: 1,
      });
      await new Promise(resolve => setTimeout(resolve, 50));

      exporterMock.verify();
    });
  });

  describe('setMetricProducer', () => {
    it('should start exporting periodically', async () => {
      const exporter = new TestMetricExporter();
      const reader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: 30,
        exportTimeoutMillis: 20,
      });

      reader.setMetricProducer(new TestMetricProducer());
      const result = await exporter.waitForNumberOfExports(2);

      assert.deepStrictEqual(result, [
        emptyResourceMetrics,
        emptyResourceMetrics,
      ]);
      await reader.shutdown();
    });
  });

  describe('periodic export', () => {
    it('should keep running on export errors', async () => {
      const exporter = new TestMetricExporter();
      exporter.throwExport = true;
      const reader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: 30,
        exportTimeoutMillis: 20,
      });

      reader.setMetricProducer(new TestMetricProducer());

      const result = await exporter.waitForNumberOfExports(2);
      assert.deepStrictEqual(result, [
        emptyResourceMetrics,
        emptyResourceMetrics,
      ]);

      exporter.throwExport = false;
      await reader.shutdown();
    });

    it('should keep running on export failure', async () => {
      const exporter = new TestMetricExporter();
      exporter.rejectExport = true;
      const reader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: 30,
        exportTimeoutMillis: 20,
      });

      reader.setMetricProducer(new TestMetricProducer());

      const result = await exporter.waitForNumberOfExports(2);
      assert.deepStrictEqual(result, [
        emptyResourceMetrics,
        emptyResourceMetrics,
      ]);

      exporter.rejectExport = false;
      await reader.shutdown();
    });

    it('should keep exporting on export timeouts', async () => {
      const exporter = new TestMetricExporter();
      // set time longer than timeout.
      exporter.exportTime = 40;
      const reader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: 30,
        exportTimeoutMillis: 20,
      });

      reader.setMetricProducer(new TestMetricProducer());

      const result = await exporter.waitForNumberOfExports(2);
      assert.deepStrictEqual(result, [
        emptyResourceMetrics,
        emptyResourceMetrics,
      ]);

      exporter.throwExport = false;
      await reader.shutdown();
    });
  });

  describe('forceFlush', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should collect and forceFlush exporter', async () => {
      const exporter = new TestMetricExporter();
      const exporterMock = sinon.mock(exporter);
      exporterMock.expects('forceFlush').calledOnceWithExactly();
      const reader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: MAX_32_BIT_INT,
        exportTimeoutMillis: 80,
      });

      reader.setMetricProducer(new TestMetricProducer());
      await reader.forceFlush();
      exporterMock.verify();

      const exports = exporter.getExports();
      assert.strictEqual(exports.length, 1);

      await reader.shutdown();
    });

    it('should throw TimeoutError when forceFlush takes too long', async () => {
      const exporter = new TestMetricExporter();
      exporter.forceFlushTime = 60;

      const reader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: MAX_32_BIT_INT,
        exportTimeoutMillis: 80,
      });

      reader.setMetricProducer(new TestMetricProducer());
      await assertRejects(
        () => reader.forceFlush({ timeoutMillis: 20 }),
        TimeoutError
      );
      await reader.shutdown();
    });

    it('should throw when exporter throws', async () => {
      const exporter = new TestMetricExporter();
      exporter.throwFlush = true;
      const reader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: MAX_32_BIT_INT,
        exportTimeoutMillis: 80,
      });
      reader.setMetricProducer(new TestMetricProducer());

      await assertRejects(() => reader.forceFlush(), /Error during forceFlush/);
    });

    it('should not forceFlush exporter after shutdown', async () => {
      const exporter = new TestMetricExporter();
      const exporterMock = sinon.mock(exporter);
      // expect once on shutdown.
      exporterMock.expects('forceFlush').once();
      const reader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: MAX_32_BIT_INT,
        exportTimeoutMillis: 80,
      });

      reader.setMetricProducer(new TestMetricProducer());
      await reader.shutdown();
      await reader.forceFlush();

      exporterMock.verify();
    });
  });

  describe('selectAggregationTemporality', () => {
    it('should default to Cumulative with no exporter preference', () => {
      // Adding exporter without preference.
      const exporter = new TestMetricExporter();
      const reader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: MAX_32_BIT_INT,
      });

      assertAggregationTemporalitySelector(
        reader,
        DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR
      );
      reader.shutdown();
    });

    it('should default to exporter preference', () => {
      // Adding exporter with DELTA preference.
      const exporter = new TestDeltaMetricExporter();
      const reader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: MAX_32_BIT_INT,
      });

      assertAggregationTemporalitySelector(
        reader,
        exporter.selectAggregationTemporality
      );
      reader.shutdown();
    });
  });

  describe('selectAggregation', () => {
    it('should use default aggregation with no exporter preference', () => {
      // Adding exporter without preference.
      const exporter = new TestMetricExporter();
      const reader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: MAX_32_BIT_INT,
      });

      // check if the default selector is used.
      assertAggregationSelector(reader, DEFAULT_AGGREGATION_SELECTOR);
      reader.shutdown();
    });

    it('should default to exporter preference', () => {
      // Adding exporter with Drop Aggregation preference.
      const exporter = new TestDropMetricExporter();
      const reader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: MAX_32_BIT_INT,
      });

      // check if the exporter's selector is used.
      assertAggregationSelector(reader, exporter.selectAggregation);
      reader.shutdown();
    });
  });

  describe('shutdown', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should forceFlush', async () => {
      const exporter = new TestMetricExporter();
      const exporterMock = sinon.mock(exporter);
      exporterMock.expects('forceFlush').calledOnceWithExactly();
      const reader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: MAX_32_BIT_INT,
        exportTimeoutMillis: 80,
      });

      reader.setMetricProducer(new TestMetricProducer());
      await reader.shutdown();
      exporterMock.verify();
    });

    it('should throw TimeoutError when forceFlush takes too long', async () => {
      const exporter = new TestMetricExporter();
      exporter.forceFlushTime = 1000;

      const reader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: MAX_32_BIT_INT,
        exportTimeoutMillis: 80,
      });

      reader.setMetricProducer(new TestMetricProducer());
      await assertRejects(
        () => reader.shutdown({ timeoutMillis: 20 }),
        TimeoutError
      );
    });

    it('called twice should call export shutdown only once', async () => {
      const exporter = new TestMetricExporter();
      const exporterMock = sinon.mock(exporter);
      exporterMock.expects('shutdown').calledOnceWithExactly();
      const reader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: MAX_32_BIT_INT,
        exportTimeoutMillis: 80,
      });

      reader.setMetricProducer(new TestMetricProducer());

      // call twice, the exporter's shutdown must only be called once.
      await reader.shutdown();
      await reader.shutdown();

      exporterMock.verify();
    });

    it('should throw on non-initialized instance.', async () => {
      const exporter = new TestMetricExporter();
      exporter.throwFlush = true;
      const reader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: MAX_32_BIT_INT,
        exportTimeoutMillis: 80,
      });

      await assertRejects(() => reader.shutdown(), /Error during forceFlush/);
    });
  });
});
