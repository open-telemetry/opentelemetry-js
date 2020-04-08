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

import { ContextManager } from '@opentelemetry/context-base';
import { HttpTextPropagator } from '../context/propagation/HttpTextPropagator';
import { MeterProvider } from '../metrics/MeterProvider';
import { TracerProvider } from '../trace/tracer_provider';

export const GLOBAL_CONTEXT_MANAGER_API_KEY = Symbol.for(
  'io.opentelemetry.js.api.context'
);
export const GLOBAL_METRICS_API_KEY = Symbol.for(
  'io.opentelemetry.js.api.metrics'
);
export const GLOBAL_PROPAGATION_API_KEY = Symbol.for(
  'io.opentelemetry.js.api.propagation'
);
export const GLOBAL_TRACE_API_KEY = Symbol.for('io.opentelemetry.js.api.trace');

type Get<T> = (version: number) => T;
type MyGlobals = Partial<{
  [GLOBAL_CONTEXT_MANAGER_API_KEY]: Get<ContextManager>;
  [GLOBAL_METRICS_API_KEY]: Get<MeterProvider>;
  [GLOBAL_PROPAGATION_API_KEY]: Get<HttpTextPropagator>;
  [GLOBAL_TRACE_API_KEY]: Get<TracerProvider>;
}>;

export const _global = global as typeof global & MyGlobals;

export function makeGetter<T>(
  requiredVersion: number,
  instance: T,
  fallback: T
): Get<T> {
  return (version: number): T =>
    version === requiredVersion ? instance : fallback;
}
