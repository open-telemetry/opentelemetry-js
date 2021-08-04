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

import { Context, createContextKey } from '@opentelemetry/api';

const SUPPRESS_TRACING_KEY = createContextKey(
  'OpenTelemetry SDK Context Key SUPPRESS_TRACING'
);

export function suppressTracing(context: Context): Context {
  return context.setValue(SUPPRESS_TRACING_KEY, true);
}

export function unsuppressTracing(context: Context): Context {
  return context.deleteValue(SUPPRESS_TRACING_KEY);
}

export function isTracingSuppressed(context: Context): boolean {
  return context.getValue(SUPPRESS_TRACING_KEY) === true;
}
