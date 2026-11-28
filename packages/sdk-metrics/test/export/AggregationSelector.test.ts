/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import type { AggregationTemporalitySelector } from '../../src/export/AggregationSelector';
import {
  CumulativeTemporalitySelector,
  DeltaTemporalitySelector,
  LowMemoryTemporalitySelector,
  aggregationTemporalitySelectorFromPreference,
} from '../../src/export/AggregationSelector';
import {
  AggregationTemporality,
  AggregationTemporalityPreference,
} from '../../src/export/AggregationTemporality';
import { InstrumentType } from '../../src/export/MetricData';

const allInstrumentTypes = [
  InstrumentType.COUNTER,
  InstrumentType.OBSERVABLE_COUNTER,
  InstrumentType.UP_DOWN_COUNTER,
  InstrumentType.OBSERVABLE_UP_DOWN_COUNTER,
  InstrumentType.HISTOGRAM,
  InstrumentType.GAUGE,
  InstrumentType.OBSERVABLE_GAUGE,
];

function temporalityOf(
  selector: AggregationTemporalitySelector,
  instrumentType: InstrumentType
): string {
  return selector(instrumentType) === AggregationTemporality.DELTA
    ? 'delta'
    : 'cumulative';
}

describe('AggregationSelector', () => {
  describe('CumulativeTemporalitySelector', () => {
    it('selects cumulative for every instrument type', () => {
      for (const instrumentType of allInstrumentTypes) {
        assert.strictEqual(
          temporalityOf(CumulativeTemporalitySelector, instrumentType),
          'cumulative',
          `unexpected temporality for ${instrumentType}`
        );
      }
    });
  });

  describe('DeltaTemporalitySelector', () => {
    it('selects delta except for up-down counters', () => {
      const expected = new Map<InstrumentType, string>([
        [InstrumentType.COUNTER, 'delta'],
        [InstrumentType.OBSERVABLE_COUNTER, 'delta'],
        [InstrumentType.GAUGE, 'delta'],
        [InstrumentType.HISTOGRAM, 'delta'],
        [InstrumentType.OBSERVABLE_GAUGE, 'delta'],
        [InstrumentType.UP_DOWN_COUNTER, 'cumulative'],
        [InstrumentType.OBSERVABLE_UP_DOWN_COUNTER, 'cumulative'],
      ]);
      for (const [instrumentType, temporality] of expected) {
        assert.strictEqual(
          temporalityOf(DeltaTemporalitySelector, instrumentType),
          temporality,
          `unexpected temporality for ${instrumentType}`
        );
      }
    });
  });

  describe('LowMemoryTemporalitySelector', () => {
    it('selects delta only for counters and histograms', () => {
      const expected = new Map<InstrumentType, string>([
        [InstrumentType.COUNTER, 'delta'],
        [InstrumentType.HISTOGRAM, 'delta'],
        [InstrumentType.GAUGE, 'cumulative'],
        [InstrumentType.OBSERVABLE_COUNTER, 'cumulative'],
        [InstrumentType.OBSERVABLE_GAUGE, 'cumulative'],
        [InstrumentType.UP_DOWN_COUNTER, 'cumulative'],
        [InstrumentType.OBSERVABLE_UP_DOWN_COUNTER, 'cumulative'],
      ]);
      for (const [instrumentType, temporality] of expected) {
        assert.strictEqual(
          temporalityOf(LowMemoryTemporalitySelector, instrumentType),
          temporality,
          `unexpected temporality for ${instrumentType}`
        );
      }
    });
  });

  describe('aggregationTemporalitySelectorFromPreference', () => {
    it('maps each preference to its selector', () => {
      assert.strictEqual(
        aggregationTemporalitySelectorFromPreference(
          AggregationTemporalityPreference.DELTA
        ),
        DeltaTemporalitySelector
      );
      assert.strictEqual(
        aggregationTemporalitySelectorFromPreference(
          AggregationTemporalityPreference.CUMULATIVE
        ),
        CumulativeTemporalitySelector
      );
      assert.strictEqual(
        aggregationTemporalitySelectorFromPreference(
          AggregationTemporalityPreference.LOWMEMORY
        ),
        LowMemoryTemporalitySelector
      );
    });

    it('accepts a bare AggregationTemporality', () => {
      assert.strictEqual(
        aggregationTemporalitySelectorFromPreference(
          AggregationTemporality.DELTA
        ),
        DeltaTemporalitySelector
      );
      assert.strictEqual(
        aggregationTemporalitySelectorFromPreference(
          AggregationTemporality.CUMULATIVE
        ),
        CumulativeTemporalitySelector
      );
    });

    it('keeps the two enums numerically aligned for DELTA and CUMULATIVE', () => {
      // `OTLPMetricExporterOptions.temporalityPreference` and
      // `ConsoleMetricExporterOptions.temporalityPreference` accept the union
      // `AggregationTemporalityPreference | AggregationTemporality`, which only
      // works while the numeric values of the shared members agree.
      assert.strictEqual(
        AggregationTemporalityPreference.DELTA,
        AggregationTemporality.DELTA
      );
      assert.strictEqual(
        AggregationTemporalityPreference.CUMULATIVE,
        AggregationTemporality.CUMULATIVE
      );
    });
  });
});
