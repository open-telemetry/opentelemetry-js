/*!
 * Copyright 2019, OpenTelemetry Authors
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

import { SpanContext } from './span_context';

/**
 * This interface represent a sampler. Sampling is a mechanism to control the
 * noise and overhead introduced by OpenTelemetry by reducing the number of
 * samples of traces collected and sent to the backend.
 */
export interface Sampler {
  /**
   * Checks whether span needs to be created and tracked.
   *
   * TODO: Consider to add required arguments https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/sampling-api.md#shouldsample
   * @param [parentContext] Parent span context. Typically taken from the wire.
   *     Can be null.
   * @returns whether span should be sampled or not.
   */
  shouldSample(parentContext?: SpanContext): boolean;

  /** Returns the sampler name or short description with the configuration. */
  toString(): string;
}
