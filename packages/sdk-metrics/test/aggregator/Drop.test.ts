/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HrTime } from '@opentelemetry/api';
import * as assert from 'assert';
import { AggregationTemporality } from '../../src';
import { DropAggregator } from '../../src/aggregator';
import { defaultInstrumentDescriptor } from '../util';

describe('DropAggregator', () => {
  describe('createAccumulation', () => {
    it('no exceptions', () => {
      const aggregator = new DropAggregator();
      const accumulation = aggregator.createAccumulation();
      assert.strictEqual(accumulation, undefined);
    });
  });

  describe('merge', () => {
    it('no exceptions', () => {
      const aggregator = new DropAggregator();
      const prev = aggregator.createAccumulation();
      const delta = aggregator.createAccumulation();
      assert.strictEqual(aggregator.merge(prev, delta), undefined);
    });
  });

  describe('diff', () => {
    it('no exceptions', () => {
      const aggregator = new DropAggregator();
      const prev = aggregator.createAccumulation();
      const curr = aggregator.createAccumulation();
      assert.strictEqual(aggregator.diff(prev, curr), undefined);
    });
  });

  describe('toMetricData', () => {
    it('no exceptions', () => {
      const aggregator = new DropAggregator();

      const endTime: HrTime = [1, 1];

      assert.strictEqual(
        aggregator.toMetricData(
          defaultInstrumentDescriptor,
          AggregationTemporality.CUMULATIVE,
          [[{}, undefined]],
          endTime
        ),
        undefined
      );
    });
  });
});
