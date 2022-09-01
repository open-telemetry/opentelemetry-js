import {
  AggregationSelector,
  AggregationTemporalitySelector,
  InstrumentType,
  MetricReader
} from '../../src';
import * as assert from 'assert';


/**
 * Check if AggregationSelectors behave in the same way.
 * @param reader
 * @param expectedAggregationSelector
 */
export function assertAggregationSelector(reader: MetricReader, expectedAggregationSelector: AggregationSelector) {
  assert.strictEqual(reader.selectAggregation(InstrumentType.COUNTER), expectedAggregationSelector(InstrumentType.COUNTER));
  assert.strictEqual(reader.selectAggregation(InstrumentType.OBSERVABLE_COUNTER), expectedAggregationSelector(InstrumentType.OBSERVABLE_COUNTER));
  assert.strictEqual(reader.selectAggregation(InstrumentType.UP_DOWN_COUNTER), expectedAggregationSelector(InstrumentType.UP_DOWN_COUNTER));
  assert.strictEqual(reader.selectAggregation(InstrumentType.OBSERVABLE_UP_DOWN_COUNTER), expectedAggregationSelector(InstrumentType.OBSERVABLE_UP_DOWN_COUNTER));
  assert.strictEqual(reader.selectAggregation(InstrumentType.HISTOGRAM), expectedAggregationSelector(InstrumentType.HISTOGRAM));
  assert.strictEqual(reader.selectAggregation(InstrumentType.OBSERVABLE_GAUGE), expectedAggregationSelector(InstrumentType.OBSERVABLE_GAUGE));
}

/**
 * Check if AggregationTemporalitySelectors behave in the same way.
 * @param reader
 * @param expectedSelector
 */
export function assertAggregationTemporalitySelector(reader: MetricReader, expectedSelector: AggregationTemporalitySelector) {
  assert.strictEqual(reader.selectAggregationTemporality(InstrumentType.COUNTER), expectedSelector(InstrumentType.COUNTER));
  assert.strictEqual(reader.selectAggregationTemporality(InstrumentType.OBSERVABLE_COUNTER), expectedSelector(InstrumentType.OBSERVABLE_COUNTER));
  assert.strictEqual(reader.selectAggregationTemporality(InstrumentType.UP_DOWN_COUNTER), expectedSelector(InstrumentType.UP_DOWN_COUNTER));
  assert.strictEqual(reader.selectAggregationTemporality(InstrumentType.OBSERVABLE_UP_DOWN_COUNTER), expectedSelector(InstrumentType.OBSERVABLE_UP_DOWN_COUNTER));
  assert.strictEqual(reader.selectAggregationTemporality(InstrumentType.OBSERVABLE_GAUGE), expectedSelector(InstrumentType.OBSERVABLE_GAUGE));
  assert.strictEqual(reader.selectAggregationTemporality(InstrumentType.HISTOGRAM), expectedSelector(InstrumentType.HISTOGRAM));
}
