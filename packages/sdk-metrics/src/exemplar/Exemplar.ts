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

import { HrTime, Attributes } from '@opentelemetry/api';

/**
 * A representation of an exemplar, which is a sample input measurement.
 * Exemplars also hold information about the environment when the measurement
 * was recorded, for example the span and trace ID of the active span when the
 * exemplar was recorded.
 */
export type Exemplar = {
  // The set of key/value pairs that were filtered out by the aggregator, but
  // recorded alongside the original measurement. Only key/value pairs that were
  // filtered out by the aggregator should be included
  filteredAttributes: Attributes;

  // The value of the measurement that was recorded.
  value: number;

  // timestamp is the exact time when this exemplar was recorded
  timestamp: HrTime;

  // (Optional) Span ID of the exemplar trace.
  // span_id may be missing if the measurement is not recorded inside a trace
  // or if the trace is not sampled.
  spanId?: string;

  // (Optional) Trace ID of the exemplar trace.
  // trace_id may be missing if the measurement is not recorded inside a trace
  // or if the trace is not sampled.
  traceId?: string;
};
