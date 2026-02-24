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

import { HrTime } from '@opentelemetry/api';
import {
  Accumulation,
  AccumulationRecord,
  Aggregator,
} from '../aggregator/types';
import { MetricData } from '../export/MetricData';
import { InstrumentDescriptor } from '../InstrumentDescriptor';
import { AggregationTemporality } from '../export/AggregationTemporality';
import { Maybe } from '../utils';
import { MetricCollectorHandle } from './MetricCollector';
import { AttributeHashMap } from './HashMap';

/**
 * Remembers what was presented to a specific exporter.
 */
interface LastReportedHistory<T extends Maybe<Accumulation>> {
  /**
   * The last accumulation of metric data.
   */
  accumulations: AttributeHashMap<T>;
  /**
   * The timestamp the data was reported.
   */
  collectionTime: HrTime;
  /**
   * The AggregationTemporality used to aggregate reports.
   */
  aggregationTemporality: AggregationTemporality;
}

/**
 * Internal interface.
 *
 * Provides unique reporting for each collector. Allows synchronous collection
 * of metrics and reports given temporality values.
 */
export class TemporalMetricProcessor<T extends Maybe<Accumulation>> {
  private _aggregator: Aggregator<T>;
  private _unreportedAccumulations = new Map<
    MetricCollectorHandle,
    AttributeHashMap<T>
  >();
  private _reportHistory = new Map<
    MetricCollectorHandle,
    LastReportedHistory<T>
  >();

  constructor(
    aggregator: Aggregator<T>,
    collectorHandles: MetricCollectorHandle[]
  ) {
    this._aggregator = aggregator;
    collectorHandles.forEach(handle => {
      this._unreportedAccumulations.set(handle, new AttributeHashMap<T>());
    });
  }

  /**
   * Builds the {@link MetricData} streams to report against a specific MetricCollector.
   * @param collector The information of the MetricCollector.
   * @param instrumentDescriptor The instrumentation descriptor that these metrics generated with.
   * @param currentAccumulations The current accumulation of metric data from instruments.
   * @param collectionTime The current collection timestamp.
   * @returns The {@link MetricData} points or `null`.
   */
  buildMetrics(
    collector: MetricCollectorHandle,
    instrumentDescriptor: InstrumentDescriptor,
    currentAccumulations: AttributeHashMap<T>,
    collectionTime: HrTime
  ): Maybe<MetricData> {
    this._stashAccumulations(currentAccumulations);
    const unreportedAccumulations =
      this._getAndResetUnreportedAccumulations(collector);

    let result = unreportedAccumulations;
    let aggregationTemporality: AggregationTemporality;
    // Check our last report time.
    if (this._reportHistory.has(collector)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const last = this._reportHistory.get(collector)!;
      const lastCollectionTime = last.collectionTime;
      aggregationTemporality = last.aggregationTemporality;

      // Use aggregation temporality + instrument to determine if we do a merge or a diff of
      // previous. We have the following four scenarios:
      // 1. Cumulative Aggregation (temporality) + Delta recording (sync instrument).
      //    Here we merge with our last record to get a cumulative aggregation.
      // 2. Cumulative Aggregation + Cumulative recording (async instrument).
      //    Cumulative records are converted to delta recording with DeltaMetricProcessor.
      //    Here we merge with our last record to get a cumulative aggregation.
      // 3. Delta Aggregation + Delta recording
      //    Calibrate the startTime of metric streams to be the reader's lastCollectionTime.
      // 4. Delta Aggregation + Cumulative recording.
      //    Cumulative records are converted to delta recording with DeltaMetricProcessor.
      //    Calibrate the startTime of metric streams to be the reader's lastCollectionTime.
      if (aggregationTemporality === AggregationTemporality.CUMULATIVE) {
        // We need to make sure the current delta recording gets merged into the previous cumulative
        // for the next cumulative recording.
        result = TemporalMetricProcessor.merge(
          last.accumulations,
          unreportedAccumulations,
          this._aggregator
        );
      } else {
        result = TemporalMetricProcessor.calibrateStartTime(
          last.accumulations,
          unreportedAccumulations,
          lastCollectionTime
        );
      }
    } else {
      // Call into user code to select aggregation temporality for the instrument.
      aggregationTemporality = collector.selectAggregationTemporality(
        instrumentDescriptor.type
      );
    }

    // Update last reported (cumulative) accumulation.
    this._reportHistory.set(collector, {
      accumulations: result,
      collectionTime,
      aggregationTemporality,
    });

    const accumulationRecords = AttributesMapToAccumulationRecords(result);

    // do not convert to metric data if there is nothing to convert.
    if (accumulationRecords.length === 0) {
      return undefined;
    }

    return this._aggregator.toMetricData(
      instrumentDescriptor,
      aggregationTemporality,
      accumulationRecords,
      /* endTime */ collectionTime
    );
  }

  private _stashAccumulations(currentAccumulation: AttributeHashMap<T>) {
    const registeredCollectors = this._unreportedAccumulations.keys();
    for (const collector of registeredCollectors) {
      const stash =
        this._unreportedAccumulations.get(collector) ??
        new AttributeHashMap<T>();
      this._unreportedAccumulations.set(
        collector,
        TemporalMetricProcessor.merge(
          stash,
          currentAccumulation,
          this._aggregator
        )
      );
    }
  }

  private _getAndResetUnreportedAccumulations(
    collector: MetricCollectorHandle
  ) {
    const result =
      this._unreportedAccumulations.get(collector) ?? new AttributeHashMap<T>();
    this._unreportedAccumulations.set(collector, new AttributeHashMap<T>());
    return result;
  }

  static merge<T extends Maybe<Accumulation>>(
    last: AttributeHashMap<T>,
    current: AttributeHashMap<T>,
    aggregator: Aggregator<T>
  ) {
    const result = last;
    const iterator = current.entries();
    let next = iterator.next();
    while (next.done !== true) {
      const [key, record, hash] = next.value;
      if (last.has(key, hash)) {
        const lastAccumulation = last.get(key, hash);
        // last.has() returned true, lastAccumulation is present.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const accumulation = aggregator.merge(lastAccumulation!, record);
        result.set(key, accumulation, hash);
      } else {
        result.set(key, record, hash);
      }

      next = iterator.next();
    }
    return result;
  }

  /**
   * Calibrate the reported metric streams' startTime to lastCollectionTime. Leaves
   * the new stream to be the initial observation time unchanged.
   */
  static calibrateStartTime<T extends Maybe<Accumulation>>(
    last: AttributeHashMap<T>,
    current: AttributeHashMap<T>,
    lastCollectionTime: HrTime
  ) {
    for (const [key, hash] of last.keys()) {
      const currentAccumulation = current.get(key, hash);
      currentAccumulation?.setStartTime(lastCollectionTime);
    }
    return current;
  }
}

// TypeScript complains about converting 3 elements tuple to AccumulationRecord<T>.
function AttributesMapToAccumulationRecords<T>(
  map: AttributeHashMap<T>
): AccumulationRecord<T>[] {
  return Array.from(map.entries()) as unknown as AccumulationRecord<T>[];
}
