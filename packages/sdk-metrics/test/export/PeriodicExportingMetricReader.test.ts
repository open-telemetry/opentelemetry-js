/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PeriodicExportingMetricReader } from '../../src/export/PeriodicExportingMetricReader';
import { AggregationTemporality } from '../../src/export/AggregationTemporality';
import type {
  AggregationOption,
  CollectionResult,
  MetricProducer,
  PushMetricExporter,
} from '../../src';
import { InstrumentType } from '../../src/export/MetricData';
import { AggregationType } from '../../src';
import type {
  ResourceMetrics,
  ScopeMetrics,
} from '../../src/export/MetricData';
import { DataPointType } from '../../src/export/MetricData';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { TimeoutError } from '../../src/utils';
import type { ExportResult } from '@opentelemetry/core';
import { ExportResultCode, setGlobalErrorHandler } from '@opentelemetry/core';
import { TestMetricProducer } from './TestMetricProducer';
import {
  assertAggregationSelector,
  assertAggregationTemporalitySelector,
} from './utils';
import {
  DEFAULT_AGGREGATION_SELECTOR,
  DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR,
} from '../../src/export/AggregationSelector';
import { ValueType, diag } from '@opentelemetry/api';

const MAX_32_BIT_INT = 2 ** 31 - 1;

class TestMetricExporter implements PushMetricExporter {
  public exportTime = 0;
  public forceFlushTime = 0;
  public throwExport = false;
  public throwFlush = false;
  public rejectExport = false;
  public concurrentCalls = 0;
  public maxConcurrentCalls = 0;
  private _batches: ResourceMetrics[] = [];
  private _shutdown: boolean = false;

