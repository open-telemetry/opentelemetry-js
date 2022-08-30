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
import { HrTime } from '@opentelemetry/api';
import { BatchObservableCallback, Observable, ObservableCallback } from '@opentelemetry/api-metrics';
import { isObservableInstrument, ObservableInstrument } from '../Instruments';
import { BatchObservableResultImpl, ObservableResultImpl } from '../ObservableResult';
import { callWithTimeout, PromiseAllSettled, isPromiseAllSettledRejectionResult, setEquals } from '../utils';

/**
 * Records for single instrument observable callback.
 */
interface ObservableCallbackRecord {
  callback: ObservableCallback;
  instrument: ObservableInstrument;
}

/**
 * Records for multiple instruments observable callback.
 */
interface BatchObservableCallbackRecord {
  callback: BatchObservableCallback;
  instruments: Set<ObservableInstrument>;
}

/**
 * An internal interface for managing ObservableCallbacks.
 *
 * Every registered callback associated with a set of instruments are be evaluated
 * exactly once during collection prior to reading data for that instrument.
 */
export class ObservableRegistry {
  private _callbacks: ObservableCallbackRecord[] = [];
  private _batchCallbacks: BatchObservableCallbackRecord[] = [];

  addCallback(callback: ObservableCallback, instrument: ObservableInstrument) {
    const idx = this._findCallback(callback, instrument);
    if (idx >= 0) {
      return;
    }
    this._callbacks.push({ callback, instrument });
  }

  removeCallback(callback: ObservableCallback, instrument: ObservableInstrument) {
    const idx = this._findCallback(callback, instrument);
    if (idx < 0) {
      return;
    }
    this._callbacks.splice(idx, 1);
  }

  addBatchCallback(callback: BatchObservableCallback, instruments: Observable[]) {
    // Create a set of unique instruments.
    const observableInstruments = new Set(instruments.filter(isObservableInstrument));
    if (observableInstruments.size === 0) {
      api.diag.error('BatchObservableCallback is not associated with valid instruments', instruments);
      return;
    }
    const idx = this._findBatchCallback(callback, observableInstruments);
    if (idx >= 0) {
      return;
    }
    this._batchCallbacks.push({ callback, instruments: observableInstruments });
  }

  removeBatchCallback(callback: BatchObservableCallback, instruments: Observable[]) {
    // Create a set of unique instruments.
    const observableInstruments = new Set(instruments.filter(isObservableInstrument));
    const idx = this._findBatchCallback(callback, observableInstruments);
    if (idx < 0) {
      return;
    }
    this._batchCallbacks.splice(idx, 1);
  }

  /**
   * @returns a promise of rejected reasons for invoking callbacks.
   */
  async observe(collectionTime: HrTime, timeoutMillis?: number): Promise<unknown[]> {
    const callbackFutures = this._observeCallbacks(collectionTime, timeoutMillis);
    const batchCallbackFutures = this._observeBatchCallbacks(collectionTime, timeoutMillis);

    const results = await PromiseAllSettled([...callbackFutures, ...batchCallbackFutures]);

    const rejections = results.filter(isPromiseAllSettledRejectionResult)
      .map(it => it.reason);
    return rejections;
  }

  private _observeCallbacks(observationTime: HrTime, timeoutMillis?: number) {
    return this._callbacks
      .map(async ({ callback, instrument }) => {
        const observableResult = new ObservableResultImpl(instrument._descriptor);
        let callPromise: Promise<void> = Promise.resolve(callback(observableResult));
        if (timeoutMillis != null) {
          callPromise = callWithTimeout(callPromise, timeoutMillis);
        }
        await callPromise;
        instrument._metricStorages.forEach(metricStorage => {
          metricStorage.record(observableResult._buffer, observationTime);
        });
      });
  }

  private _observeBatchCallbacks(observationTime: HrTime, timeoutMillis?: number) {
    return this._batchCallbacks
      .map(async ({ callback, instruments }) => {
        const observableResult = new BatchObservableResultImpl();
        let callPromise: Promise<void> = Promise.resolve(callback(observableResult));
        if (timeoutMillis != null) {
          callPromise = callWithTimeout(callPromise, timeoutMillis);
        }
        await callPromise;
        instruments.forEach(instrument => {
          const buffer = observableResult._buffer.get(instrument);
          if (buffer == null) {
            return;
          }
          instrument._metricStorages.forEach(metricStorage => {
            metricStorage.record(buffer, observationTime);
          });
        });
      });
  }

  private _findCallback(callback: ObservableCallback, instrument: ObservableInstrument) {
    return this._callbacks.findIndex(record => {
      return record.callback === callback && record.instrument === instrument;
    });
  }

  private _findBatchCallback(callback: BatchObservableCallback, instruments: Set<ObservableInstrument>) {
    return this._batchCallbacks.findIndex(record => {
      return record.callback === callback && setEquals(record.instruments, instruments);
    });
  }
}
