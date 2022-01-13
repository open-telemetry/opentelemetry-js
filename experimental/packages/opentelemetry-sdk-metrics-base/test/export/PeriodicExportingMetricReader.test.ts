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
import { MetricExporter } from '../../src';
import { MetricData } from '../../src/export/MetricData';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { MetricProducer } from '../../src/export/MetricProducer';
import { TimeoutError } from '../../src/utils';
import { assertRejects } from '../test-utils';

const MAX_32_BIT_INT = 2 ** 31 - 1;

class TestMetricExporter extends MetricExporter {
  public exportTime = 0;
  public forceFlushTime = 0;
  public throwException = false;
  private _batches: MetricData[][] = [];

  async export(batch: MetricData[]): Promise<void> {
    this._batches.push(batch);

    if (this.throwException) {
      throw new Error('Error during export');
    }
    await new Promise(resolve => setTimeout(resolve, this.exportTime));
  }

  async forceFlush(): Promise<void> {
    if (this.throwException) {
      throw new Error('Error during forceFlush');
    }

    await new Promise(resolve => setTimeout(resolve, this.forceFlushTime));
  }

  async waitForNumberOfExports(numberOfExports: number): Promise<MetricData[][]> {
    if (numberOfExports <= 0) {
      throw new Error('numberOfExports must be greater than or equal to 0');
    }

    while (this._batches.length < numberOfExports) {
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    return this._batches.slice(0, numberOfExports);
  }

  getPreferredAggregationTemporality(): AggregationTemporality {
    return AggregationTemporality.CUMULATIVE;
  }
}

class TestDeltaMetricExporter extends TestMetricExporter {
  override getPreferredAggregationTemporality(): AggregationTemporality {
    return AggregationTemporality.DELTA;
  }
}

class TestMetricProducer implements MetricProducer {
  public collectionTime = 0;

  async collect(): Promise<MetricData[]> {
    await new Promise(resolve => setTimeout(resolve, this.collectionTime));
    return [];
  }
}

describe('PeriodicExportingMetricReader', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('should construct PeriodicExportingMetricReader without exceptions', () => {
      const exporter = new TestDeltaMetricExporter();
      const reader = new PeriodicExportingMetricReader({
          exporter: exporter,
          exportIntervalMillis: 4000,
          exportTimeoutMillis: 3000
        }
      );
      assert.strictEqual(reader.getPreferredAggregationTemporality(), exporter.getPreferredAggregationTemporality());
    });

    it('should throw when interval less or equal to 0', () => {
      const exporter = new TestDeltaMetricExporter();
      assert.throws(() => new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: 0,
        exportTimeoutMillis: 0
      }), /exportIntervalMillis must be greater than 0/);
    });

    it('should throw when timeout less or equal to 0', () => {
      const exporter = new TestDeltaMetricExporter();
      assert.throws(() => new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: 1,
        exportTimeoutMillis: 0
      }), /exportTimeoutMillis must be greater than 0/);
    });

    it('should throw when timeout less or equal to interval', () => {
      const exporter = new TestDeltaMetricExporter();
      assert.throws(() => new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: 100,
        exportTimeoutMillis: 200
      }), /exportIntervalMillis must be greater than or equal to exportTimeoutMillis/);
    });

    it('should not start exporting', async () => {
      const exporter = new TestDeltaMetricExporter();
      const exporterMock = sinon.mock(exporter);
      exporterMock.expects('export').never();

      new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: 1,
        exportTimeoutMillis: 1
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
        exportTimeoutMillis: 20
      });

      reader.setMetricProducer(new TestMetricProducer());
      const result = await exporter.waitForNumberOfExports(2);

      assert.deepStrictEqual(result, [[], []]);
      await reader.shutdown();
    });
  });

  describe('periodic export', () => {
    it('should keep running on export errors', async () => {
      const exporter = new TestMetricExporter();
      exporter.throwException = true;
      const reader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: 30,
        exportTimeoutMillis: 20
      });

      reader.setMetricProducer(new TestMetricProducer());

      const result = await exporter.waitForNumberOfExports(2);
      assert.deepStrictEqual(result, [[], []]);

      exporter.throwException = false;
      await reader.shutdown();
    });

    it('should keep exporting on export timeouts', async () => {
      const exporter = new TestMetricExporter();
      // set time longer than timeout.
      exporter.exportTime = 40;
      const reader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: 30,
        exportTimeoutMillis: 20
      });

      reader.setMetricProducer(new TestMetricProducer());

      const result = await exporter.waitForNumberOfExports(2);
      assert.deepStrictEqual(result, [[], []]);

      exporter.throwException = false;
      await reader.shutdown();
    });
  });

  describe('forceFlush', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should forceFlush exporter', async () => {
      const exporter = new TestMetricExporter();
      const exporterMock = sinon.mock(exporter);
      exporterMock.expects('forceFlush').calledOnceWithExactly();
      const reader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: MAX_32_BIT_INT,
        exportTimeoutMillis: 80
      });

      reader.setMetricProducer(new TestMetricProducer());
      await reader.forceFlush();
      exporterMock.verify();
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
      await assertRejects(() => reader.forceFlush({ timeoutMillis: 20 }),
        TimeoutError);
      await reader.shutdown();
    });

    it('should throw when exporter throws', async () => {
      const exporter = new TestMetricExporter();
      exporter.throwException = true;
      const reader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: MAX_32_BIT_INT,
        exportTimeoutMillis: 80,
      });

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
        exportTimeoutMillis: 80
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
      await assertRejects(() => reader.shutdown({ timeoutMillis: 20 }),
        TimeoutError);
    });

    it('called twice should call export shutdown only once', async () => {
      const exporter = new TestMetricExporter();
      const exporterMock = sinon.mock(exporter);
      exporterMock.expects('shutdown').calledOnceWithExactly();
      const reader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: MAX_32_BIT_INT,
        exportTimeoutMillis: 80
      });

      reader.setMetricProducer(new TestMetricProducer());

      // call twice, the exporter's shutdown must only be called once.
      await reader.shutdown();
      await reader.shutdown();

      exporterMock.verify();
    });

    it('should throw on non-initialized instance.', async () => {
      const exporter = new TestMetricExporter();
      exporter.throwException = true;
      const reader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: MAX_32_BIT_INT,
        exportTimeoutMillis: 80,
      });

      await assertRejects(() => reader.shutdown(), /Error during forceFlush/);
    });
  })
  ;

  describe('collect', () => {
    it('should throw on non-initialized instance', async () => {
      const exporter = new TestMetricExporter();
      const reader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: MAX_32_BIT_INT,
        exportTimeoutMillis: 80,
      });

      await assertRejects(() => reader.collect(), /MetricReader is not bound to a MetricProducer/);
    });

    it('should return empty on shut-down instance', async () => {
      const exporter = new TestMetricExporter();
      const reader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: MAX_32_BIT_INT,
        exportTimeoutMillis: 80,
      });

      reader.setMetricProducer(new TestMetricProducer());

      await reader.shutdown();
      assert.deepStrictEqual([], await reader.collect());
    });

    it('should time out when timeoutMillis is set', async () => {
      const exporter = new TestMetricExporter();
      const reader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: MAX_32_BIT_INT,
        exportTimeoutMillis: 80,
      });
      const producer = new TestMetricProducer();
      producer.collectionTime = 40;
      reader.setMetricProducer(producer);

      await assertRejects(
        () => reader.collect({ timeoutMillis: 20 }),
        TimeoutError
      );

      await reader.shutdown();
    });
  });
});
