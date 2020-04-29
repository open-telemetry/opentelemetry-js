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

/**
 * Make a function which accepts a version integer and returns the instance of an API if the version
 * is compatible, or a fallback version (usually NOOP) if it is not.
 *
 * @param requiredVersion Backwards compatibility version which is required to return the instance
 * @param instance Instance which should be returned if the required version is compatible
 * @param fallback Fallback instance, usually NOOP, which will be returned if the required version is not compatible
 */
export function makeGetter<T>(
  requiredVersion: number,
  instance: T,
  fallback: T
): Get<T> {
  return (version: number): T =>
    version === requiredVersion ? instance : fallback;
}

/**
 * A number which should be incremented each time a backwards incompatible
 * change is made to the API. This number is used when an API package
 * attempts to access the global API to ensure it is getting a compatible
 * version. If the global API is not compatible with the API package
 * attempting to get it, a NOOP API implementation will be returned.
 */
export const API_BACKWARDS_COMPATIBILITY_VERSION = 0;
