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

import {
  defaultTextMapGetter,
  defaultTextMapSetter,
  INVALID_SPAN_CONTEXT,
  ROOT_CONTEXT,
  SpanContext,
  TraceFlags,
  trace,
} from '@opentelemetry/api';
import { TraceState } from '@opentelemetry/core';

import { AWSXRAY_TRACE_ID_HEADER, AWSXRayPropagator } from '../src';

describe('AWSXRayPropagator', () => {
  const xrayPropagator = new AWSXRayPropagator();
  const TRACE_ID = '8a3c60f7d188f8fa79d48a391a778fa6';
  const SPAN_ID = '53995c3f42cd8ad8';
  const SAMPLED_TRACE_FLAG = TraceFlags.SAMPLED;
  const NOT_SAMPLED_TRACE_FLAG = TraceFlags.NONE;

  let carrier: { [key: string]: unknown };

  beforeEach(() => {
    carrier = {};
  });

  describe('.inject()', () => {
    it('should inject sampled context', () => {
      const spanContext: SpanContext = {
        traceId: TRACE_ID,
        spanId: SPAN_ID,
        traceFlags: SAMPLED_TRACE_FLAG,
      };
      xrayPropagator.inject(
        trace.setSpan(ROOT_CONTEXT, trace.wrapSpanContext(spanContext)),
        carrier,
        defaultTextMapSetter
      );

      assert.deepStrictEqual(
        carrier[AWSXRAY_TRACE_ID_HEADER],
        'Root=1-8a3c60f7-d188f8fa79d48a391a778fa6;Parent=53995c3f42cd8ad8;Sampled=1'
      );
    });

    it('should inject not sampled context', () => {
      const spanContext: SpanContext = {
        traceId: TRACE_ID,
        spanId: SPAN_ID,
        traceFlags: NOT_SAMPLED_TRACE_FLAG,
      };
      xrayPropagator.inject(
        trace.setSpan(ROOT_CONTEXT, trace.wrapSpanContext(spanContext)),
        carrier,
        defaultTextMapSetter
      );

      assert.deepStrictEqual(
        carrier[AWSXRAY_TRACE_ID_HEADER],
        'Root=1-8a3c60f7-d188f8fa79d48a391a778fa6;Parent=53995c3f42cd8ad8;Sampled=0'
      );
    });

    it('should inject with TraceState', () => {
      const traceState = new TraceState();
      traceState.set('foo', 'bar');
      const spanContext: SpanContext = {
        traceId: TRACE_ID,
        spanId: SPAN_ID,
        traceFlags: SAMPLED_TRACE_FLAG,
        traceState: traceState,
      };
      xrayPropagator.inject(
        trace.setSpan(ROOT_CONTEXT, trace.wrapSpanContext(spanContext)),
        carrier,
        defaultTextMapSetter
      );

      // TODO: assert trace state when the propagator supports it
      assert.deepStrictEqual(
        carrier[AWSXRAY_TRACE_ID_HEADER],
        'Root=1-8a3c60f7-d188f8fa79d48a391a778fa6;Parent=53995c3f42cd8ad8;Sampled=1'
      );
    });

    it('inject without spanContext - should inject nothing', () => {
      xrayPropagator.inject(ROOT_CONTEXT, carrier, defaultTextMapSetter);

      assert.deepStrictEqual(carrier, {});
    });

    it('inject default invalid spanContext - should inject nothing', () => {
      xrayPropagator.inject(
        trace.setSpan(
          ROOT_CONTEXT,
          trace.wrapSpanContext(INVALID_SPAN_CONTEXT)
        ),
        carrier,
        defaultTextMapSetter
      );

      assert.deepStrictEqual(carrier, {});
    });
  });

  describe('.extract()', () => {
    it('extract nothing from context', () => {
      // context remains untouched
      assert.strictEqual(
        xrayPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter),
        ROOT_CONTEXT
      );
    });

    it('should extract sampled context', () => {
      carrier[AWSXRAY_TRACE_ID_HEADER] =
        'Root=1-8a3c60f7-d188f8fa79d48a391a778fa6;Parent=53995c3f42cd8ad8;Sampled=1';
      const extractedSpanContext = trace
        .getSpan(
          xrayPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
        )
        ?.spanContext();

      assert.deepStrictEqual(extractedSpanContext, {
        traceId: TRACE_ID,
        spanId: SPAN_ID,
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('should extract sampled context with arbitrary order', () => {
      carrier[AWSXRAY_TRACE_ID_HEADER] =
        'Parent=53995c3f42cd8ad8;Sampled=1;Root=1-8a3c60f7-d188f8fa79d48a391a778fa6';
      const extractedSpanContext = trace
        .getSpan(
          xrayPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
        )
        ?.spanContext();

      assert.deepStrictEqual(extractedSpanContext, {
        traceId: TRACE_ID,
        spanId: SPAN_ID,
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('should extract context with additional fields', () => {
      carrier[AWSXRAY_TRACE_ID_HEADER] =
        'Root=1-8a3c60f7-d188f8fa79d48a391a778fa6;Parent=53995c3f42cd8ad8;Sampled=1;Foo=Bar';
      const extractedSpanContext = trace
        .getSpan(
          xrayPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
        )
        ?.spanContext();

      // TODO: assert additional fields when the propagator supports it
      assert.deepStrictEqual(extractedSpanContext, {
        traceId: TRACE_ID,
        spanId: SPAN_ID,
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('extract empty header value - should return undefined', () => {
      carrier[AWSXRAY_TRACE_ID_HEADER] = '';
      const extractedSpanContext = trace
        .getSpan(
          xrayPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
        )
        ?.spanContext();

      assert.deepStrictEqual(extractedSpanContext, undefined);
    });

    it('extract invalid traceId - should return undefined', () => {
      carrier[AWSXRAY_TRACE_ID_HEADER] =
        'Root=1-abcdefgh-ijklmnopabcdefghijklmnop;Parent=53995c3f42cd8ad8;Sampled=0';
      const extractedSpanContext = trace
        .getSpan(
          xrayPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
        )
        ?.spanContext();

      assert.deepStrictEqual(extractedSpanContext, undefined);
    });

    it('extract invalid traceId size - should return undefined', () => {
      carrier[AWSXRAY_TRACE_ID_HEADER] =
        'Root=1-8a3c60f7-d188f8fa79d48a391a778fa600;Parent=53995c3f42cd8ad8;Sampled=0';
      const extractedSpanContext = trace
        .getSpan(
          xrayPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
        )
        ?.spanContext();

      assert.deepStrictEqual(extractedSpanContext, undefined);
    });

    it('extract invalid traceId delimiter - should return undefined', () => {
      carrier[AWSXRAY_TRACE_ID_HEADER] =
        'Root=1*8a3c60f7+d188f8fa79d48a391a778fa6;Parent=53995c3f42cd8ad8;Sampled=1;Foo=Bar';
      const extractedSpanContext = trace
        .getSpan(
          xrayPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
        )
        ?.spanContext();

      assert.deepStrictEqual(extractedSpanContext, undefined);
    });

    it('extract invalid spanId - should return undefined', () => {
      carrier[AWSXRAY_TRACE_ID_HEADER] =
        'Root=1-8a3c60f7-d188f8fa79d48a391a778fa6;Parent=abcdefghijklmnop;Sampled=0';
      const extractedSpanContext = trace
        .getSpan(
          xrayPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
        )
        ?.spanContext();

      assert.deepStrictEqual(extractedSpanContext, undefined);
    });

    it('extract invalid spanId size - should return undefined', () => {
      carrier[AWSXRAY_TRACE_ID_HEADER] =
        'Root=1-8a3c60f7-d188f8fa79d48a391a778fa6;Parent=53995c3f42cd8ad800;Sampled=0';
      const extractedSpanContext = trace
        .getSpan(
          xrayPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
        )
        ?.spanContext();

      assert.deepStrictEqual(extractedSpanContext, undefined);
    });

    it('extract invalid traceFlags - should return undefined', () => {
      carrier[AWSXRAY_TRACE_ID_HEADER] =
        'Root=1-8a3c60f7-d188f8fa79d48a391a778fa6;Parent=53995c3f42cd8ad8;Sampled=';
      const extractedSpanContext = trace
        .getSpan(
          xrayPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
        )
        ?.spanContext();

      assert.deepStrictEqual(extractedSpanContext, undefined);
    });

    it('extract invalid traceFlags length - should return undefined', () => {
      carrier[AWSXRAY_TRACE_ID_HEADER] =
        'Root=1-8a3c60f7-d188f8fa79d48a391a778fa6;Parent=53995c3f42cd8ad8;Sampled=10220';
      const extractedSpanContext = trace
        .getSpan(
          xrayPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
        )
        ?.spanContext();

      assert.deepStrictEqual(extractedSpanContext, undefined);
    });

    it('extract nonnumeric invalid traceFlags - should return undefined', () => {
      carrier[AWSXRAY_TRACE_ID_HEADER] =
        'Root=1-8a3c60f7-d188f8fa79d48a391a778fa6;Parent=53995c3f42cd8ad8;Sampled=a';
      const extractedSpanContext = trace
        .getSpan(
          xrayPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
        )
        ?.spanContext();

      assert.deepStrictEqual(extractedSpanContext, undefined);
    });

    it('extract invalid aws xray version - should return undefined', () => {
      carrier[AWSXRAY_TRACE_ID_HEADER] =
        'Root=2-8a3c60f7-d188f8fa79d48a391a778fa6;Parent=53995c3f42cd8ad8;Sampled=1';
      const extractedSpanContext = trace
        .getSpan(
          xrayPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
        )
        ?.spanContext();

      assert.deepStrictEqual(extractedSpanContext, undefined);
    });

    it('extracts context in a case-insensitive fashion', () => {
      carrier[AWSXRAY_TRACE_ID_HEADER.toUpperCase()] =
        'Root=1-8a3c60f7-d188f8fa79d48a391a778fa6;Parent=53995c3f42cd8ad8;Sampled=1;Foo=Bar';
      const extractedSpanContext = trace
        .getSpan(
          xrayPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
        )
        ?.spanContext();

      assert.deepStrictEqual(extractedSpanContext, {
        traceId: TRACE_ID,
        spanId: SPAN_ID,
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    describe('.fields()', () => {
      it('should return a field with AWS X-Ray Trace ID header', () => {
        const expectedField = xrayPropagator.fields();

        assert.deepStrictEqual([AWSXRAY_TRACE_ID_HEADER], expectedField);
      });
    });
  });
});
