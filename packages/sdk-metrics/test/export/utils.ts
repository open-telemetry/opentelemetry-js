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

import {
  AggregationSelector,
  AggregationTemporalitySelector,
  InstrumentType,
  IMetricReader,
  PushMetricExporter,
} from '../../src';
import * as assert from 'assert';

const instrumentTypes = [
  InstrumentType.COUNTER,
  InstrumentType.OBSERVABLE_COUNTER,
  InstrumentType.UP_DOWN_COUNTER,
  InstrumentType.OBSERVABLE_UP_DOWN_COUNTER,
  InstrumentType.HISTOGRAM,
  InstrumentType.GAUGE,
  InstrumentType.OBSERVABLE_GAUGE,
];

/**
 * Check if AggregationSelectors behave in the same way.
 * @param reader
 * @param expectedSelector
 */
export function assertAggregationSelector(
  reader: IMetricReader | PushMetricExporter,
  expectedSelector: AggregationSelector
) {
  for (const instrumentType of instrumentTypes) {
    assert.deepStrictEqual(
      reader.selectAggregation?.(instrumentType),
      expectedSelector(instrumentType),
      `incorrect aggregation selection for ${InstrumentType[instrumentType]}`
    );
  }
}

/**
 * Check if AggregationTemporalitySelectors behave in the same way.
 * @param reader
 * @param expectedSelector
 */
export function assertAggregationTemporalitySelector(
  reader: IMetricReader | PushMetricExporter,
  expectedSelector: AggregationTemporalitySelector
) {
  for (const instrumentType of instrumentTypes) {
    assert.strictEqual(
      reader.selectAggregationTemporality?.(instrumentType),
      expectedSelector(instrumentType),
      `incorrect aggregation temporality selection for ${InstrumentType[instrumentType]}`
    );
  }
}
