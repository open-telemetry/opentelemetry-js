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
import * as api from '@opentelemetry/api';
import { ReadableSpan } from '@opentelemetry/tracing';
import { hrTimeToMilliseconds } from '@opentelemetry/core';
import { id } from '../src/types';
import { translateToDatadog } from '../src/transform';
import {
  mockSpanContextUnsampled,
  mockSpanContextSampled,
  mockSpanContextOrigin,
  mockExandedReadableSpan,
} from './mocks';

describe('transform', () => {
  const spanContextUnsampled = mockSpanContextUnsampled;

  const spanContextSampled = mockSpanContextSampled;

  const spanContextOrigin = mockSpanContextOrigin;

  const parentSpanId = '6e0c63257de34c93';
  const serviceName = 'my-service';

  const generateOtelSpans = function (options: any): ReadableSpan[] {
    const otelSpans = [];
    const span: ReadableSpan = mockExandedReadableSpan;
    const updatedSpan = Object.assign(span, options);
    otelSpans.push(updatedSpan);
    return otelSpans;
  };

  describe('translateToDatadog', () => {
    it('should convert an OpenTelemetry span and its properties to a finished DatadogSpan', () => {
      const spans = generateOtelSpans({ spanContext: spanContextUnsampled });
      const datadogSpans = translateToDatadog(spans, serviceName);
      const datadogSpan = datadogSpans[0];

      assert.deepStrictEqual(datadogSpan.name, 'default.internal');
      assert.deepStrictEqual(datadogSpan.meta['span.kind'], 'internal');
      assert.deepStrictEqual(datadogSpan.resource, spans[0].name);
      assert.deepStrictEqual(datadogSpan.service, serviceName);

      assert.deepStrictEqual(
        datadogSpan.trace_id,
        id(spanContextUnsampled.traceId)
      );

      assert.deepStrictEqual(
        datadogSpan.span_id.toString('hex'),
        spanContextUnsampled.spanId
      );

      assert.deepStrictEqual(
        datadogSpan.parent_id.toString('hex'),
        '0000000000000000'
      );
      assert.deepStrictEqual(datadogSpan.error, 0);
      assert.deepStrictEqual(
        datadogSpan.start,
        Math.round(hrTimeToMilliseconds(spans[0].startTime) * 1e6)
      );
      assert.strictEqual(Object.keys(datadogSpan.meta).length, 4);
      assert.strictEqual(Object.keys(datadogSpan.metrics).length, 1);
      assert.strictEqual(
        datadogSpan.metrics['_sample_rate'],
        spanContextUnsampled.traceFlags
      );
      assert.strictEqual(datadogSpan.duration > 0, true);
    });

    it('should sample spans with sampled traceFlag', () => {
      const spans = generateOtelSpans({ spanContext: spanContextSampled });
      const datadogSpans = translateToDatadog(spans, serviceName);
      const datadogSpan = datadogSpans[0];

      assert.strictEqual(
        datadogSpan.metrics['_sample_rate'],
        spanContextSampled.traceFlags
      );
    });

    it('should set origin tag for spans with origin traceState', () => {
      const spans = generateOtelSpans({ spanContext: spanContextOrigin });
      const datadogSpans = translateToDatadog(spans, serviceName);
      const datadogSpan = datadogSpans[0];

      assert.strictEqual(datadogSpan.meta['_dd_origin'], 'synthetics-example');
    });

    it('should set tags based on the env, origin, and tags arguments', () => {
      const spans = generateOtelSpans({ spanContext: spanContextOrigin });
      const datadogSpans = translateToDatadog(
        spans,
        serviceName,
        'test_env',
        'v1.0',
        'is_test:true'
      );
      const datadogSpan = datadogSpans[0];

      assert.strictEqual(datadogSpan.meta['_dd_origin'], 'synthetics-example');
      assert.strictEqual(datadogSpan.meta['env'], 'test_env');
      assert.strictEqual(datadogSpan.meta['version'], 'v1.0');
      assert.strictEqual(datadogSpan.meta['is_test'], 'true');
    });

    it('should not set origin or version tag for child spans ', () => {
      const spans = generateOtelSpans({
        spanContext: spanContextOrigin,
        parentSpanId: parentSpanId,
      });
      const datadogSpans = translateToDatadog(
        spans,
        serviceName,
        'test_env',
        'v1.0',
        'is_test:true'
      );
      const datadogSpan = datadogSpans[0];

      assert.strictEqual(datadogSpan.meta['_dd_origin'], undefined);
      assert.strictEqual(datadogSpan.meta['version'], undefined);
    });

    it('should set an error and its tags on the datadog span when the otel span has a not OK status', () => {
      const spans = generateOtelSpans({
        spanContext: spanContextSampled,
        status: {
          code: api.CanonicalCode.NOT_FOUND,
          message: 'error message',
        },
        kind: api.SpanKind.CONSUMER,
      });
      const datadogSpans = translateToDatadog(spans, serviceName);
      const datadogSpan = datadogSpans[0];

      assert.strictEqual(datadogSpan.error, 1);
      assert.strictEqual(datadogSpan.meta['error.msg'], 'error message');
      assert.strictEqual(datadogSpan.meta['error.type'], 'NOT_FOUND');
    });

    it('should set the sampling rate to -1 for internally generated traces', () => {
      const spans = generateOtelSpans({
        spanContext: spanContextSampled,
        attributes: {
          'http.route': '/v0.4/traces/',
        },
      });
      const datadogSpans = translateToDatadog(spans, serviceName);
      const datadogSpan = datadogSpans[0];
      assert.strictEqual(datadogSpan.metrics['_sample_rate'], -1);
    });
  });
});
