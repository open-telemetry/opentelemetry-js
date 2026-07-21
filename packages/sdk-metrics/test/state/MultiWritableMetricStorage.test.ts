/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as api from '@opentelemetry/api';
import type { Attributes, Context } from '@opentelemetry/api';
import * as assert from 'assert';
import { SumAggregator } from '../../src/aggregator';
import { AggregationTemporality } from '../../src/export/AggregationTemporality';
import type { MetricCollectorHandle } from '../../src/state/MetricCollector';
import { MultiMetricStorage } from '../../src/state/MultiWritableMetricStorage';
import { SyncMetricStorage } from '../../src/state/SyncMetricStorage';
import type { WritableMetricStorage } from '../../src/state/WritableMetricStorage';
import type { IAttributesProcessor } from '../../src/view/AttributesProcessor';
import type { Measurement } from '../util';
import {
  assertMeasurementEqual,
  commonAttributes,
  commonValues,
  defaultInstrumentDescriptor,
} from '../util';

describe('MultiMetricStorage', () => {
  describe('record', () => {
    it('no exceptions on record', () => {
      const metricStorage = new MultiMetricStorage([]);

      for (const value of commonValues) {
        for (const attribute of commonAttributes) {
          metricStorage.record(value, attribute, undefined, 0);
        }
      }
    });

    it('record with multiple backing storages', () => {
      class TestWritableMetricStorage implements WritableMetricStorage {
        hasAttributeProcessor = false;
        records: Measurement[] = [];
        record(
          value: number,
          attributes: Attributes,
          context: api.Context
        ): void {
          this.records.push({ value, attributes, context });
        }
      }

      const backingStorage1 = new TestWritableMetricStorage();
      const backingStorage2 = new TestWritableMetricStorage();
      const metricStorage = new MultiMetricStorage([
        backingStorage1,
        backingStorage2,
      ]);

      const expectedMeasurements: Measurement[] = [];
      for (const value of commonValues) {
        for (const attributes of commonAttributes) {
          const context = api.context.active();
          expectedMeasurements.push({ value, attributes, context });
          metricStorage.record(value, attributes, context, Date.now());
        }
      }

      assert.strictEqual(
        backingStorage1.records.length,
        expectedMeasurements.length
      );
      assert.strictEqual(
        backingStorage2.records.length,
        expectedMeasurements.length
      );
      for (const [idx, expected] of expectedMeasurements.entries()) {
        assertMeasurementEqual(backingStorage1.records[idx], expected);
        assertMeasurementEqual(backingStorage2.records[idx], expected);
      }
    });

    it('should resolve active context for attribute processors', () => {
      const deltaCollector: MetricCollectorHandle = {
        selectAggregationTemporality: () => AggregationTemporality.DELTA,
        selectCardinalityLimit: () => 2000,
      };

      const processor: IAttributesProcessor = {
        process(incoming: Attributes, context?: Context) {
          assert.strictEqual(context, api.context.active());
          return incoming;
        },
      };

      const storage1 = new SyncMetricStorage(
        defaultInstrumentDescriptor,
        new SumAggregator(true),
        processor,
        [deltaCollector]
      );
      const storage2 = new SyncMetricStorage(
        defaultInstrumentDescriptor,
        new SumAggregator(true),
        processor,
        [deltaCollector]
      );
      const multi = new MultiMetricStorage([storage1, storage2]);

      multi.record(1, {}, undefined, 0);
    });

    it('should pass provided context to attribute processor', () => {
      const deltaCollector: MetricCollectorHandle = {
        selectAggregationTemporality: () => AggregationTemporality.DELTA,
        selectCardinalityLimit: () => 2000,
      };

      const expectedContext = api.ROOT_CONTEXT.setValue(
        api.createContextKey('test'),
        'value'
      );
      const processor: IAttributesProcessor = {
        process(incoming: Attributes, context?: Context) {
          assert.strictEqual(context, expectedContext);
          return incoming;
        },
      };

      const storage1 = new SyncMetricStorage(
        defaultInstrumentDescriptor,
        new SumAggregator(true),
        processor,
        [deltaCollector]
      );
      const storage2 = new SyncMetricStorage(
        defaultInstrumentDescriptor,
        new SumAggregator(true),
        processor,
        [deltaCollector]
      );
      const multi = new MultiMetricStorage([storage1, storage2]);

      multi.record(1, {}, expectedContext, 0);
    });
  });
});
