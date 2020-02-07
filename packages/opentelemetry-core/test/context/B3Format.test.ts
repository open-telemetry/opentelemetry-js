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

import { SpanContext, TraceFlags } from '@opentelemetry/api';
import * as assert from 'assert';
import {
  setExtractedSpanContext,
  getExtractedSpanContext,
} from '../../src/context/context';
import { Context } from '@opentelemetry/scope-base';
import {
  B3Format,
  X_B3_SAMPLED,
  X_B3_SPAN_ID,
  X_B3_TRACE_ID,
} from '../../src/context/propagation/B3Format';
import { TraceState } from '../../src/trace/TraceState';

describe('B3Format', () => {
  const b3Format = new B3Format();
  let carrier: { [key: string]: unknown };

  beforeEach(() => {
    carrier = {};
  });

  describe('.inject()', () => {
    it('should set b3 traceId and spanId headers', () => {
      const spanContext: SpanContext = {
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        spanId: '6e0c63257de34c92',
        traceFlags: TraceFlags.SAMPLED,
      };

      b3Format.inject(
        setExtractedSpanContext(Context.ROOT_CONTEXT, spanContext),
        carrier
      );
      assert.deepStrictEqual(
        carrier[X_B3_TRACE_ID],
        'd4cda95b652f4a1592b449d5929fda1b'
      );
      assert.deepStrictEqual(carrier[X_B3_SPAN_ID], '6e0c63257de34c92');
      assert.deepStrictEqual(carrier[X_B3_SAMPLED], TraceFlags.SAMPLED);
    });

    it('should set b3 traceId and spanId headers - ignore tracestate', () => {
      const spanContext: SpanContext = {
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        spanId: '6e0c63257de34c92',
        traceFlags: TraceFlags.UNSAMPLED,
        traceState: new TraceState('foo=bar,baz=qux'),
        isRemote: false,
      };

      b3Format.inject(
        setExtractedSpanContext(Context.ROOT_CONTEXT, spanContext),
        carrier
      );
      assert.deepStrictEqual(
        carrier[X_B3_TRACE_ID],
        'd4cda95b652f4a1592b449d5929fda1b'
      );
      assert.deepStrictEqual(carrier[X_B3_SPAN_ID], '6e0c63257de34c92');
      assert.deepStrictEqual(carrier[X_B3_SAMPLED], TraceFlags.UNSAMPLED);
    });

    it('should not inject empty spancontext', () => {
      const emptySpanContext = {
        traceId: '',
        spanId: '',
      };
      b3Format.inject(
        setExtractedSpanContext(Context.ROOT_CONTEXT, emptySpanContext),
        carrier
      );
      assert.deepStrictEqual(carrier[X_B3_TRACE_ID], undefined);
      assert.deepStrictEqual(carrier[X_B3_SPAN_ID], undefined);
    });

    it('should handle absence of sampling decision', () => {
      const spanContext: SpanContext = {
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        spanId: '6e0c63257de34c92',
      };

      b3Format.inject(
        setExtractedSpanContext(Context.ROOT_CONTEXT, spanContext),
        carrier
      );
      assert.deepStrictEqual(
        carrier[X_B3_TRACE_ID],
        'd4cda95b652f4a1592b449d5929fda1b'
      );
      assert.deepStrictEqual(carrier[X_B3_SPAN_ID], '6e0c63257de34c92');
      assert.deepStrictEqual(carrier[X_B3_SAMPLED], undefined);
    });
  });

  describe('.extract()', () => {
    it('should extract context of a unsampled span from carrier', () => {
      carrier[X_B3_TRACE_ID] = '0af7651916cd43dd8448eb211c80319c';
      carrier[X_B3_SPAN_ID] = 'b7ad6b7169203331';
      const extractedSpanContext = getExtractedSpanContext(
        b3Format.extract(Context.ROOT_CONTEXT, carrier)
      );

      assert.deepStrictEqual(extractedSpanContext, {
        spanId: 'b7ad6b7169203331',
        traceId: '0af7651916cd43dd8448eb211c80319c',
        isRemote: true,
        traceFlags: TraceFlags.UNSAMPLED,
      });
    });

    it('should extract context of a sampled span from carrier', () => {
      carrier[X_B3_TRACE_ID] = '0af7651916cd43dd8448eb211c80319c';
      carrier[X_B3_SPAN_ID] = 'b7ad6b7169203331';
      carrier[X_B3_SAMPLED] = '1';
      const extractedSpanContext = getExtractedSpanContext(
        b3Format.extract(Context.ROOT_CONTEXT, carrier)
      );

      assert.deepStrictEqual(extractedSpanContext, {
        spanId: 'b7ad6b7169203331',
        traceId: '0af7651916cd43dd8448eb211c80319c',
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('should extract context of a sampled span from carrier when sampled is mentioned as boolean true flag', () => {
      carrier[X_B3_TRACE_ID] = '0af7651916cd43dd8448eb211c80319c';
      carrier[X_B3_SPAN_ID] = 'b7ad6b7169203331';
      carrier[X_B3_SAMPLED] = true;
      const extractedSpanContext = getExtractedSpanContext(
        b3Format.extract(Context.ROOT_CONTEXT, carrier)
      );

      assert.deepStrictEqual(extractedSpanContext, {
        spanId: 'b7ad6b7169203331',
        traceId: '0af7651916cd43dd8448eb211c80319c',
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('should extract context of a sampled span from carrier when sampled is mentioned as boolean false flag', () => {
      carrier[X_B3_TRACE_ID] = '0af7651916cd43dd8448eb211c80319c';
      carrier[X_B3_SPAN_ID] = 'b7ad6b7169203331';
      carrier[X_B3_SAMPLED] = false;
      const extractedSpanContext = getExtractedSpanContext(
        b3Format.extract(Context.ROOT_CONTEXT, carrier)
      );

      assert.deepStrictEqual(extractedSpanContext, {
        spanId: 'b7ad6b7169203331',
        traceId: '0af7651916cd43dd8448eb211c80319c',
        isRemote: true,
        traceFlags: TraceFlags.UNSAMPLED,
      });
    });

    it('should return undefined when traceId is undefined', () => {
      carrier[X_B3_TRACE_ID] = undefined;
      carrier[X_B3_SPAN_ID] = undefined;
      assert.deepStrictEqual(
        getExtractedSpanContext(
          b3Format.extract(Context.ROOT_CONTEXT, carrier)
        ),
        undefined
      );
    });

    it('should return undefined when options and spanId are undefined', () => {
      carrier[X_B3_TRACE_ID] = '0af7651916cd43dd8448eb211c80319c';
      carrier[X_B3_SPAN_ID] = undefined;
      assert.deepStrictEqual(
        getExtractedSpanContext(
          b3Format.extract(Context.ROOT_CONTEXT, carrier)
        ),
        undefined
      );
    });

    it('returns undefined if b3 header is missing', () => {
      assert.deepStrictEqual(
        getExtractedSpanContext(
          b3Format.extract(Context.ROOT_CONTEXT, carrier)
        ),
        undefined
      );
    });

    it('returns undefined if b3 header is invalid', () => {
      carrier[X_B3_TRACE_ID] = 'invalid!';
      assert.deepStrictEqual(
        getExtractedSpanContext(
          b3Format.extract(Context.ROOT_CONTEXT, carrier)
        ),
        undefined
      );
    });

    it('extracts b3 from list of header', () => {
      carrier[X_B3_TRACE_ID] = ['0af7651916cd43dd8448eb211c80319c'];
      carrier[X_B3_SPAN_ID] = 'b7ad6b7169203331';
      carrier[X_B3_SAMPLED] = '01';
      const extractedSpanContext = getExtractedSpanContext(
        b3Format.extract(Context.ROOT_CONTEXT, carrier)
      );
      assert.deepStrictEqual(extractedSpanContext, {
        spanId: 'b7ad6b7169203331',
        traceId: '0af7651916cd43dd8448eb211c80319c',
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('should gracefully handle an invalid b3 header', () => {
      // A set of test cases with different invalid combinations of a
      // b3 header. These should all result in a `undefined` SpanContext
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
        carrier[X_B3_TRACE_ID] = testCases[testCase];

        const extractedSpanContext = getExtractedSpanContext(
          b3Format.extract(Context.ROOT_CONTEXT, carrier)
        );
        assert.deepStrictEqual(extractedSpanContext, undefined, testCase);
      });
    });
  });
});
