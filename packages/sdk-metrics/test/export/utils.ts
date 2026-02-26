/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
