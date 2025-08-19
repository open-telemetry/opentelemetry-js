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

/** B3 single-header key */
export const B3_CONTEXT_HEADER = 'b3';

/* b3 multi-header keys */
export const X_B3_TRACE_ID = 'X-B3-TraceId';
export const X_B3_SPAN_ID = 'X-B3-SpanId';
export const X_B3_SAMPLED = 'X-B3-Sampled';
export const X_B3_PARENT_SPAN_ID = 'X-B3-ParentSpanId';
export const X_B3_FLAGS = 'X-B3-Flags';
