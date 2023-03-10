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

import { Context, HrTime, MetricAttributes } from '@opentelemetry/api';
import { Maybe } from '../utils';
import { Accumulation, Aggregator } from '../aggregator/types';
import { AttributeHashMap } from './HashMap';

/**
 * Internal interface.
 *
 * Allows synchronous collection of metrics. This processor should allow
 * allocation of new aggregation cells for metrics and convert cumulative
 * recording to delta data points.
 */
export class DeltaMetricProcessor<T extends Maybe<Accumulation>> {
  private _activeCollectionStorage = new AttributeHashMap<T>();
  // TODO: find a reasonable mean to clean the memo;
  // https://github.com/open-telemetry/opentelemetry-specification/pull/2208
  private _cumulativeMemoStorage = new AttributeHashMap<T>();

  constructor(private _aggregator: Aggregator<T>) {}

  record(
    value: number,
    attributes: MetricAttributes,
    _context: Context,
    collectionTime: HrTime
  ) {
    const accumulation = this._activeCollectionStorage.getOrDefault(
      attributes,
      () => this._aggregator.createAccumulation(collectionTime)
    );
    accumulation?.record(value);
  }

  batchCumulate(
    measurements: AttributeHashMap<number>,
    collectionTime: HrTime
  ) {
    Array.from(measurements.entries()).forEach(
      ([attributes, value, hashCode]) => {
        const accumulation =
          this._aggregator.createAccumulation(collectionTime);
        accumulation?.record(value);
        let delta = accumulation;
        // Diff with recorded cumulative memo.
        if (this._cumulativeMemoStorage.has(attributes, hashCode)) {
          // has() returned true, previous is present.
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const previous = this._cumulativeMemoStorage.get(
            attributes,
            hashCode
          )!;
          delta = this._aggregator.diff(previous, accumulation);
        }
        // Merge with uncollected active delta.
        if (this._activeCollectionStorage.has(attributes, hashCode)) {
          // has() returned true, previous is present.
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const active = this._activeCollectionStorage.get(
            attributes,
            hashCode
          )!;
          delta = this._aggregator.merge(active, delta);
        }

        // Save the current record and the delta record.
        this._cumulativeMemoStorage.set(attributes, accumulation, hashCode);
        this._activeCollectionStorage.set(attributes, delta, hashCode);
      }
    );
  }

  /**
   * Returns a collection of delta metrics. Start time is the when first
   * time event collected.
   */
  collect() {
    const unreportedDelta = this._activeCollectionStorage;
    this._activeCollectionStorage = new AttributeHashMap();
    return unreportedDelta;
  }
}
