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

import { Tracer } from './tracer';

/**
 * TracerFactory is an object that creates a new {@link Tracer}.
 */
export interface TracerFactory {
  /**
   * Find or creates a tracer for the named instrumentation library. If the name
   * is empty or null, a default tracer is returned.
   * @param name must identify the instrumentation library.
   * @param version is the semantic version of the instrumentation library.
   */
  getTracer(name?: string, version?: string): Tracer;
}
