/*!
 * Copyright 2020, OpenTelemetry Authors
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
  JaegerHttpTraceFormat,
  UBER_TRACE_ID_HEADER,
} from '../src/JaegerHttpTraceFormat';
import { SpanContext, TraceFlags } from '@opentelemetry/api';

describe('JaegerHttpTraceFormat', () => {
  const jaegerHttpTraceFormat = new JaegerHttpTraceFormat();
  const customHeader = 'new-header';
  const customJaegerHttpTraceFormat = new JaegerHttpTraceFormat(customHeader);
  let carrier: { [key: string]: unknown };

  beforeEach(() => {
    carrier = {};
  });

  describe('.inject()', () => {
    it('should set uber trace id header', () => {
      const spanContext: SpanContext = {
        traceId: new Uint8Array([
          0xd4,
          0xcd,
          0xa9,
          0x5b,
          0x65,
          0x2f,
          0x4a,
          0x15,
          0x92,
          0xb4,
          0x49,
          0xd5,
          0x92,
          0x9f,
          0xda,
          0x1b,
        ]),
        spanId: new Uint8Array([
          0x6e,
          0x0c,
          0x63,
          0x25,
          0x7d,
          0xe3,
          0x4c,
          0x92,
        ]),
        traceFlags: TraceFlags.SAMPLED,
      };

      jaegerHttpTraceFormat.inject(spanContext, '', carrier);
      assert.deepStrictEqual(
        carrier[UBER_TRACE_ID_HEADER],
        'd4cda95b652f4a1592b449d5929fda1b:6e0c63257de34c92:0:01'
      );
    });

    it('should use custom header if provided', () => {
      const spanContext: SpanContext = {
        traceId: new Uint8Array([
          0xd4,
          0xcd,
          0xa9,
          0x5b,
          0x65,
          0x2f,
          0x4a,
          0x15,
          0x92,
          0xb4,
          0x49,
          0xd5,
          0x92,
          0x9f,
          0xda,
          0x1b,
        ]),
        spanId: new Uint8Array([
          0x6e,
          0x0c,
          0x63,
          0x25,
          0x7d,
          0xe3,
          0x4c,
          0x92,
        ]),
        traceFlags: TraceFlags.SAMPLED,
      };

      customJaegerHttpTraceFormat.inject(spanContext, '', carrier);
      assert.deepStrictEqual(
        carrier[customHeader],
        'd4cda95b652f4a1592b449d5929fda1b:6e0c63257de34c92:0:01'
      );
    });
  });

  describe('.extract()', () => {
    it('should extract context of a sampled span from carrier', () => {
      carrier[UBER_TRACE_ID_HEADER] =
        'd4cda95b652f4a1592b449d5929fda1b:6e0c63257de34c92:0:01';
      const extractedSpanContext = jaegerHttpTraceFormat.extract('', carrier);

      assert.deepStrictEqual(extractedSpanContext, {
        spanId: new Uint8Array([
          0x6e,
          0x0c,
          0x63,
          0x25,
          0x7d,
          0xe3,
          0x4c,
          0x92,
        ]),
        traceId: new Uint8Array([
          0xd4,
          0xcd,
          0xa9,
          0x5b,
          0x65,
          0x2f,
          0x4a,
          0x15,
          0x92,
          0xb4,
          0x49,
          0xd5,
          0x92,
          0x9f,
          0xda,
          0x1b,
        ]),
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('should extract context of a sampled span from carrier with 1 bit flag', () => {
      carrier[UBER_TRACE_ID_HEADER] =
        '9c41e35aeb6d1272:45fd2a9709dadcf1:a13699e3fb724f40:1';
      const extractedSpanContext = jaegerHttpTraceFormat.extract('', carrier);

      assert.deepStrictEqual(extractedSpanContext, {
        spanId: new Uint8Array([
          0x45,
          0xfd,
          0x2a,
          0x97,
          0x09,
          0xda,
          0xdc,
          0xf1,
        ]),
        traceId: new Uint8Array([
          0x9c,
          0x41,
          0xe3,
          0x5a,
          0xeb,
          0x6d,
          0x12,
          0x72,
        ]),
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('should extract context of a sampled span from UTF-8 encoded carrier', () => {
      carrier[UBER_TRACE_ID_HEADER] =
        'ac1f3dc3c2c0b06e%3A5ac292c4a11a163e%3Ac086aaa825821068%3A1';
      const extractedSpanContext = jaegerHttpTraceFormat.extract('', carrier);

      assert.deepStrictEqual(extractedSpanContext, {
        spanId: new Uint8Array([
          0x5a,
          0xc2,
          0x92,
          0xc4,
          0xa1,
          0x1a,
          0x16,
          0x3e,
        ]),
        traceId: new Uint8Array([
          0xac,
          0x1f,
          0x3d,
          0xc3,
          0xc2,
          0xc0,
          0xb0,
          0x6e,
        ]),
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('should use custom header if provided', () => {
      carrier[customHeader] =
        'd4cda95b652f4a1592b449d5929fda1b:6e0c63257de34c92:0:01';
      const extractedSpanContext = customJaegerHttpTraceFormat.extract(
        '',
        carrier
      );

      assert.deepStrictEqual(extractedSpanContext, {
        spanId: new Uint8Array([
          0x6e,
          0x0c,
          0x63,
          0x25,
          0x7d,
          0xe3,
          0x4c,
          0x92,
        ]),
        traceId: new Uint8Array([
          0xd4,
          0xcd,
          0xa9,
          0x5b,
          0x65,
          0x2f,
          0x4a,
          0x15,
          0x92,
          0xb4,
          0x49,
          0xd5,
          0x92,
          0x9f,
          0xda,
          0x1b,
        ]),
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('returns null if UBER_TRACE_ID_HEADER header is missing', () => {
      assert.deepStrictEqual(jaegerHttpTraceFormat.extract('', carrier), null);
    });

    it('returns null if UBER_TRACE_ID_HEADER header is invalid', () => {
      carrier[UBER_TRACE_ID_HEADER] = 'invalid!';
      assert.deepStrictEqual(
        jaegerHttpTraceFormat.extract('HttpTraceContext', carrier),
        null
      );
    });
  });
});
