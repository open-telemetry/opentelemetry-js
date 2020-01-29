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

import { NOOP_TRACER } from './NoopTracer';
import { Tracer } from './tracer';
import { TracerRegistry } from './tracer_registry';

/**
 * An implementation of the {@link TracerRegistry} which returns an impotent Tracer
 * for all calls to `getTracer`
 */
export class NoopTracerRegistry implements TracerRegistry {
  getTracer(_name?: string, _version?: string): Tracer {
    return NOOP_TRACER;
  }
}

export const NOOP_TRACER_REGISTRY = new NoopTracerRegistry();
