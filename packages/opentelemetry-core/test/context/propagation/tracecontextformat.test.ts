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
import {
  TraceContextFormat,
  HeaderGetter,
  HeaderSetter,
  TRACE_PARENT_HEADER,
  TRACE_STATE_HEADER,
  DEFAULT_OPTIONS,
} from '../../../src/context/propagation/TraceContextFormat';
import { SpanContext } from '@opentelemetry/types';

class DummyHeaders implements HeaderSetter, HeaderGetter {
  private _headers = new Map<string, string | string[]>();

  getHeader(header: string): string | string[] | undefined {
    return this._headers.get(header);
  }

  setHeader(header: string, value: string | string[]) {
    this._headers.set(header, value);
  }
}

describe('TraceContextFormat', () => {
  const traceContextFormat = new TraceContextFormat();
  let headers: DummyHeaders;

  beforeEach(() => {
    headers = new DummyHeaders();
  });

  describe('inject', () => {
    it('should set traceparent header', () => {
      const spanContext: SpanContext = {
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        spanId: '6e0c63257de34c92',
        traceOptions: 0x1,
      };

      traceContextFormat.inject(spanContext, 'TraceContextFormat', headers);
      assert.deepStrictEqual(
        headers.getHeader(TRACE_PARENT_HEADER),
        '00-d4cda95b652f4a1592b449d5929fda1b-6e0c63257de34c92-01'
      );
      assert.deepStrictEqual(headers.getHeader(TRACE_STATE_HEADER), undefined);
    });

    it('should set traceparent and tracestate header', () => {
      const spanContext: SpanContext = {
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        spanId: '6e0c63257de34c92',
        traceOptions: 0x1,
        traceState: 'foo=bar,baz=qux',
      };

      traceContextFormat.inject(spanContext, '', headers);
      assert.deepStrictEqual(
        headers.getHeader(TRACE_PARENT_HEADER),
        '00-d4cda95b652f4a1592b449d5929fda1b-6e0c63257de34c92-01'
      );
      assert.deepStrictEqual(headers.getHeader(TRACE_STATE_HEADER), undefined);
    });
  });

  describe('extract', () => {
    it('should extract context of a sampled span from headers', () => {
      headers.setHeader(
        TRACE_PARENT_HEADER,
        '00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01'
      );
      const extractedSpanContext = traceContextFormat.extract(
        'TraceContextFormat',
        headers
      );

      assert.deepStrictEqual(extractedSpanContext, {
        spanId: 'b7ad6b7169203331',
        traceId: '0af7651916cd43dd8448eb211c80319c',
        traceOptions: 1,
      });
    });

    it('returns null if traceparent header is missing', () => {
      assert.deepStrictEqual(
        traceContextFormat.extract('TraceContextFormat', headers),
        null
      );
    });

    it('returns null if traceparent header is invalid', () => {
      headers.setHeader(TRACE_PARENT_HEADER, 'invalid!');
      assert.deepStrictEqual(
        traceContextFormat.extract('TraceContextFormat', headers),
        null
      );
    });

    it('extracts tracestate from header', () => {
      headers.setHeader(
        TRACE_PARENT_HEADER,
        '00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01'
      );
      headers.setHeader(TRACE_STATE_HEADER, 'foo=bar,baz=qux');
      const extractedSpanContext = traceContextFormat.extract(
        'TraceContextFormat',
        headers
      );
      assert.deepStrictEqual(extractedSpanContext, {
        spanId: 'b7ad6b7169203331',
        traceId: '0af7651916cd43dd8448eb211c80319c',
        traceOptions: 1,
        traceState: 'foo=bar,baz=qux',
      });
    });

    it('combines multiple tracestate headers', () => {
      headers.setHeader(
        TRACE_PARENT_HEADER,
        '00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01'
      );
      headers.setHeader(TRACE_STATE_HEADER, ['foo=bar,baz=qux', 'quux=quuz']);
      const extractedSpanContext = traceContextFormat.extract(
        'TraceContextFormat',
        headers
      );
      assert.deepStrictEqual(extractedSpanContext, {
        spanId: 'b7ad6b7169203331',
        traceId: '0af7651916cd43dd8448eb211c80319c',
        traceOptions: 1,
        traceState: 'foo=bar,baz=qux,quux=quuz',
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
        headers.setHeader(TRACE_PARENT_HEADER, testCases[testCase]);

        const extractedSpanContext = traceContextFormat.extract(
          'TraceContextFormat',
          headers
        );
        assert.deepStrictEqual(extractedSpanContext, null, testCase);
      });
    });

    it('should reset options if they are invalid', () => {
      const testCases: Record<string, string> = {
        invalidOptions_empty:
          '00-ffffffffffffffffffffffffffffffff-ffffffffffffffff-',
        invalidOptions_notHex:
          '00-ffffffffffffffffffffffffffffffff-ffffffffffffffff-0x',
        invalidOptions_tooShort:
          '00-ffffffffffffffffffffffffffffffff-ffffffffffffffff-0',
        invalidOptions_tooLong:
          '00-ffffffffffffffffffffffffffffffff-ffffffffffffffff-0f0',
      };

      Object.getOwnPropertyNames(testCases).forEach(testCase => {
        headers.setHeader(TRACE_PARENT_HEADER, testCases[testCase]);

        const extractedSpanContext = traceContextFormat.extract(
          'TraceContextFormat',
          headers
        );
        if (extractedSpanContext !== null) {
          assert.strictEqual(
            extractedSpanContext.traceOptions,
            DEFAULT_OPTIONS,
            testCase
          );
        }
      });
    });
  });
});
