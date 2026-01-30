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

import type { HrTime } from '@opentelemetry/api';

/**
 * Interface used to provide information to finish span on fetch response
 */
export interface FetchResponse {
  status: number;
  statusText?: string;
  url: string;
}

/**
 * Interface used to provide information to finish span on fetch error
 */
export interface FetchError {
  status?: number;
  message: string;
}

/**
 * Interface used to keep information about span between creating and
 * ending span
 */
export interface SpanData {
  entries: PerformanceResourceTiming[];
  observer?: PerformanceObserver;
  spanUrl: string;
  startTime: HrTime;
}
