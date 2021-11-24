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
import { ROOT_CONTEXT, SpanContext, TraceFlags, trace } from '@opentelemetry/api';

import {
  AlwaysSampleExemplarFilter,
  NeverSampleExemplarFilter,
  WithTraceExemplarFilter
} from '../src/exemplar/';


describe('ExemplarFilter', () => {
  const TRACE_ID = 'd4cda95b652f4a1592b449d5929fda1b';
  const SPAN_ID = '6e0c63257de34c92';

  describe('AlwaysSampleExemplarFilter', () => {
    it('should return true always for shouldSample', () => {
      const filter = new AlwaysSampleExemplarFilter();
      assert.strictEqual(filter.shouldSample(10, [0, 0], {}, ROOT_CONTEXT), true);
    });
  });

  describe('NeverSampleExemplarFilter', () => {
    it('should return false always for shouldSample', () => {
      const filter = new NeverSampleExemplarFilter()
      assert.strictEqual(filter.shouldSample(1, [0, 0], {}, ROOT_CONTEXT), false);
    });
  });

  describe('WithTraceExemplarFilter', () => {
    it('should return false for shouldSample when the trace is not sampled', () => {
      const filter = new WithTraceExemplarFilter();
      const spanContext: SpanContext = {
        traceId: TRACE_ID,
        spanId: SPAN_ID,
        traceFlags: TraceFlags.NONE,
      };
      const ctx = trace.setSpanContext(ROOT_CONTEXT, spanContext)
      assert.strictEqual(filter.shouldSample(5.3, [0, 0,], {}, ctx), false);
    });

    it('should return true for shouldSample when the trace is sampled', () => {
      const filter = new WithTraceExemplarFilter();
      const spanContext: SpanContext = {
        traceId: TRACE_ID,
        spanId: SPAN_ID,
        traceFlags: TraceFlags.SAMPLED,
      };
      const ctx = trace.setSpanContext(ROOT_CONTEXT, spanContext)
      assert.strictEqual(filter.shouldSample(5.3, [0, 0,], {}, ctx), true);
    });
  });
});
