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
  ROOT_CONTEXT,
  SpanContext,
  TraceFlags,
  trace,
  context,
} from '@opentelemetry/api';
import * as sinon from 'sinon';

import { AWSXRayLambdaPropagator } from '../src';
import { AWSXRAY_TRACE_ID_ENV_VAR } from '../src/AWSXRayLambdaPropagator';
import {
  AWSXRAY_TRACE_ID_HEADER,
  AWSXRayPropagator,
} from '@opentelemetry/propagator-aws-xray';

describe('AWSXRayPropagator', () => {
  const xrayLambdaPropagator = new AWSXRayLambdaPropagator();

  let carrier: { [key: string]: unknown };

  beforeEach(() => {
    carrier = {};
  });

  describe('.inject()', () => {
    it('should use AWSXRayPropagator inject()', () => {
      const spy = sinon.spy(AWSXRayPropagator.prototype, 'inject');
      assert.equal(spy.callCount, 0);
      xrayLambdaPropagator.inject(
        context.active(),
        carrier,
        defaultTextMapSetter
      );
      sinon.assert.calledOnceWithExactly(
        spy,
        context.active(),
        carrier,
        defaultTextMapSetter
      );
    });
  });

  describe('.extract()', () => {
    it('should extract context from the _X_AMZN_TRACE_ID env variable', () => {
      const xrayEnvSpanId = '53995c3f42cd8ad8';
      const xrayEnvTraceId = '8a3c60f7d188f8fa79d48a391a778fa6';
      process.env[AWSXRAY_TRACE_ID_ENV_VAR] =
        'Root=1-8a3c60f7-d188f8fa79d48a391a778fa6;Parent=53995c3f42cd8ad8;Sampled=1';
      const extractedSpanContext = trace
        .getSpan(
          xrayLambdaPropagator.extract(
            ROOT_CONTEXT,
            carrier,
            defaultTextMapGetter
          )
        )
        ?.spanContext();

      assert.deepStrictEqual(extractedSpanContext, {
        traceId: xrayEnvTraceId,
        spanId: xrayEnvSpanId,
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('should return current context if one exists', () => {
      const traceId = 'fd14414f1e61351035c43863714b4aa8';
      const spanId = '81e77faacf9f61f3';
      const existingContext: SpanContext = {
        traceId: traceId,
        spanId: spanId,
        traceFlags: TraceFlags.SAMPLED,
        isRemote: true,
      };
      const ctx = trace.setSpanContext(context.active(), existingContext);

      process.env[AWSXRAY_TRACE_ID_ENV_VAR] =
        'Root=1-8a3c60f7-d188f8fa79d48a391a778fa6;Parent=53995c3f42cd8ad8;Sampled=1';

      const extractedSpanContext = trace
        .getSpan(
          xrayLambdaPropagator.extract(ctx, carrier, defaultTextMapGetter)
        )
        ?.spanContext();

      assert.deepStrictEqual(extractedSpanContext, {
        traceId: traceId,
        spanId: spanId,
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('should return X-ray context from carrier when there is an existing context', () => {
      const traceId = 'fd14414f1e61351035c43863714b4aa8';
      const spanId = '81e77faacf9f61f3';
      const existingContext: SpanContext = {
        traceId: traceId,
        spanId: spanId,
        traceFlags: TraceFlags.SAMPLED,
        isRemote: true,
      };
      const ctx = trace.setSpanContext(context.active(), existingContext);

      process.env[AWSXRAY_TRACE_ID_ENV_VAR] =
        'Root=1-8a3c60f7-d188f8fa79d48a391a778fa6;Parent=53995c3f42cd8ad8;Sampled=1';

      const xrayHeaderSpanId = '4635c8688f46eb5d';
      const xrayHeaderTraceId = '48165d1ad6255f4cb1ddf9999ef6d536';
      carrier[AWSXRAY_TRACE_ID_HEADER] =
        'Root=1-48165d1a-d6255f4cb1ddf9999ef6d536;Parent=4635c8688f46eb5d;Sampled=1';

      const extractedSpanContext = trace
        .getSpan(
          xrayLambdaPropagator.extract(ctx, carrier, defaultTextMapGetter)
        )
        ?.spanContext();

      assert.deepStrictEqual(extractedSpanContext, {
        traceId: xrayHeaderTraceId,
        spanId: xrayHeaderSpanId,
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('should return env variable context if there is no active context but carrier also has xray headers', () => {
      const xrayEnvSpanId = '53995c3f42cd8ad8';
      const xrayEnvTraceId = '8a3c60f7d188f8fa79d48a391a778fa6';
      process.env[AWSXRAY_TRACE_ID_ENV_VAR] =
        'Root=1-8a3c60f7-d188f8fa79d48a391a778fa6;Parent=53995c3f42cd8ad8;Sampled=1';

      carrier[AWSXRAY_TRACE_ID_HEADER] =
        'Root=1-48165d1a-d6255f4cb1ddf9999ef6d536;Parent=4635c8688f46eb5d;Sampled=1';

      const extractedSpanContext = trace
        .getSpan(
          xrayLambdaPropagator.extract(
            context.active(),
            carrier,
            defaultTextMapGetter
          )
        )
        ?.spanContext();

      assert.deepStrictEqual(extractedSpanContext, {
        traceId: xrayEnvTraceId,
        spanId: xrayEnvSpanId,
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('should return current context if one exists', () => {
      delete process.env[AWSXRAY_TRACE_ID_ENV_VAR];

      const xrayHeaderSpanId = '53995c3f42cd8ad8';
      const xrayHeaderTraceId = '8a3c60f7d188f8fa79d48a391a778fa6';
      carrier[AWSXRAY_TRACE_ID_HEADER] =
        'Root=1-8a3c60f7-d188f8fa79d48a391a778fa6;Parent=53995c3f42cd8ad8;Sampled=1';
      const extractedSpanContext = trace
        .getSpan(
          xrayLambdaPropagator.extract(
            ROOT_CONTEXT,
            carrier,
            defaultTextMapGetter
          )
        )
        ?.spanContext();

      assert.deepStrictEqual(extractedSpanContext, {
        traceId: xrayHeaderTraceId,
        spanId: xrayHeaderSpanId,
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });
  });

  describe('.fields()', () => {
    it('should return a field with AWS X-Ray Trace ID header', () => {
      const actualFields = xrayLambdaPropagator.fields();
      assert.deepStrictEqual([AWSXRAY_TRACE_ID_HEADER], actualFields);
    });
  });
});
