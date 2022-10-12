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

import { NoopTracer } from './NoopTracer';
import { Tracer } from './tracer';
import { TracerOptions } from './tracer_options';
import { TracerProvider } from './tracer_provider';

/**
 * An implementation of the {@link TracerProvider} which returns an impotent
 * Tracer for all calls to `getTracer`.
 *
 * All operations are no-op.
 */
export class NoopTracerProvider implements TracerProvider {
  getTracer(
    _name?: string,
    _version?: string,
    _options?: TracerOptions
  ): Tracer {
    return new NoopTracer();
  }

  shutdown(): Promise<void> {
    return Promise.resolve(undefined);
  }

  forceFlush(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
