/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { InstrumentType } from '../../src';
import {
  Aggregator,
  DropAggregator,
  HistogramAggregator,
  LastValueAggregator,
  SumAggregator,
} from '../../src/aggregator';
import { InstrumentDescriptor } from '../../src/InstrumentDescriptor';
import {
  DefaultAggregation,
  ExplicitBucketHistogramAggregation,
  HistogramAggregation,
} from '../../src/view/Aggregation';
import { defaultInstrumentDescriptor } from '../util';

interface AggregatorConstructor {
  new (...args: any[]): Aggregator<unknown>;
}

describe('DefaultAggregation', () => {
  describe('createAggregator', () => {
    it('should create aggregators for instrument descriptors', () => {
      // https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#default-aggregation
      const expectations: [InstrumentDescriptor, AggregatorConstructor][] = [
        [
          { ...defaultInstrumentDescriptor, type: InstrumentType.COUNTER },
          SumAggregator,
        ],
        [
          {
            ...defaultInstrumentDescriptor,
            type: InstrumentType.OBSERVABLE_COUNTER,
          },
          SumAggregator,
        ],
        [
          {
            ...defaultInstrumentDescriptor,
            type: InstrumentType.UP_DOWN_COUNTER,
          },
          SumAggregator,
        ],
        [
          {
            ...defaultInstrumentDescriptor,
            type: InstrumentType.OBSERVABLE_UP_DOWN_COUNTER,
          },
          SumAggregator,
        ],
        [
          {
            ...defaultInstrumentDescriptor,
            type: InstrumentType.OBSERVABLE_GAUGE,
          },
          LastValueAggregator,
        ],
        [
          { ...defaultInstrumentDescriptor, type: InstrumentType.HISTOGRAM },
          HistogramAggregator,
        ],
        // unknown instrument type
        [
          {
            ...defaultInstrumentDescriptor,
            type: -1 as unknown as InstrumentType,
          },
          DropAggregator,
        ],
      ];

      const aggregation = new DefaultAggregation();
      for (const [instrumentDescriptor, type] of expectations) {
        assert.ok(
          aggregation.createAggregator(instrumentDescriptor) instanceof type,
          `${InstrumentType[instrumentDescriptor.type]}`
        );
      }
    });
  });
});

describe('HistogramAggregator', () => {
  describe('createAggregator', () => {
    it('should create histogram aggregators with boundaries', () => {
      const aggregator = new HistogramAggregation().createAggregator(
        defaultInstrumentDescriptor
      );
      assert.ok(aggregator instanceof HistogramAggregator);
      assert.deepStrictEqual(
        aggregator['_boundaries'],
        [
          0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000, 7500,
          10000,
        ]
      );
    });
  });
});

describe('ExplicitBucketHistogramAggregation', () => {
  it('construct without exceptions', () => {
    const cases = [
      [1, 10, 100],
      [1, 10, 100, Infinity],
      [-Infinity, 1, 10, 100],
    ];
    for (const boundaries of cases) {
      const aggregation = new ExplicitBucketHistogramAggregation(boundaries);
      assert.ok(aggregation instanceof ExplicitBucketHistogramAggregation);
      assert.deepStrictEqual(aggregation['_boundaries'], [1, 10, 100]);
    }
  });

  it('construct with empty boundaries', function () {
    const boundaries: number[] = [];
    const aggregation = new ExplicitBucketHistogramAggregation(boundaries);
    assert.ok(aggregation instanceof ExplicitBucketHistogramAggregation);
    assert.deepStrictEqual(aggregation['_boundaries'], []);
  });

  it('construct with undefined boundaries should throw', function () {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore simulate how a JS user could pass undefined
    assert.throws(() => new ExplicitBucketHistogramAggregation(undefined));
  });

  it('construct with null boundaries should throw', function () {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore simulate how a JS user could pass null
    assert.throws(() => new ExplicitBucketHistogramAggregation(null));
  });

  it('constructor should not modify inputs', () => {
    const boundaries = [100, 10, 1];
    const aggregation = new ExplicitBucketHistogramAggregation(boundaries);
    assert.ok(aggregation instanceof ExplicitBucketHistogramAggregation);
    assert.deepStrictEqual(aggregation['_boundaries'], [1, 10, 100]);
    assert.deepStrictEqual(boundaries, [100, 10, 1]);
  });

  describe('createAggregator', () => {
    it('should create histogram aggregators with boundaries', () => {
      const aggregator1 = new ExplicitBucketHistogramAggregation([
        100, 10, 1,
      ]).createAggregator(defaultInstrumentDescriptor);
      assert.ok(aggregator1 instanceof HistogramAggregator);
      assert.deepStrictEqual(aggregator1['_boundaries'], [1, 10, 100]);

      const aggregator2 = new ExplicitBucketHistogramAggregation([
        -Infinity,
        -Infinity,
        10,
        100,
        1000,
        Infinity,
        Infinity,
      ]).createAggregator(defaultInstrumentDescriptor);
      assert.ok(aggregator2 instanceof HistogramAggregator);
      assert.deepStrictEqual(aggregator2['_boundaries'], [10, 100, 1000]);
    });

    describe('should create histogram aggregators', () => {
      it('with min/max recording by default', () => {
        const aggregator = new ExplicitBucketHistogramAggregation([
          100, 10, 1,
        ]).createAggregator(defaultInstrumentDescriptor);
        assert.deepStrictEqual(aggregator['_recordMinMax'], true);
      });

      it('with min/max recording when _recordMinMax is set to true', () => {
        const aggregator = new ExplicitBucketHistogramAggregation(
          [100, 10, 1],
          true
        ).createAggregator(defaultInstrumentDescriptor);
        assert.deepStrictEqual(aggregator['_recordMinMax'], true);
      });

      it('without min/max recording when _recordMinMax is set to true', () => {
        const aggregator = new ExplicitBucketHistogramAggregation(
          [100, 10, 1],
          false
        ).createAggregator(defaultInstrumentDescriptor);
        assert.deepStrictEqual(aggregator['_recordMinMax'], false);
      });
    });
  });
});
