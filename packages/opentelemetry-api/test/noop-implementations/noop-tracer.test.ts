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
import { NoopTracer, NOOP_SPAN, SpanKind } from '../../src';

describe('NoopTracer', () => {
  it('should not crash', () => {
    const tracer = new NoopTracer();

    assert.deepStrictEqual(tracer.startSpan('span-name'), NOOP_SPAN);
    assert.deepStrictEqual(
      tracer.startSpan('span-name1', { kind: SpanKind.CLIENT }),
      NOOP_SPAN
    );
    assert.deepStrictEqual(
      tracer.startSpan('span-name2', {
        kind: SpanKind.CLIENT,
      }),
      NOOP_SPAN
    );

    assert.deepStrictEqual(tracer.getCurrentSpan(), NOOP_SPAN);
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
