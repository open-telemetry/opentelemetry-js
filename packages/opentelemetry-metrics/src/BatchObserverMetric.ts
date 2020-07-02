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
import { InstrumentationLibrary } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { BatchObserverResult } from './BatchObserverResult';
import { BoundObserver } from './BoundInstrument';
import { Batcher } from './export/Batcher';
import { MetricKind, MetricRecord } from './export/types';
import { Metric } from './Metric';

const NOOP_CALLBACK = () => {};
const MAX_TIMEOUT_UPDATE_MS = 500;

/** This is a SDK implementation of Batch Observer Metric. */
export class BatchObserverMetric extends Metric<BoundObserver>
  implements api.BatchObserver {
  private _callback: (observerResult: api.BatchObserverResult) => void;
  private _maxTimeoutUpdateMS: number;

  constructor(
    name: string,
    options: api.BatchMetricOptions,
    private readonly _batcher: Batcher,
    resource: Resource,
    instrumentationLibrary: InstrumentationLibrary,
    callback?: (observerResult: api.BatchObserverResult) => void
  ) {
    super(
      name,
      options,
      MetricKind.VALUE_OBSERVER,
      resource,
      instrumentationLibrary
    );
    this._maxTimeoutUpdateMS =
      options.maxTimeoutUpdateMS ?? MAX_TIMEOUT_UPDATE_MS;
    this._callback = callback || NOOP_CALLBACK;
  }

  protected _makeInstrument(labels: api.Labels): BoundObserver {
    return new BoundObserver(
      labels,
      this._disabled,
      this._valueType,
      this._logger,
      this._batcher.aggregatorFor(this._descriptor)
    );
  }

  getMetricRecord(): Promise<MetricRecord[]> {
    this._logger.debug('getMetricRecord - start');
    return new Promise((resolve, reject) => {
      const observerResult = new BatchObserverResult();

      // cancels after MAX_TIMEOUT_MS - no more waiting for results
      const timer = setTimeout(() => {
        observerResult.cancelled = true;
        // remove callback to prevent user from updating the values later if
        // for any reason the observerBatchResult will be referenced
        observerResult.onObserveCalled();
        super.getMetricRecord().then(resolve, reject);
        this._logger.debug('getMetricRecord - timeout');
      }, this._maxTimeoutUpdateMS);

      // sets callback for each "observe" method
      observerResult.onObserveCalled(() => {
        clearTimeout(timer);
        super.getMetricRecord().then(resolve, reject);
        this._logger.debug('getMetricRecord - end');
      });

      // calls the BatchObserverResult callback
      this._callback(observerResult);
    });
  }
}
