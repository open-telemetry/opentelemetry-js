/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HrTime } from '@opentelemetry/api';
import { AggregationTemporality } from '../export/AggregationTemporality';
import { MetricData, MetricDescriptor } from '../export/MetricData';
import { Maybe } from '../utils';
import { AggregatorKind, Aggregator, AccumulationRecord } from './types';

/** Basic aggregator for None which keeps no recorded value. */
export class DropAggregator implements Aggregator<undefined> {
  kind: AggregatorKind.DROP = AggregatorKind.DROP;

  createAccumulation() {
    return undefined;
  }

  merge(_previous: undefined, _delta: undefined) {
    return undefined;
  }

  diff(_previous: undefined, _current: undefined) {
    return undefined;
  }

  toMetricData(
    _descriptor: MetricDescriptor,
    _aggregationTemporality: AggregationTemporality,
    _accumulationByAttributes: AccumulationRecord<undefined>[],
    _endTime: HrTime
  ): Maybe<MetricData> {
    return undefined;
  }
}
