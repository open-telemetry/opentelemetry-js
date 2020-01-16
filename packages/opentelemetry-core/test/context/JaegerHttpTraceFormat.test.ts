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
} from '../../src/context/propagation/JaegerHttpTraceFormat';
import { SpanContext, TraceFlags } from '@opentelemetry/types';

describe('JaegerHttpTraceFormat', () => {
  const jaegerHttpTraceFormat = new JaegerHttpTraceFormat();
  let carrier: { [key: string]: unknown };

  beforeEach(() => {
    carrier = {};
  });

  describe('.inject()', () => {
    it('should set uber trace id header', () => {
      const spanContext: SpanContext = {
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        spanId: '6e0c63257de34c92',
        traceFlags: TraceFlags.SAMPLED,
      };

      jaegerHttpTraceFormat.inject(spanContext, '', carrier);
      assert.deepStrictEqual(
        carrier[UBER_TRACE_ID_HEADER],
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
        spanId: '6e0c63257de34c92',
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
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
