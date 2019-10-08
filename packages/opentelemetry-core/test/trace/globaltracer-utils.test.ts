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
import * as types from '@opentelemetry/types';
import {
  getTracer,
  getTracerFactory,
  initGlobalTracerFactory,
} from '../../src/trace/globaltracer-utils';
import { NoopTracer, NoopTracerFactory, NoopSpan } from '../../src';
import { TraceFlags } from '@opentelemetry/types';

describe('globaltracer-utils', () => {
  const functions = ['getTracer'];

  it('should expose a tracer via getTracer', () => {
    const tracer = getTracer();
    assert.ok(tracer);
    assert.strictEqual(typeof tracer, 'object');
  });

  describe('GlobalTracer', () => {
    const spanContext = {
      traceId: 'd4cda95b652f4a1592b449d5929fda1b',
      spanId: '6e0c63257de34c92',
      traceFlags: TraceFlags.UNSAMPLED,
    };
    const dummySpan = new NoopSpan(spanContext);

    afterEach(() => {
      initGlobalTracerFactory(new NoopTracerFactory());
    });

    it('getTracer should not crash', () => {
      functions.forEach(fn => {
        const tracer = getTracerFactory();
        try {
          ((tracer as unknown) as { [fn: string]: Function })[fn](); // Try to run the function
          assert.ok(true, fn);
        } catch (err) {
          if (err.message !== 'Method not implemented.') {
            assert.ok(true, fn);
          }
        }
      });
    });

    it('should use the global tracer', () => {
      const tracerFactory = initGlobalTracerFactory(new TestTracerFactory());
      const span = tracerFactory.getTracer('fake').startSpan('test');
      assert.deepStrictEqual(span, dummySpan);
    });

    class TestTracerFactory extends NoopTracerFactory {
      private readonly _testTracer: types.Tracer = new TestTracer();

      getTracer(name?: string, version?: string) {
        return this._testTracer;
      }
    }

    class TestTracer extends NoopTracer {
      startSpan(
        name: string,
        options?: types.SpanOptions | undefined
      ): types.Span {
        return dummySpan;
      }
    }
  });
});
