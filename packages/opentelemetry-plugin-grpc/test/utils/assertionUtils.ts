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

import { SpanKind } from '@opentelemetry/api';
import * as assert from 'assert';
import { AttributeNames } from '../../src/enums/AttributeNames';
import { GrpcPlugin } from '../../src/grpc';
import * as grpc from 'grpc';
import { ReadableSpan } from '@opentelemetry/tracing';
import {
  hrTimeToMilliseconds,
  hrTimeToMicroseconds,
} from '@opentelemetry/core';

export const assertSpan = (
  span: ReadableSpan,
  kind: SpanKind,
  validations: { name: string; status: grpc.status }
) => {
  assert.strictEqual(span.spanContext.traceId.length, 32);
  assert.strictEqual(span.spanContext.spanId.length, 16);
  assert.strictEqual(span.kind, kind);

  assert.strictEqual(
    span.attributes[AttributeNames.COMPONENT],
    GrpcPlugin.component
  );
  assert.ok(span.endTime);
  assert.strictEqual(span.links.length, 0);
  assert.strictEqual(span.events.length, 1);

  assert.ok(
    hrTimeToMicroseconds(span.startTime) < hrTimeToMicroseconds(span.endTime)
  );
  assert.ok(hrTimeToMilliseconds(span.endTime) > 0);

  if (span.kind === SpanKind.SERVER) {
    assert.ok(span.spanContext);
  }

  // validations
  assert.strictEqual(span.name, validations.name);
  assert.strictEqual(span.status.code, validations.status);
};

// Check if sourceSpan was propagated to targetSpan
export const assertPropagation = (
  incomingSpan: ReadableSpan,
  outgoingSpan: ReadableSpan
) => {
  const targetSpanContext = incomingSpan.spanContext;
  const sourceSpanContext = outgoingSpan.spanContext;
  assert.strictEqual(targetSpanContext.traceId, sourceSpanContext.traceId);
  assert.strictEqual(incomingSpan.parentSpanId, sourceSpanContext.spanId);
  assert.strictEqual(
    targetSpanContext.traceFlags,
    sourceSpanContext.traceFlags
  );
  assert.notStrictEqual(targetSpanContext.spanId, sourceSpanContext.spanId);
};
