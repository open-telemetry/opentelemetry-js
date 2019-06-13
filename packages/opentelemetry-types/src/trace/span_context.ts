/**
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

/**
 * A SpanContext represents the portion of a Span which must be serialized and
 * propagated along side of a distributed context.
 */
export interface SpanContext {
  /** The ID of the trace that this span belongs to. */
  traceId: string;
  /** The ID of the Span. */
  spanId: string;
  /** Trace options to propagate. */
  traceOptions?: number;
  /** Tracing-system-specific info to propagate. */
  traceState?: string;
}
