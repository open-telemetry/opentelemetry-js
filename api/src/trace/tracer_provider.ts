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

import { Tracer } from './tracer';
import { TracerOptions } from './tracer_options';

/**
 * A registry for creating named {@link Tracer}s.
 */
export interface TracerProvider {
  /**
   * Returns a Tracer, creating one if one with the given name and version is
   * not already created.
   *
   * This function may return different Tracer types (e.g.
   * {@link NoopTracerProvider} vs. a functional tracer).
   *
   * @param name The name of the tracer or instrumentation library.
   * @param version The version of the tracer or instrumentation library.
   * @param options The options of the tracer or instrumentation library.
   * @returns Tracer A Tracer with the given name and version
   */
  getTracer(name: string, version?: string, options?: TracerOptions): Tracer;
}
