/*!
 * Copyright 2020, OpenTelemetry Authors
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

type Subscriber = (value?: number) => void;

/**
 * Implements the Metric Observable pattern
 */
export class MetricObservable implements api.MetricObservable {
  private _subscribers: Subscriber[] = [];

  next(value: number) {
    for (const subscriber of this._subscribers) {
      subscriber(value);
    }
  }

  subscribe(subscriber: Function) {
    if (typeof subscriber === 'function') {
      this._subscribers.push(subscriber as Subscriber);
    }
  }

  unsubscribe(subscriber?: Function) {
    if (typeof subscriber === 'function') {
      for (let i = 0, j = this._subscribers.length; i < j; i++) {
        if (this._subscribers[i] === subscriber) {
          this._subscribers.splice(i, 1);
          break;
        }
      }
    } else {
      this._subscribers = [];
    }
  }
}
