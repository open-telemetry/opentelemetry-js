/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import { MeterProvider } from '../../src/MeterProvider';
import { emptyResourceMetrics, TestMetricProducer } from './TestMetricProducer';
import { TestMetricReader } from './TestMetricReader';
import type { ScopeMetrics } from '../../src';
import {
  AggregationTemporality,
  AggregationType,
  DataPointType,
} from '../../src';
import {
  DEFAULT_AGGREGATION_SELECTOR,
  DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR,
} from '../../src/export/AggregationSelector';
import {
  assertAggregationSelector,
  assertAggregationTemporalitySelector,
} from './utils';
import { testResource } from '../util';
import { ValueType, diag } from '@opentelemetry/api';
import { resourceFromAttributes } from '@opentelemetry/resources';

const testScopeMetrics: ScopeMetrics[] = [
  {
    scope: {
      name: 'additionalMetricProducerMetrics',
    },
    metrics: [
      {
        aggregationTemporality: AggregationTemporality.CUMULATIVE,
        dataPointType: DataPointType.SUM,
        dataPoints: [
          {
            attributes: {},
            value: 1,
            startTime: [0, 0],
            endTime: [1, 0],
          },
        ],
        descriptor: {
          name: 'additionalCounter',
          unit: '',
          description: '',
          valueType: ValueType.INT,
        },
        isMonotonic: true,
      },
    ],
  },
];