  export(
    metrics: ResourceMetrics,
    resultCallback: (result: ExportResult) => void
  ): void {
    this._batches.push(metrics);
    this.concurrentCalls++;
    this.maxConcurrentCalls = Math.max(
      this.maxConcurrentCalls,
      this.concurrentCalls
    );

    if (this.throwExport) {
      this.concurrentCalls--;
      throw new Error('Error during export');
    }
    setTimeout(() => {
      this.concurrentCalls--;
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
    this._shutdown = true;
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
  selectAggregation(_instrumentType: InstrumentType): AggregationOption {
    return { type: AggregationType.DROP };
  }
}

describe('PeriodicExportingMetricReader', () => {
  afterEach(() => {
    sinon.restore();
  });

  const waitForAsyncAttributesStub = sinon.stub().returns(
    new Promise<void>(resolve =>
      setTimeout(() => {
        resolve();
      }, 10)
    )
  );
  const scopeMetrics: ScopeMetrics[] = [
    {
      scope: {
        name: 'test',
      },
      metrics: [
        {
          dataPointType: DataPointType.GAUGE,
          dataPoints: [
            {
              // Sample hr time datapoints.
              startTime: [12345, 678901234],
              endTime: [12345, 678901234],
              attributes: {},
              value: 1,
            },
          ],
          descriptor: {
            name: '',
            description: '',
            unit: '',
            valueType: ValueType.INT,
          },
          aggregationTemporality: AggregationTemporality.CUMULATIVE,
        },
      ],
    },
  ];
  const resourceMetrics: ResourceMetrics = {
    resource: {
      attributes: {},
      merge: sinon.stub(),
      asyncAttributesPending: true, // ensure we try to await async attributes
      waitForAsyncAttributes: waitForAsyncAttributesStub, // resolve when awaited
      getRawAttributes: () => [],
    },
    scopeMetrics: scopeMetrics,
  };

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

    it('should throw when maxExportBatchSize less or equal to 0', () => {
      const exporter = new TestDeltaMetricExporter();
      assert.throws(
        () =>
          new PeriodicExportingMetricReader({
            exporter: exporter,
            exportIntervalMillis: 1,
            exportTimeoutMillis: 1,
            maxExportBatchSize: 0,
          }),
        /maxExportBatchSize must be greater than 0/
      );

      assert.throws(
        () =>
          new PeriodicExportingMetricReader({
            exporter: exporter,
            exportIntervalMillis: 1,
            exportTimeoutMillis: 1,
            maxExportBatchSize: -1,
          }),
        /maxExportBatchSize must be greater than 0/
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

    it('should clamp when timeout implicitly exceeds interval', () => {
      const exporter = new TestDeltaMetricExporter();

      const p1 = new PeriodicExportingMetricReader({
        exporter,
        // exportTimeoutMillis defaults to 30 seconds, which is greater than exportIntervalMillis.
        exportIntervalMillis: 100,
      }) as any;
      assert.strictEqual(p1._exportInterval, 100);
      assert.strictEqual(p1._exportTimeout, 100);

      const p2 = new PeriodicExportingMetricReader({
        exporter,
        // exportIntervalMillis defaults to 60 seconds, which is less than exportTimeoutMillis.
        exportTimeoutMillis: 90_000,
      }) as any;
      assert.strictEqual(p2._exportInterval, 60_000);
      assert.strictEqual(p2._exportTimeout, 60_000);
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

  describe('cardinalityLimits', () => {
    const instrumentTypes = [
      { instrument: InstrumentType.COUNTER, name: 'counter' },
      { instrument: InstrumentType.GAUGE, name: 'gauge' },
      { instrument: InstrumentType.HISTOGRAM, name: 'histogram' },
      { instrument: InstrumentType.UP_DOWN_COUNTER, name: 'upDownCounter' },
      {
        instrument: InstrumentType.OBSERVABLE_COUNTER,
        name: 'observableCounter',
      },
      { instrument: InstrumentType.OBSERVABLE_GAUGE, name: 'observableGauge' },
      {
        instrument: InstrumentType.OBSERVABLE_UP_DOWN_COUNTER,
        name: 'observableUpDownCounter',
      },
    ] as const;

    it('should use default cardinality limit value if not specified', () => {
      const exporter = new TestDeltaMetricExporter();

      const p = new PeriodicExportingMetricReader({
        exporter,
        exportIntervalMillis: 1,
        exportTimeoutMillis: 1,
      });

      assert.strictEqual(
        p.selectCardinalityLimit(InstrumentType.COUNTER),
        2000
      );
    });

    instrumentTypes.forEach(({ instrument, name }) => {
      it('should use the provided cardinality limit for ' + name, () => {
        const exporter = new TestDeltaMetricExporter();

        const p = new PeriodicExportingMetricReader({
          exporter,
          exportIntervalMillis: 1,
          exportTimeoutMillis: 1,
          cardinalityLimits: {
            [name]: 5000,
          },
        });
        assert.strictEqual(p.selectCardinalityLimit(instrument), 5000);
      });
    });

    it('should use the provided default cardinality limit when no specific limit is provided', () => {
      const exporter = new TestDeltaMetricExporter();

      const defaultLimit = 1;

      const instrumentTypesValues = [
        InstrumentType.COUNTER,
        InstrumentType.GAUGE,
        InstrumentType.HISTOGRAM,
        InstrumentType.UP_DOWN_COUNTER,
        InstrumentType.OBSERVABLE_COUNTER,
        InstrumentType.OBSERVABLE_GAUGE,
        InstrumentType.OBSERVABLE_UP_DOWN_COUNTER,
      ];

      const p = new PeriodicExportingMetricReader({
        exporter,
        exportIntervalMillis: 1,
        exportTimeoutMillis: 1,
        cardinalityLimits: { default: defaultLimit },
      });

      instrumentTypesValues.forEach(instrument => {
        assert.strictEqual(p.selectCardinalityLimit(instrument), defaultLimit);
      });
    });

    it('should use the provided values for a given instrument type, or fallback to the default value otherwise', () => {
      const exporter = new TestDeltaMetricExporter();

      const p = new PeriodicExportingMetricReader({
        exporter,
        exportIntervalMillis: 1,
        exportTimeoutMillis: 1,
        cardinalityLimits: {
          counter: 1000,
          histogram: 3000,
          observableCounter: 4000,
        },
      });

      assert.strictEqual(
        p.selectCardinalityLimit(InstrumentType.COUNTER),
        1000
      );
      assert.strictEqual(
        p.selectCardinalityLimit(InstrumentType.HISTOGRAM),
        3000
      );
      assert.strictEqual(
        p.selectCardinalityLimit(InstrumentType.OBSERVABLE_COUNTER),
        4000
      );
      assert.strictEqual(p.selectCardinalityLimit(InstrumentType.GAUGE), 2000);
      assert.strictEqual(
        p.selectCardinalityLimit(InstrumentType.UP_DOWN_COUNTER),
        2000
      );
      assert.strictEqual(
        p.selectCardinalityLimit(InstrumentType.OBSERVABLE_GAUGE),
        2000
      );
      assert.strictEqual(
        p.selectCardinalityLimit(InstrumentType.OBSERVABLE_UP_DOWN_COUNTER),
        2000
      );
    });

    it("should fallback to the default value if the specified cardinality selector doesn't exists", () => {
      const exporter = new TestDeltaMetricExporter();
      const defaultLimit = 1;

      const p = new PeriodicExportingMetricReader({
        exporter,
        exportIntervalMillis: 1,
        exportTimeoutMillis: 1,
        cardinalityLimits: { default: defaultLimit },
      });

      assert.strictEqual(
        p.selectCardinalityLimit('' as InstrumentType),
        defaultLimit
      );
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

      reader.setMetricProducer(
        new TestMetricProducer({ resourceMetrics: resourceMetrics, errors: [] })
      );
      const result = await exporter.waitForNumberOfExports(2);

      assert.deepStrictEqual(result, [resourceMetrics, resourceMetrics]);
      await reader.shutdown();
    });
  });

  it('should not export without populated scope metrics', async () => {
    const exporter = new TestMetricExporter();
    const reader = new PeriodicExportingMetricReader({
      exporter: exporter,
      exportIntervalMillis: 30,
      exportTimeoutMillis: 20,
    });

    reader.setMetricProducer(new TestMetricProducer());
    const result = await exporter.forceFlush();

    assert.deepStrictEqual(result, undefined);
    await reader.shutdown();
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

      reader.setMetricProducer(
        new TestMetricProducer({ resourceMetrics: resourceMetrics, errors: [] })
      );

      const result = await exporter.waitForNumberOfExports(2);
      assert.deepStrictEqual(result, [resourceMetrics, resourceMetrics]);

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

      reader.setMetricProducer(
        new TestMetricProducer({ resourceMetrics: resourceMetrics, errors: [] })
      );

      const result = await exporter.waitForNumberOfExports(2);
      assert.deepStrictEqual(result, [resourceMetrics, resourceMetrics]);

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

      reader.setMetricProducer(
        new TestMetricProducer({ resourceMetrics: resourceMetrics, errors: [] })
      );

      const result = await exporter.waitForNumberOfExports(2);
      assert.deepStrictEqual(result, [resourceMetrics, resourceMetrics]);

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

      reader.setMetricProducer(
        new TestMetricProducer({ resourceMetrics: resourceMetrics, errors: [] })
      );
      await reader.forceFlush();
      exporterMock.verify();

      const exports = exporter.getExports();
      assert.strictEqual(exports.length, 1);

      await reader.shutdown();
    });

    it('should complete actions before promise resolves when async resource attributes are pending', async () => {
      // arrange
      const waitForAsyncAttributesStub = sinon.stub().returns(
        new Promise<void>(resolve =>
          setTimeout(() => {
            resolve();
          }, 10)
        )
      );
      const resourceMetrics: ResourceMetrics = {
        resource: {
          attributes: {},
          merge: sinon.stub(),
          asyncAttributesPending: true, // ensure we try to await async attributes
          waitForAsyncAttributes: waitForAsyncAttributesStub, // resolve when awaited
          getRawAttributes: () => [],
        },
        scopeMetrics: scopeMetrics,
      };

      const mockCollectionResult: CollectionResult = {
        errors: [],
        resourceMetrics,
      };
      const producerStubs: MetricProducer = {
        collect: sinon.stub().resolves(mockCollectionResult),
      };

      const exporter = new TestMetricExporter();

      const reader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: MAX_32_BIT_INT,
        exportTimeoutMillis: 80,
      });

      reader.setMetricProducer(producerStubs);

      // act
      await reader.forceFlush();

      // assert
      sinon.assert.calledOnce(waitForAsyncAttributesStub);
      assert.strictEqual(
        exporter.getExports().length,
        1,
        'Expected exactly 1 export to happen when awaiting forceFlush'
      );
    });

    it('should call global error handler when resolving async attributes fails', async () => {
      // arrange
      const expectedError = new Error('resolving async attributes failed');
      const waitForAsyncAttributesStub = sinon.stub().rejects(expectedError);

      const resourceMetrics: ResourceMetrics = {
        resource: {
          attributes: {},
          merge: sinon.stub(),
          asyncAttributesPending: true, // ensure we try to await async attributes
          waitForAsyncAttributes: waitForAsyncAttributesStub, // reject when awaited
          getRawAttributes: () => [],
        },
        scopeMetrics: [],
      };

      const mockCollectionResult: CollectionResult = {
        errors: [],
        resourceMetrics,
      };
      const producerStubs: MetricProducer = {
        collect: sinon.stub().resolves(mockCollectionResult),
      };

      const exporter = new TestMetricExporter();

      const reader = new PeriodicExportingMetricReader({
        exporter: exporter,
        exportIntervalMillis: MAX_32_BIT_INT,
        exportTimeoutMillis: 80,
      });

      reader.setMetricProducer(producerStubs);
      const errorHandlerStub = sinon.stub();
      setGlobalErrorHandler(errorHandlerStub);

      // act
      await reader.forceFlush();

      // assert
      sinon.assert.calledOnce(waitForAsyncAttributesStub);
      sinon.assert.calledOnceWithExactly(errorHandlerStub, expectedError);
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
      await assert.rejects(
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

      await assert.rejects(
        () => reader.forceFlush(),
        /Error during forceFlush/
      );
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
      await assert.rejects(
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

      await assert.rejects(() => reader.shutdown(), /Error during forceFlush/);
    });

    describe('maxExportBatchSize', () => {
      it('should split batches when exceeding maxExportBatchSize', async () => {
        const exporter = new TestMetricExporter();
        const reader = new PeriodicExportingMetricReader({
          exporter: exporter,
          exportIntervalMillis: MAX_32_BIT_INT,
          maxExportBatchSize: 2,
        });

        const resourceMetrics: ResourceMetrics = {
          resource: {
            attributes: {},
            merge: sinon.stub(),
            getRawAttributes: () => [],
          } as any,
          scopeMetrics: [
            {
              scope: { name: 'test' },
              metrics: [
                {
                  dataPointType: DataPointType.GAUGE,
                  dataPoints: [
                    {
                      startTime: [0, 0],
                      endTime: [0, 0],
                      attributes: {},
                      value: 1,
                    },
                    {
                      startTime: [0, 0],
                      endTime: [0, 0],
                      attributes: {},
                      value: 2,
                    },
                    {
                      startTime: [0, 0],
                      endTime: [0, 0],
                      attributes: {},
                      value: 3,
                    },
                  ],
                  descriptor: {
                    name: 'm1',
                    description: '',
                    unit: '',
                    valueType: ValueType.INT,
                  },
                  aggregationTemporality: AggregationTemporality.CUMULATIVE,
                },
              ],
            },
          ],
        };

        reader.setMetricProducer(
          new TestMetricProducer({
            resourceMetrics: resourceMetrics,
            errors: [],
          })
        );

        await reader.forceFlush();

        const exports = exporter.getExports();
        assert.strictEqual(exports.length, 2);

        // First batch should have 2 data points
        assert.strictEqual(
          exports[0].scopeMetrics[0].metrics[0].dataPoints.length,
          2
        );
        assert.strictEqual(
          exports[0].scopeMetrics[0].metrics[0].dataPoints[0].value,
          1
        );
        assert.strictEqual(
          exports[0].scopeMetrics[0].metrics[0].dataPoints[1].value,
          2
        );

        // Second batch should have 1 data point
        assert.strictEqual(
          exports[1].scopeMetrics[0].metrics[0].dataPoints.length,
          1
        );
        assert.strictEqual(
          exports[1].scopeMetrics[0].metrics[0].dataPoints[0].value,
          3
        );

        await reader.shutdown();
      });

      it('should synchronize concurrent exports', async () => {
        const exporter = new TestMetricExporter();
        exporter.exportTime = 50; // Make export take some time
        const reader = new PeriodicExportingMetricReader({
          exporter: exporter,
          exportIntervalMillis: MAX_32_BIT_INT,
        });

        const resourceMetrics: ResourceMetrics = {
          resource: {
            attributes: {},
            merge: sinon.stub(),
            getRawAttributes: () => [],
          } as any,
          scopeMetrics: [
            {
              scope: { name: 'test' },
              metrics: [
                {
                  dataPointType: DataPointType.GAUGE,
                  dataPoints: [
                    {
                      startTime: [0, 0],
                      endTime: [0, 0],
                      attributes: {},
                      value: 1,
                    },
                  ],
                  descriptor: {
                    name: 'm1',
                    description: '',
                    unit: '',
                    valueType: ValueType.INT,
                  },
                  aggregationTemporality: AggregationTemporality.CUMULATIVE,
                },
              ],
            },
          ],
        };

        const producer = new TestMetricProducer({
          resourceMetrics: resourceMetrics,
          errors: [],
        });
        reader.setMetricProducer(producer);

        // Trigger two exports quickly
        const p1 = reader.forceFlush();
        const p2 = reader.forceFlush();

        await Promise.all([p1, p2]);

        const exports = exporter.getExports();
        assert.strictEqual(exports.length, 2);

        // Assert that they didn't overlap
        assert.strictEqual(exporter.maxConcurrentCalls, 1);

        await reader.shutdown();
      });

      it('should split data points across metrics if needed', async () => {
        const exporter = new TestMetricExporter();
        const reader = new PeriodicExportingMetricReader({
          exporter: exporter,
          exportIntervalMillis: MAX_32_BIT_INT,
          maxExportBatchSize: 2,
        });

        const resourceMetrics: ResourceMetrics = {
          resource: {
            attributes: {},
            merge: sinon.stub(),
            getRawAttributes: () => [],
          } as any,
          scopeMetrics: [
            {
              scope: { name: 'test' },
              metrics: [
                {
                  dataPointType: DataPointType.GAUGE,
                  dataPoints: [
                    {
                      startTime: [0, 0],
                      endTime: [0, 0],
                      attributes: {},
                      value: 1,
                    },
                  ],
                  descriptor: {
                    name: 'm1',
                    description: '',
                    unit: '',
                    valueType: ValueType.INT,
                  },
                  aggregationTemporality: AggregationTemporality.CUMULATIVE,
                },
                {
                  dataPointType: DataPointType.GAUGE,
                  dataPoints: [
                    {
                      startTime: [0, 0],
                      endTime: [0, 0],
                      attributes: {},
                      value: 2,
                    },
                    {
                      startTime: [0, 0],
                      endTime: [0, 0],
                      attributes: {},
                      value: 3,
                    },
                  ],
                  descriptor: {
                    name: 'm2',
                    description: '',
                    unit: '',
                    valueType: ValueType.INT,
                  },
                  aggregationTemporality: AggregationTemporality.CUMULATIVE,
                },
              ],
            },
          ],
        };

        reader.setMetricProducer(
          new TestMetricProducer({
            resourceMetrics: resourceMetrics,
            errors: [],
          })
        );

        await reader.forceFlush();

        const exports = exporter.getExports();
        assert.strictEqual(exports.length, 2);

        // First batch should have 2 data points (m1:1, m2:2)
        assert.strictEqual(exports[0].scopeMetrics[0].metrics.length, 2);
        assert.strictEqual(
          exports[0].scopeMetrics[0].metrics[0].dataPoints.length,
          1
        );
        assert.strictEqual(
          exports[0].scopeMetrics[0].metrics[0].dataPoints[0].value,
          1
        );
        assert.strictEqual(
          exports[0].scopeMetrics[0].metrics[1].dataPoints.length,
          1
        );
        assert.strictEqual(
          exports[0].scopeMetrics[0].metrics[1].dataPoints[0].value,
          2
        );

        // Second batch should have 1 data point (m2:3)
        assert.strictEqual(exports[1].scopeMetrics[0].metrics.length, 1);
        assert.strictEqual(
          exports[1].scopeMetrics[0].metrics[0].descriptor.name,
          'm2'
        );
        assert.strictEqual(
          exports[1].scopeMetrics[0].metrics[0].dataPoints.length,
          1
        );
        assert.strictEqual(
          exports[1].scopeMetrics[0].metrics[0].dataPoints[0].value,
          3
        );

        await reader.shutdown();
      });

      it('should continue exporting remaining batches if one fails', async () => {
        const exporter = new TestMetricExporter();
        exporter.rejectExport = true; // Fail all exports
        const reader = new PeriodicExportingMetricReader({
          exporter: exporter,
          exportIntervalMillis: MAX_32_BIT_INT,
          maxExportBatchSize: 1,
        });

        const resourceMetrics: ResourceMetrics = {
          resource: {
            attributes: {},
            merge: sinon.stub(),
            getRawAttributes: () => [],
          } as any,
          scopeMetrics: [
            {
              scope: { name: 'test' },
              metrics: [
                {
                  dataPointType: DataPointType.GAUGE,
                  dataPoints: [
                    {
                      startTime: [0, 0],
                      endTime: [0, 0],
                      attributes: {},
                      value: 1,
                    },
                    {
                      startTime: [0, 0],
                      endTime: [0, 0],
                      attributes: {},
                      value: 2,
                    },
                  ],
                  descriptor: {
                    name: 'm1',
                    description: '',
                    unit: '',
                    valueType: ValueType.INT,
                  },
                  aggregationTemporality: AggregationTemporality.CUMULATIVE,
                },
              ],
            },
          ],
        };

        reader.setMetricProducer(
          new TestMetricProducer({
            resourceMetrics: resourceMetrics,
            errors: [],
          })
        );

        // Call forceFlush to trigger the export
        await reader.forceFlush();

        const exports = exporter.getExports();
        assert.strictEqual(exports.length, 2); // Both batches should have been attempted

        await reader.shutdown();
      });

      it('should apply timeout to individual batches and not combination', async () => {
        const clock = sinon.useFakeTimers();
        const exporter = new TestMetricExporter();
        exporter.exportTime = 15; // Each batch takes 15ms

        const reader = new PeriodicExportingMetricReader({
          exporter: exporter,
          exportIntervalMillis: MAX_32_BIT_INT,
          maxExportBatchSize: 1, // Results in 2 batches
          exportTimeoutMillis: 20, // Timeout is 20ms
        });

        const resourceMetrics: ResourceMetrics = {
          resource: {
            attributes: {},
            merge: sinon.stub(),
            getRawAttributes: () => [],
          } as any,
          scopeMetrics: [
            {
              scope: { name: 'test' },
              metrics: [
                {
                  dataPointType: DataPointType.GAUGE,
                  dataPoints: [
                    {
                      startTime: [0, 0],
                      endTime: [0, 0],
                      attributes: {},
                      value: 1,
                    },
                    {
                      startTime: [0, 0],
                      endTime: [0, 0],
                      attributes: {},
                      value: 2,
                    },
                  ],
                  descriptor: {
                    name: 'm1',
                    description: '',
                    unit: '',
                    valueType: ValueType.INT,
                  },
                  aggregationTemporality: AggregationTemporality.CUMULATIVE,
                },
              ],
            },
          ],
        };

        reader.setMetricProducer(
          new TestMetricProducer({
            resourceMetrics: resourceMetrics,
            errors: [],
          })
        );

        // Call _runOnce directly to avoid forceFlush timer issues in this specific test
        const runOncePromise = (reader as any)._runOnce();

        // Batch 1 should be scheduled. Tick 15ms to complete it.
        await clock.tickAsync(15);

        // Batch 2 should be scheduled. Tick 15ms to complete it.
        await clock.tickAsync(15);

        await runOncePromise;

        const exports = exporter.getExports();
        assert.strictEqual(exports.length, 2);

        clock.restore();
      });

      it('should log timeout error to diag and not propagate to globalErrorHandler', async () => {
        const clock = sinon.useFakeTimers();
        const exporter = new TestMetricExporter();
        exporter.exportTime = 50; // Make it take 50ms

        const reader = new PeriodicExportingMetricReader({
          exporter: exporter,
          exportIntervalMillis: MAX_32_BIT_INT,
          maxExportBatchSize: 1,
          exportTimeoutMillis: 20, // Timeout is 20ms
        });

        const resourceMetrics: ResourceMetrics = {
          resource: {
            attributes: {},
            merge: sinon.stub(),
            getRawAttributes: () => [],
          } as any,
          scopeMetrics: [
            {
              scope: { name: 'test' },
              metrics: [
                {
                  dataPointType: DataPointType.GAUGE,
                  dataPoints: [
                    {
                      startTime: [0, 0],
                      endTime: [0, 0],
                      attributes: {},
                      value: 1,
                    },
                  ],
                  descriptor: {
                    name: 'm1',
                    description: '',
                    unit: '',
                    valueType: ValueType.INT,
                  },
                  aggregationTemporality: AggregationTemporality.CUMULATIVE,
                },
              ],
            },
          ],
        };

        reader.setMetricProducer(
          new TestMetricProducer({
            resourceMetrics: resourceMetrics,
            errors: [],
          })
        );

        const diagErrorStub = sinon.stub(diag, 'error');
        const errorHandlerStub = sinon.stub();
        setGlobalErrorHandler(errorHandlerStub);

        const runOncePromise = (reader as any)._runOnce();

        // Tick 20ms to trigger timeout
        await clock.tickAsync(20);

        await runOncePromise;

        sinon.assert.calledOnce(diagErrorStub);
        assert.match(
          diagErrorStub.firstCall.args[0],
          /metrics export timed out/
        );

        // Global error handler should not be called for timeout errors
        sinon.assert.notCalled(errorHandlerStub);

        // Restore global error handler
        setGlobalErrorHandler(() => {});
        clock.restore();
      });
    });
  });
});
