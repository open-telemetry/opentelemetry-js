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

import {
  SpanKind,
  Attributes,
  Event,
  Span,
  Status,
} from '@opentelemetry/types';
import * as assert from 'assert';
import { ReadableSpan } from '@opentelemetry/tracing';
import {
  hrTimeToMilliseconds,
  hrTimeToMicroseconds,
} from '@opentelemetry/core';

export const assertSpan = (
  span: ReadableSpan,
  kind: SpanKind,
  attributes: Attributes,
  events: Event[],
  status: Status
) => {
  assert.strictEqual(span.spanContext.traceId.length, 32);
  assert.strictEqual(span.spanContext.spanId.length, 16);
  assert.strictEqual(span.kind, kind);

  assert.ok(span.endTime);
  assert.strictEqual(span.links.length, 0);

  assert.ok(
    hrTimeToMicroseconds(span.startTime) < hrTimeToMicroseconds(span.endTime)
  );
  assert.ok(hrTimeToMilliseconds(span.endTime) > 0);

  // attributes
  assert.deepStrictEqual(span.attributes, attributes);

  // events
  assert.deepStrictEqual(span.events, events);

  assert.strictEqual(span.status.code, status.code);
  if (status.message) {
    assert.strictEqual(span.status.message, status.message);
  }
};

// Check if childSpan was propagated from parentSpan
export const assertPropagation = (
  childSpan: ReadableSpan,
  parentSpan: Span
) => {
  const targetSpanContext = childSpan.spanContext;
  const sourceSpanContext = parentSpan.context();
  assert.strictEqual(targetSpanContext.traceId, sourceSpanContext.traceId);
  assert.strictEqual(childSpan.parentSpanId, sourceSpanContext.spanId);
  assert.strictEqual(
    targetSpanContext.traceFlags,
    sourceSpanContext.traceFlags
  );
  assert.notStrictEqual(targetSpanContext.spanId, sourceSpanContext.spanId);
};
