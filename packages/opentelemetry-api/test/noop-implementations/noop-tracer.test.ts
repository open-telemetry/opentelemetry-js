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

import * as assert from 'assert';
import { NoopTracer, NOOP_SPAN, SpanKind } from '../../src';
import { Context } from '@opentelemetry/scope-base';

describe('NoopTracer', () => {
  it('should not crash', () => {
    const spanContext = { traceId: '', spanId: '' };
    const tracer = new NoopTracer();

    assert.deepStrictEqual(tracer.startSpan('span-name'), NOOP_SPAN);
    assert.deepStrictEqual(
      tracer.startSpan('span-name1', { kind: SpanKind.CLIENT }),
      NOOP_SPAN
    );
    assert.deepStrictEqual(
      tracer.startSpan('span-name2', {
        kind: SpanKind.CLIENT,
        isRecording: true,
      }),
      NOOP_SPAN
    );

    assert.deepStrictEqual(tracer.getCurrentSpan(), NOOP_SPAN);
    const httpTextFormat = tracer.getHttpTextFormat();
    assert.ok(httpTextFormat);

    httpTextFormat.inject(Context.ROOT_CONTEXT, {});
    assert.deepStrictEqual(
      httpTextFormat.extract(Context.ROOT_CONTEXT, {}),
      Context.ROOT_CONTEXT
    );

    const binaryFormat = tracer.getBinaryFormat();
    assert.ok(binaryFormat);
    assert.ok(binaryFormat.toBytes(spanContext), typeof ArrayBuffer);
    assert.deepStrictEqual(binaryFormat.fromBytes(new ArrayBuffer(0)), null);
  });

  it('should not crash when .withSpan()', done => {
    const tracer = new NoopTracer();
    tracer.withSpan(NOOP_SPAN, () => {
      return done();
    });
  });

  it('should not crash when .bind()', done => {
    const tracer = new NoopTracer();
    const fn = () => {
      return done();
    };
    const patchedFn = tracer.bind(fn, NOOP_SPAN);
    return patchedFn();
  });
});
