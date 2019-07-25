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

import * as assert from 'assert';
import * as types from '@opentelemetry/types';
import { GlobalTracerDelegate } from '../../src/trace/GlobalTracerDelegate';
import { NoopTracer, NoopSpan } from '../../src';
import { TraceOptions } from '@opentelemetry/types';

describe('GlobalTracerDelegate', () => {
  const functions = [
    'getCurrentSpan',
    'startSpan',
    'withSpan',
    'recordSpanData',
    'getBinaryFormat',
    'getHttpTextFormat',
  ];
  const spanContext = {
    traceId: 'd4cda95b652f4a1592b449d5929fda1b',
    spanId: '6e0c63257de34c92',
    traceOptions: TraceOptions.UNSAMPLED,
  };

  describe('#constructor(...)', () => {
    it('should not crash with default constructor', () => {
      functions.forEach(fn => {
        const tracer = new GlobalTracerDelegate();
        try {
          ((tracer as unknown) as { [fn: string]: Function })[fn](); // Try to run the function
          assert.ok(true, fn);
        } catch (err) {
          if (err.message !== 'Method not implemented.') {
            assert.ok(false, fn);
          }
        }
      });
    });

    it('should allow fallback tracer to be set', () => {
      const dummyTracer = new DummyTracer();
      const tracerDelegate = new GlobalTracerDelegate(null, dummyTracer);

      tracerDelegate.startSpan('foo');
      assert.deepStrictEqual(dummyTracer.spyCounter, 1);
    });

    it('should use user provided tracer if provided', () => {
      const dummyTracer = new DummyTracer();
      const tracerDelegate = new GlobalTracerDelegate(
        dummyTracer,
        new NoopTracer()
      );

      tracerDelegate.startSpan('foo');
      assert.deepStrictEqual(dummyTracer.spyCounter, 1);
    });

    class DummyTracer extends NoopTracer {
      spyCounter = 0;

      startSpan(name: string, options?: types.SpanOptions | undefined) {
        this.spyCounter = this.spyCounter + 1;
        return new NoopSpan(spanContext);
      }
    }
  });
});
