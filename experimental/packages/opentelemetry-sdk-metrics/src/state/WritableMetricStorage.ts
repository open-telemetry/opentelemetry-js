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
import { AttributeHashMap } from './HashMap';

/**
 * Internal interface. Stores measurements and allows synchronous writes of
 * measurements.
 *
 * An interface representing SyncMetricStorage with type parameters removed.
 */
export interface WritableMetricStorage {
  /** Records a measurement. */
  record(value: number, attributes: MetricAttributes, context: Context, recordTime: HrTime): void;
}

/**
 * Internal interface. Stores measurements and allows asynchronous writes of
 * measurements.
 *
 * An interface representing AsyncMetricStorage with type parameters removed.
 */
export interface AsyncWritableMetricStorage {
  /** Records a batch of measurements. */
  record(measurements: AttributeHashMap<number>, observationTime: HrTime): void;
}
