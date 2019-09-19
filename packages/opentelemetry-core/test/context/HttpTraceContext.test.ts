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
import {
  HttpTraceContext,
  TRACE_PARENT_HEADER,
  TRACE_STATE_HEADER,
} from '../../src/context/propagation/HttpTraceContext';
import { SpanContext, TraceFlags } from '@opentelemetry/types';
import { TraceState } from '../../src/trace/TraceState';

describe('HttpTraceContext', () => {
  const httpTraceContext = new HttpTraceContext();
  let carrier: { [key: string]: unknown };

  beforeEach(() => {
    carrier = {};
  });

  describe('.inject()', () => {
    it('should set traceparent header', () => {
      const spanContext: SpanContext = {
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        spanId: '6e0c63257de34c92',
        traceFlags: TraceFlags.SAMPLED,
      };

      httpTraceContext.inject(spanContext, 'HttpTraceContext', carrier);
      assert.deepStrictEqual(
        carrier[TRACE_PARENT_HEADER],
        '00-d4cda95b652f4a1592b449d5929fda1b-6e0c63257de34c92-01'
      );
      assert.deepStrictEqual(carrier[TRACE_STATE_HEADER], undefined);
    });

    it('should set traceparent and tracestate header', () => {
      const spanContext: SpanContext = {
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        spanId: '6e0c63257de34c92',
        traceFlags: TraceFlags.SAMPLED,
        traceState: new TraceState('foo=bar,baz=qux'),
      };

      httpTraceContext.inject(spanContext, '', carrier);
      assert.deepStrictEqual(
        carrier[TRACE_PARENT_HEADER],
        '00-d4cda95b652f4a1592b449d5929fda1b-6e0c63257de34c92-01'
      );
      assert.deepStrictEqual(carrier[TRACE_STATE_HEADER], 'foo=bar,baz=qux');
    });
  });

  describe('.extract()', () => {
    it('should extract context of a sampled span from carrier', () => {
      carrier[TRACE_PARENT_HEADER] =
        '00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01';
      const extractedSpanContext = httpTraceContext.extract(
        'HttpTraceContext',
        carrier
      );

      assert.deepStrictEqual(extractedSpanContext, {
        spanId: 'b7ad6b7169203331',
        traceId: '0af7651916cd43dd8448eb211c80319c',
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('returns null if traceparent header is missing', () => {
      assert.deepStrictEqual(
        httpTraceContext.extract('HttpTraceContext', carrier),
        null
      );
    });

    it('returns null if traceparent header is invalid', () => {
      carrier[TRACE_PARENT_HEADER] = 'invalid!';
      assert.deepStrictEqual(
        httpTraceContext.extract('HttpTraceContext', carrier),
        null
      );
    });

    it('extracts traceparent from list of header', () => {
      carrier[TRACE_PARENT_HEADER] = [
        '00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01',
      ];
      const extractedSpanContext = httpTraceContext.extract(
        'HttpTraceContext',
        carrier
      );
      assert.deepStrictEqual(extractedSpanContext, {
        spanId: 'b7ad6b7169203331',
        traceId: '0af7651916cd43dd8448eb211c80319c',
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('extracts tracestate from header', () => {
      carrier[TRACE_PARENT_HEADER] =
        '00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01';
      carrier[TRACE_STATE_HEADER] = 'foo=bar,baz=qux';
      const extractedSpanContext = httpTraceContext.extract(
        'HttpTraceContext',
        carrier
      );
      assert.deepStrictEqual(
        extractedSpanContext!.traceState!.get('foo'),
        'bar'
      );
      assert.deepStrictEqual(
        extractedSpanContext!.traceState!.get('baz'),
        'qux'
      );
    });

    it('combines multiple tracestate carrier', () => {
      carrier[TRACE_PARENT_HEADER] =
        '00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01';
      carrier[TRACE_STATE_HEADER] = ['foo=bar,baz=qux', 'quux=quuz'];
      const extractedSpanContext = httpTraceContext.extract(
        'HttpTraceContext',
        carrier
      );
      assert.deepStrictEqual(extractedSpanContext, {
        spanId: 'b7ad6b7169203331',
        traceId: '0af7651916cd43dd8448eb211c80319c',
        traceFlags: TraceFlags.SAMPLED,
        traceState: new TraceState('foo=bar,baz=qux,quux=quuz'),
      });
    });

    it('should gracefully handle an invalid traceparent header', () => {
      // A set of test cases with different invalid combinations of a
      // traceparent header. These should all result in a `null` SpanContext
      // value being extracted.

      const testCases: Record<string, string> = {
        invalidParts_tooShort: '00-ffffffffffffffffffffffffffffffff',
        invalidParts_tooLong:
          '00-ffffffffffffffffffffffffffffffff-ffffffffffffffff-00-01',

        invalidVersion_notHex:
          '0x-ffffffffffffffffffffffffffffffff-ffffffffffffffff-00',
        invalidVersion_tooShort:
          '0-ffffffffffffffffffffffffffffffff-ffffffffffffffff-00',
        invalidVersion_tooLong:
          '000-ffffffffffffffffffffffffffffffff-ffffffffffffffff-00',

        invalidTraceId_empty: '00--ffffffffffffffff-01',
        invalidTraceId_notHex:
          '00-fffffffffffffffffffffffffffffffx-ffffffffffffffff-01',
        invalidTraceId_allZeros:
          '00-00000000000000000000000000000000-ffffffffffffffff-01',
        invalidTraceId_tooShort: '00-ffffffff-ffffffffffffffff-01',
        invalidTraceId_tooLong:
          '00-ffffffffffffffffffffffffffffffff00-ffffffffffffffff-01',

        invalidSpanId_empty: '00-ffffffffffffffffffffffffffffffff--01',
        invalidSpanId_notHex:
          '00-ffffffffffffffffffffffffffffffff-fffffffffffffffx-01',
        invalidSpanId_allZeros:
          '00-ffffffffffffffffffffffffffffffff-0000000000000000-01',
        invalidSpanId_tooShort:
          '00-ffffffffffffffffffffffffffffffff-ffffffff-01',
        invalidSpanId_tooLong:
          '00-ffffffffffffffffffffffffffffffff-ffffffffffffffff0000-01',
      };

      Object.getOwnPropertyNames(testCases).forEach(testCase => {
        carrier[TRACE_PARENT_HEADER] = testCases[testCase];

        const extractedSpanContext = httpTraceContext.extract(
          'HttpTraceContext',
          carrier
        );
        assert.deepStrictEqual(extractedSpanContext, null, testCase);
      });
    });
  });
});
