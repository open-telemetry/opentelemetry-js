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

import { ObservableCallback } from '@opentelemetry/api-metrics-wip';
import { MetricStorage } from './MetricStorage';
import { ObservableResult } from '../ObservableResult';

/**
 * An internal state interface for ObservableCallbacks.
 *
 * An ObservableCallback can be bound to multiple AsyncMetricStorage at once.
 * However they must not be called multiple times during a single collection
 * operation.
 */
export class ObservableRegistry {
  private _callbackMap = new Map<ObservableCallback, MetricStorage[]>();
  private _observableResultMemo = new Map<ObservableCallback, ObservableResult>();

  addCallback(callback: ObservableCallback, metricStorage: MetricStorage) {
    let arr = this._callbackMap.get(callback);
    if (arr == null) {
      arr = [];
      this._callbackMap.set(callback, arr);
    }
    arr.push(metricStorage);
  }

  getObservableResult(callback: ObservableCallback): ObservableResult | undefined {
    const result = this._observableResultMemo.get(callback);
    return result;
  }

  async observe(): Promise<void> {
    this._observableResultMemo = new Map();
    const promise = Promise.all(Array.from(this._callbackMap.keys()).map(observableCallback => {
      const observableResult = new ObservableResult();
      this._observableResultMemo.set(observableCallback, observableResult);
      // TODO: timeout with callback
      return observableCallback(observableResult);
    }));

    await promise;
  }
}
