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

import { CollectionResult } from './MetricData';

export interface MetricCollectOptions {
  /**
   * Timeout for the SDK to perform the involved asynchronous callback
   * functions.
   *
   * If the callback functions failed to finish the observation in time,
   * their results are discarded and an error is appended in the
   * {@link CollectionResult.errors}.
   */
  timeoutMillis?: number;
}

/**
 * This is a public interface that represent an export state of a IMetricReader.
 */
export interface MetricProducer {
  /**
   * Collects the metrics from the SDK. If there are asynchronous Instruments
   * involved, their callback functions will be triggered.
   */
  collect(options?: MetricCollectOptions): Promise<CollectionResult>;
}
