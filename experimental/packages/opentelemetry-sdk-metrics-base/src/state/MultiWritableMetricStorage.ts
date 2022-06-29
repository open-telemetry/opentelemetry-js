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

import { Context, HrTime } from '@opentelemetry/api';
import { MetricAttributes } from '@opentelemetry/api-metrics';
import { WritableMetricStorage } from './WritableMetricStorage';

/**
 * Internal interface.
 */
export class MultiMetricStorage implements WritableMetricStorage {
  constructor(private readonly _backingStorages: WritableMetricStorage[]) {}

  record(value: number, attributes: MetricAttributes, context: Context, recordTime: HrTime) {
    this._backingStorages.forEach(it => {
      it.record(value, attributes, context, recordTime);
    });
  }
}
