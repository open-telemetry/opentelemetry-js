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

import * as assert from 'assert';
import {
  NoopTracer,
  SpanContext,
  SpanKind,
  TraceFlags,
  context,
  trace,
} from '../../src';
import { NonRecordingSpan } from '../../src/trace/NonRecordingSpan';

describe('NoopTracer', () => {
  it('should not crash', () => {
    const tracer = new NoopTracer();

    assert.ok(tracer.startSpan('span-name') instanceof NonRecordingSpan);
    assert.ok(
      tracer.startSpan('span-name1', { kind: SpanKind.CLIENT }) instanceof
        NonRecordingSpan
    );
    assert.ok(
      tracer.startSpan('span-name2', { kind: SpanKind.CLIENT }) instanceof
        NonRecordingSpan
    );
  });

  it('should propagate valid spanContext on the span (from context)', () => {
    const tracer = new NoopTracer();
    const parent: SpanContext = {
      traceId: 'd4cda95b652f4a1592b449dd92ffda3b',
      spanId: '6e0c63ffe4e34c42',
      traceFlags: TraceFlags.NONE,
    };
    const span = tracer.startSpan(
      'test-1',
      {},
      trace.setSpanContext(context.active(), parent)
    );
    assert(span.spanContext().traceId === parent.traceId);
    assert(span.spanContext().spanId === parent.spanId);
    assert(span.spanContext().traceFlags === parent.traceFlags);
  });
});
