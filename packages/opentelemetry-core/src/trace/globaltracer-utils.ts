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

import * as types from '@opentelemetry/types';
import { NoopTracerProvider } from './NoopTracerProvider';

let globalTracerProvider: types.TracerProvider = new NoopTracerProvider();

/**
 * Set the current global tracer. Returns the initialized global tracer
 */
export function initGlobalTracerProvider(
  tracerProvider: types.TracerProvider
): types.TracerProvider {
  return (globalTracerProvider = tracerProvider);
}

/**
 * Returns the global tracer provider.
 */
export function getTracerProvider(): types.TracerProvider {
  // Return the global tracer provider
  return globalTracerProvider;
}

/**
 * Returns a tracer from the global tracer provider.
 */
export function getTracer(name: string, version?: string): types.Tracer {
  // Return the global tracer provider
  return globalTracerProvider.getTracer(name, version);
}
