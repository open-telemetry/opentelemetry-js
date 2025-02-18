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
import { setupNodeContextManager, withTestTracer } from './util';

/**
 * Tests the "OpenTelemetry sandwich" problem described in the spec at
 * https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/compatibility/opencensus.md#trace-bridge
 */
describe('OpenTelemetry sandwich', () => {
  setupNodeContextManager(before, after);

  it('should maintain parent-child relationship for OTel -> OC', async () => {
    const spans = await withTestTracer((shimTracer, otelTracer) => {
      otelTracer.startActiveSpan('parent-otel', parentSpan => {
        shimTracer.startChildSpan({ name: 'child-oc' }).end();
        parentSpan.end();
      });
    });

    assert.strictEqual(spans.length, 2);
    const [childSpan, parentSpan] = spans;
    assert.strictEqual(
      childSpan.spanContext().traceId,
      parentSpan.spanContext().traceId
    );
    assert.strictEqual(
      childSpan.parentSpanContext?.spanId,
      parentSpan.spanContext().spanId
    );
  });

  it('should maintain parent-child relationship for OC -> OTel', async () => {
    const spans = await withTestTracer((shimTracer, otelTracer) => {
      shimTracer.startRootSpan({ name: 'parent-oc' }, parentSpan => {
        otelTracer.startSpan('child-otel').end();
        parentSpan.end();
      });
    });

    assert.strictEqual(spans.length, 2);
    const [childSpan, parentSpan] = spans;
    assert.strictEqual(
      childSpan.spanContext().traceId,
      parentSpan.spanContext().traceId
    );
    assert.strictEqual(
      childSpan.parentSpanContext?.spanId,
      parentSpan.spanContext().spanId
    );
  });

  it('should maintain structure for OTel -> OC -> OTel', async () => {
    const spans = await withTestTracer((shimTracer, otelTracer) => {
      otelTracer.startActiveSpan('parent-otel', parentSpan => {
        shimTracer.startRootSpan({ name: 'middle-oc' }, middleSpan => {
          otelTracer.startSpan('child-otel').end();
          middleSpan.end();
        });
        parentSpan.end();
      });
    });

    assert.strictEqual(spans.length, 3);
    const [childSpan, middleSpan, parentSpan] = spans;
    assert.strictEqual(
      childSpan.spanContext().traceId,
      parentSpan.spanContext().traceId
    );
    assert.strictEqual(
      middleSpan.spanContext().traceId,
      parentSpan.spanContext().traceId
    );
    assert.strictEqual(
      middleSpan.parentSpanContext?.spanId,
      parentSpan.spanContext().spanId
    );
    assert.strictEqual(
      childSpan.parentSpanContext?.spanId,
      middleSpan.spanContext().spanId
    );
  });
});
