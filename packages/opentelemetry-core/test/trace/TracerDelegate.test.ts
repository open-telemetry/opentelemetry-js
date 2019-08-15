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
import { TracerDelegate } from '../../src/trace/TracerDelegate';
import { NoopTracer, NoopSpan } from '../../src';
import { TraceOptions } from '@opentelemetry/types';

describe('TracerDelegate', () => {
  const functions = [
    'getCurrentSpan',
    'startSpan',
    'withSpan',
    'bind',
    'recordSpanData',
    'getBinaryFormat',
    'getHttpTextFormat',
  ];
  const spanContext = {
    traceId: 'd4cda95b652f4a1592b449d5929fda1b',
    spanId: '6e0c63257de34c92',
    traceOptions: TraceOptions.UNSAMPLED,
  };

  describe('constructor', () => {
    it('should not crash with default constructor', () => {
      functions.forEach(fn => {
        const tracer = new TracerDelegate();
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

    it('should allow fallback tracer to be set', () => {
      const dummyTracer = new DummyTracer();
      const tracerDelegate = new TracerDelegate(dummyTracer);

      tracerDelegate.startSpan('foo');
      assert.deepStrictEqual(dummyTracer.spyCounter, 1);
    });

    it('should use user provided tracer if provided', () => {
      const dummyTracer = new DummyTracer();
      const tracerDelegate = new TracerDelegate(dummyTracer);

      tracerDelegate.startSpan('foo');
      assert.deepStrictEqual(dummyTracer.spyCounter, 1);
    });
  });

  describe('.start/.stop()', () => {
    it('should use the fallback tracer when stop is called', () => {
      const dummyTracerUser = new DummyTracer();
      const dummyTracerFallback = new DummyTracer();
      const tracerDelegate = new TracerDelegate(
        dummyTracerUser,
        dummyTracerFallback
      );

      tracerDelegate.stop();
      tracerDelegate.startSpan('fallback');
      assert.deepStrictEqual(dummyTracerUser.spyCounter, 0);
      assert.deepStrictEqual(dummyTracerFallback.spyCounter, 1);
    });

    it('should use the user tracer when start is called', () => {
      const dummyTracerUser = new DummyTracer();
      const dummyTracerFallback = new DummyTracer();
      const tracerDelegate = new TracerDelegate(
        dummyTracerUser,
        dummyTracerFallback
      );

      tracerDelegate.stop();
      tracerDelegate.startSpan('fallback');
      assert.deepStrictEqual(dummyTracerUser.spyCounter, 0);
      assert.deepStrictEqual(dummyTracerFallback.spyCounter, 1);

      tracerDelegate.start();
      tracerDelegate.startSpan('user');
      assert.deepStrictEqual(dummyTracerUser.spyCounter, 1);
      assert.deepStrictEqual(
        dummyTracerFallback.spyCounter,
        1,
        'Only user tracer counter is incremented'
      );
    });
  });

  class DummyTracer extends NoopTracer {
    spyCounter = 0;

    startSpan(name: string, options?: types.SpanOptions | undefined) {
      this.spyCounter = this.spyCounter + 1;
      return new NoopSpan(spanContext);
    }
  }
});
