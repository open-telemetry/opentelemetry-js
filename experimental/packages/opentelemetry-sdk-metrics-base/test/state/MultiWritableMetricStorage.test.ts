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

import * as api from '@opentelemetry/api';
import { MetricAttributes } from '@opentelemetry/api-metrics';
import { hrTime } from '@opentelemetry/core';
import * as assert from 'assert';
import { MultiMetricStorage } from '../../src/state/MultiWritableMetricStorage';
import { WritableMetricStorage } from '../../src/state/WritableMetricStorage';
import { assertMeasurementEqual, commonAttributes, commonValues, Measurement } from '../util';

describe('MultiMetricStorage', () => {
  describe('record', () => {
    it('no exceptions on record', () => {
      const metricStorage = new MultiMetricStorage([]);

      for (const value of commonValues) {
        for (const attribute of commonAttributes) {
          metricStorage.record(value, attribute, api.context.active(), [0, 0]);
        }
      }
    });

    it('record with multiple backing storages', () => {
      class TestWritableMetricStorage implements WritableMetricStorage {
        records: Measurement[] = [];
        record(value: number, attributes: MetricAttributes, context: api.Context): void {
          this.records.push({ value, attributes, context });
        }
      }

      const backingStorage1 = new TestWritableMetricStorage();
      const backingStorage2 = new TestWritableMetricStorage();
      const metricStorage = new MultiMetricStorage([backingStorage1, backingStorage2]);

      const expectedMeasurements: Measurement[] = [];
      for (const value of commonValues) {
        for (const attributes of commonAttributes) {
          const context = api.context.active();
          expectedMeasurements.push({ value, attributes, context });
          metricStorage.record(value, attributes, context, hrTime());
        }
      }

      assert.strictEqual(backingStorage1.records.length, expectedMeasurements.length);
      assert.strictEqual(backingStorage2.records.length, expectedMeasurements.length);
      for (const [idx, expected] of expectedMeasurements.entries()) {
        assertMeasurementEqual(backingStorage1.records[idx], expected);
        assertMeasurementEqual(backingStorage2.records[idx], expected);
      }
    });
  });
});