describe('MetricReader', () => {
  describe('setMetricProducer', () => {
    it('The SDK MUST NOT allow a MetricReader instance to be registered on more than one MeterProvider instance', () => {
      const reader = new TestMetricReader();
      assert.throws(
        () =>
          new MeterProvider({
            readers: [reader, reader],
          }),
        /MetricReader can not be bound to a MeterProvider again/
      );
      assert.throws(
        () =>
          new MeterProvider({
            readers: [reader],
          }),
        /MetricReader can not be bound to a MeterProvider again/
      );
    });
  });

  describe('setMetricProducer', () => {
    it('should initialize the metric reader', async () => {
      const reader = new TestMetricReader();

      reader.setMetricProducer(new TestMetricProducer());
      const result = await reader.collect();

      assert.deepStrictEqual(result, {
        resourceMetrics: emptyResourceMetrics,
        errors: [],
      });
      await reader.shutdown();
    });
  });

  describe('collect', () => {
    it('should throw on non-initialized instance', async () => {
      const reader = new TestMetricReader();

      await assert.rejects(
        () => reader.collect(),
        /MetricReader is not bound to a MetricProducer/
      );
    });

    it('should return empty on shut-down instance', async () => {
      const reader = new TestMetricReader();

      reader.setMetricProducer(new TestMetricProducer());

      await reader.shutdown();
      await assert.rejects(reader.collect(), /MetricReader is shutdown/);
    });

    it('should call MetricProducer.collect with timeout', async () => {
      const reader = new TestMetricReader();
      const producer = new TestMetricProducer();
      reader.setMetricProducer(producer);

      const collectSpy = sinon.spy(producer, 'collect');

      await reader.collect({ timeoutMillis: 20 });
      assert.ok(collectSpy.calledOnce);
      const args = collectSpy.args[0];
      assert.deepStrictEqual(args, [{ timeoutMillis: 20 }]);

      await reader.shutdown();
    });

    it('should collect metrics from the SDK and the additional metricProducers', async () => {
      const additionalProducer = new TestMetricProducer({
        resourceMetrics: {
          resource: resourceFromAttributes({
            shouldBeDiscarded: 'should-be-discarded',
          }),
          scopeMetrics: testScopeMetrics,
        },
      });
      const reader = new TestMetricReader({
        metricProducers: [additionalProducer],
      });
      const meterProvider = new MeterProvider({
        resource: testResource,
        readers: [reader],
      });

      // Make a measurement
      meterProvider
        .getMeter('someSdkMetrics')
        .createCounter('sdkCounter')
        .add(5, { hello: 'world' });
      const collectionResult = await reader.collect();

      assert.strictEqual(collectionResult.errors.length, 0);
      // Should keep the SDK's Resource only
      assert.deepStrictEqual(
        collectionResult.resourceMetrics.resource.attributes,
        testResource.attributes
      );
      assert.strictEqual(
        collectionResult.resourceMetrics.scopeMetrics.length,
        2
      );
      const [sdkScopeMetrics, additionalScopeMetrics] =
        collectionResult.resourceMetrics.scopeMetrics;

      assert.strictEqual(sdkScopeMetrics.scope.name, 'someSdkMetrics');
      assert.strictEqual(
        additionalScopeMetrics.scope.name,
        'additionalMetricProducerMetrics'
      );

      await reader.shutdown();
    });

    it('should merge the errors from the SDK and all metricProducers', async () => {
      const reader = new TestMetricReader({
        metricProducers: [
          new TestMetricProducer({ errors: ['err1'] }),
          new TestMetricProducer({ errors: ['err2'] }),
        ],
      });
      const meterProvider = new MeterProvider({
        readers: [reader],
      });

      // Provide a callback throwing an error too
      meterProvider
        .getMeter('someSdkMetrics')
        .createObservableCounter('sdkCounter')
        .addCallback(result => {
          throw 'errsdk';
        });
      const collectionResult = await reader.collect();

      assert.deepStrictEqual(collectionResult.errors, [
        'errsdk',
        'err1',
        'err2',
      ]);
      await reader.shutdown();
    });
  });

  describe('selectAggregation', () => {
    it('should override default when not provided with a selector', () => {
      assertAggregationSelector(
        new TestMetricReader(),
        DEFAULT_AGGREGATION_SELECTOR
      );
      assertAggregationSelector(
        new TestMetricReader({}),
        DEFAULT_AGGREGATION_SELECTOR
      );
    });

    it('should override default when provided with a selector', () => {
      const reader = new TestMetricReader({
        aggregationSelector: _instrumentType => {
          return {
            type: AggregationType.SUM,
          };
        },
      });
      assertAggregationSelector(reader, _instrumentType => {
        return {
          type: AggregationType.SUM,
        };
      });
      reader.shutdown();
    });
  });

  describe('selectAggregationTemporality', () => {
    it('should override default when not provided with a selector', () => {
      assertAggregationTemporalitySelector(
        new TestMetricReader(),
        DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR
      );
      assertAggregationTemporalitySelector(
        new TestMetricReader({}),
        DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR
      );
    });

    it('should override default when provided with a selector', () => {
      const reader = new TestMetricReader({
        aggregationTemporalitySelector: _instrumentType =>
          AggregationTemporality.DELTA,
      });
      assertAggregationTemporalitySelector(
        reader,
        _instrumentType => AggregationTemporality.DELTA
      );
      reader.shutdown();
    });
  });

  describe('shutdown', () => {
    class Deferred<T = void> {
      promise: Promise<T>;
      resolve!: (val: T) => void;
      reject!: (err: unknown) => void;
      constructor() {
        this.promise = new Promise((resolve, reject) => {
          this.resolve = resolve;
          this.reject = reject;
        });
      }
    }

    it('should only call onShutdown once on concurrent calls', async () => {
      let shutdownCalls = 0;
      const shutdownDeferred = new Deferred<void>();
      class SlowShutdownMetricReader extends TestMetricReader {
        protected override async onShutdown(): Promise<void> {
          shutdownCalls++;
          await shutdownDeferred.promise;
        }
      }

      const reader = new SlowShutdownMetricReader();
      reader.setMetricProducer(new TestMetricProducer());

      const p1 = reader.shutdown();
      const p2 = reader.shutdown();

      assert.strictEqual(shutdownCalls, 1);
      shutdownDeferred.resolve();
      await Promise.all([p1, p2]);
    });

    it('should independently respect deadlines when concurrent callers have different timeouts', async () => {
      const shutdownDeferred = new Deferred<void>();
      let shutdownCalls = 0;
      class ControlledShutdownMetricReader extends TestMetricReader {
        protected override async onShutdown(): Promise<void> {
          shutdownCalls++;
          await shutdownDeferred.promise;
        }
      }

      const reader = new ControlledShutdownMetricReader();
      reader.setMetricProducer(new TestMetricProducer());

      // Caller 1 has no timeout, Caller 2 has a short timeout
      const p1 = reader.shutdown();
      const p2 = reader.shutdown({ timeoutMillis: 20 });

      // Caller 2 specified a 20ms timeout and must timeout independently
      await assert.rejects(p2, /Operation timed out/);

      // onShutdown was only called once and continues running
      assert.strictEqual(shutdownCalls, 1);

      // Caller 1 should still be able to complete successfully once the underlying operation finishes
      shutdownDeferred.resolve();
      await p1;

      // The reader is marked as shutdown
      await assert.rejects(() => reader.collect(), /MetricReader is shutdown/);
    });

    it('should allow a longer-timeout caller to succeed even when an earlier caller timed out', async () => {
      const shutdownDeferred = new Deferred<void>();
      let shutdownCalls = 0;
      class ControlledShutdownMetricReader extends TestMetricReader {
        protected override async onShutdown(): Promise<void> {
          shutdownCalls++;
          await shutdownDeferred.promise;
        }
      }

      const reader = new ControlledShutdownMetricReader();
      reader.setMetricProducer(new TestMetricProducer());

      // Caller 1 has a short timeout, Caller 2 has a long timeout
      const p1 = reader.shutdown({ timeoutMillis: 20 });
      const p2 = reader.shutdown({ timeoutMillis: 500 });

      // Caller 1 times out
      await assert.rejects(p1, /Operation timed out/);

      // Caller 2 is still waiting
      assert.strictEqual(shutdownCalls, 1);

      // Completing the shutdown allows Caller 2 to finish
      shutdownDeferred.resolve();
      await p2;

      await assert.rejects(() => reader.collect(), /MetricReader is shutdown/);
    });

    it('should mark reader as shutdown even if shutdown times out', async () => {
      class SlowShutdownMetricReader extends TestMetricReader {
        protected override async onShutdown(): Promise<void> {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      const reader = new SlowShutdownMetricReader();
      reader.setMetricProducer(new TestMetricProducer());

      await assert.rejects(
        () => reader.shutdown({ timeoutMillis: 10 }),
        /Operation timed out/
      );

      await assert.rejects(() => reader.collect(), /MetricReader is shutdown/);
    });

    it('should allow subsequent shutdown calls to await the shared promise', async () => {
      const shutdownDeferred = new Deferred<void>();
      let shutdownCalls = 0;
      class ControlledShutdownMetricReader extends TestMetricReader {
        protected override async onShutdown(): Promise<void> {
          shutdownCalls++;
          await shutdownDeferred.promise;
        }
      }

      const reader = new ControlledShutdownMetricReader();
      reader.setMetricProducer(new TestMetricProducer());

      let p1Resolved = false;
      let p2Resolved = false;

      const p1 = reader.shutdown().then(() => {
        p1Resolved = true;
      });
      const p2 = reader.shutdown().then(() => {
        p2Resolved = true;
      });

      await new Promise(resolve => setTimeout(resolve, 10));
      assert.strictEqual(p1Resolved, false);
      assert.strictEqual(p2Resolved, false);
      assert.strictEqual(shutdownCalls, 1);

      shutdownDeferred.resolve();
      await Promise.all([p1, p2]);

      assert.strictEqual(p1Resolved, true);
      assert.strictEqual(p2Resolved, true);
    });

    it('should propagate shutdown rejection to all concurrent callers', async () => {
      const shutdownDeferred = new Deferred<void>();
      const expectedError = new Error('shutdown failure');
      class FailingShutdownMetricReader extends TestMetricReader {
        protected override async onShutdown(): Promise<void> {
          await shutdownDeferred.promise;
          throw expectedError;
        }
      }

      const reader = new FailingShutdownMetricReader();
      reader.setMetricProducer(new TestMetricProducer());

      const p1 = reader.shutdown();
      const p2 = reader.shutdown();

      shutdownDeferred.reject(expectedError);

      await assert.rejects(p1, /shutdown failure/);
      await assert.rejects(p2, /shutdown failure/);

      // Reader is still marked as shutdown
      await assert.rejects(() => reader.collect(), /MetricReader is shutdown/);
    });

    it('should make collect() and forceFlush() unavailable immediately after shutdown begins', async () => {
      const shutdownDeferred = new Deferred<void>();
      class ControlledShutdownMetricReader extends TestMetricReader {
        protected override async onShutdown(): Promise<void> {
          await shutdownDeferred.promise;
        }
      }

      const reader = new ControlledShutdownMetricReader();
      reader.setMetricProducer(new TestMetricProducer());

      const shutdownPromise = reader.shutdown();

      // collect() must throw immediately even while onShutdown is still pending
      await assert.rejects(() => reader.collect(), /MetricReader is shutdown/);

      // forceFlush() must log a warning and return immediately
      const diagWarnSpy = sinon.spy(diag, 'warn');
      await reader.forceFlush();
      assert.strictEqual(diagWarnSpy.calledOnce, true);
      assert.match(
        diagWarnSpy.firstCall.args[0],
        /Cannot forceFlush on already shutdown MetricReader/
      );
      diagWarnSpy.restore();

      shutdownDeferred.resolve();
      await shutdownPromise;
    });

    it('should warn when calling shutdown twice and return the shutdown promise', async () => {
      const reader = new TestMetricReader();
      reader.setMetricProducer(new TestMetricProducer());

      await reader.shutdown();

      const diagErrorSpy = sinon.spy(diag, 'error');
      await reader.shutdown();
      assert.strictEqual(diagErrorSpy.calledOnce, true);
      assert.match(
        diagErrorSpy.firstCall.args[0],
        /Cannot call shutdown twice/
      );
      diagErrorSpy.restore();
    });

    it('should prevent forceFlush after shutdown', async () => {
      const reader = new TestMetricReader();
      reader.setMetricProducer(new TestMetricProducer());

      await reader.shutdown();

      const diagWarnSpy = sinon.spy(diag, 'warn');
      await reader.forceFlush();
      assert.strictEqual(diagWarnSpy.calledOnce, true);
      assert.match(
        diagWarnSpy.firstCall.args[0],
        /Cannot forceFlush on already shutdown MetricReader/
      );
      diagWarnSpy.restore();
    });
  });
});
