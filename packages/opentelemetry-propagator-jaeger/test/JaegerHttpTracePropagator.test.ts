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

import {
  defaultTextMapGetter,
  defaultTextMapSetter,
  getSpanContext,
  ROOT_CONTEXT,
  setSpanContext,
  SpanContext,
  suppressInstrumentation,
  TextMapGetter,
  TraceFlags,
} from '@opentelemetry/api';
import * as assert from 'assert';
import {
  JaegerHttpTracePropagator,
  UBER_TRACE_ID_HEADER,
} from '../src/JaegerHttpTracePropagator';

describe('JaegerHttpTracePropagator', () => {
  const jaegerHttpTracePropagator = new JaegerHttpTracePropagator();
  const customHeader = 'new-header';
  const customJaegerHttpTracePropagator = new JaegerHttpTracePropagator(
    customHeader
  );
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

      jaegerHttpTracePropagator.inject(
        setSpanContext(ROOT_CONTEXT, spanContext),
        carrier,
        defaultTextMapSetter
      );
      assert.deepStrictEqual(
        carrier[UBER_TRACE_ID_HEADER],
        'd4cda95b652f4a1592b449d5929fda1b:6e0c63257de34c92:0:01'
      );
    });

    it('should use custom header if provided', () => {
      const spanContext: SpanContext = {
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        spanId: '6e0c63257de34c92',
        traceFlags: TraceFlags.SAMPLED,
      };

      customJaegerHttpTracePropagator.inject(
        setSpanContext(ROOT_CONTEXT, spanContext),
        carrier,
        defaultTextMapSetter
      );
      assert.deepStrictEqual(
        carrier[customHeader],
        'd4cda95b652f4a1592b449d5929fda1b:6e0c63257de34c92:0:01'
      );
    });

    it('should not set uber trace id header if instrumentation suppressed', () => {
      const spanContext: SpanContext = {
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        spanId: '6e0c63257de34c92',
        traceFlags: TraceFlags.SAMPLED,
      };

      jaegerHttpTracePropagator.inject(
        suppressInstrumentation(setSpanContext(ROOT_CONTEXT, spanContext)),
        carrier,
        defaultTextMapSetter
      );
      assert.strictEqual(carrier[UBER_TRACE_ID_HEADER], undefined);
    });
  });

  describe('.extract()', () => {
    it('should extract context of a sampled span from carrier', () => {
      carrier[UBER_TRACE_ID_HEADER] =
        'd4cda95b652f4a1592b449d5929fda1b:6e0c63257de34c92:0:01';
      const extractedSpanContext = getSpanContext(
        jaegerHttpTracePropagator.extract(
          ROOT_CONTEXT,
          carrier,
          defaultTextMapGetter
        )
      );

      assert.deepStrictEqual(extractedSpanContext, {
        spanId: '6e0c63257de34c92',
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('should extract context of a sampled span from carrier with 1 bit flag', () => {
      carrier[UBER_TRACE_ID_HEADER] =
        '9c41e35aeb6d1272:45fd2a9709dadcf1:a13699e3fb724f40:1';
      const extractedSpanContext = getSpanContext(
        jaegerHttpTracePropagator.extract(
          ROOT_CONTEXT,
          carrier,
          defaultTextMapGetter
        )
      );

      assert.deepStrictEqual(extractedSpanContext, {
        spanId: '45fd2a9709dadcf1',
        traceId: '00000000000000009c41e35aeb6d1272',
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('should extract context of a sampled span from UTF-8 encoded carrier', () => {
      carrier[UBER_TRACE_ID_HEADER] =
        'ac1f3dc3c2c0b06e%3A5ac292c4a11a163e%3Ac086aaa825821068%3A1';
      const extractedSpanContext = getSpanContext(
        jaegerHttpTracePropagator.extract(
          ROOT_CONTEXT,
          carrier,
          defaultTextMapGetter
        )
      );

      assert.deepStrictEqual(extractedSpanContext, {
        spanId: '5ac292c4a11a163e',
        traceId: '0000000000000000ac1f3dc3c2c0b06e',
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('should use custom header if provided', () => {
      carrier[customHeader] =
        'd4cda95b652f4a1592b449d5929fda1b:6e0c63257de34c92:0:01';
      const extractedSpanContext = getSpanContext(
        customJaegerHttpTracePropagator.extract(
          ROOT_CONTEXT,
          carrier,
          defaultTextMapGetter
        )
      );

      assert.deepStrictEqual(extractedSpanContext, {
        spanId: '6e0c63257de34c92',
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('returns undefined if UBER_TRACE_ID_HEADER header is missing', () => {
      assert.deepStrictEqual(
        getSpanContext(
          jaegerHttpTracePropagator.extract(
            ROOT_CONTEXT,
            carrier,
            defaultTextMapGetter
          )
        ),
        undefined
      );
    });

    it('returns undefined if UBER_TRACE_ID_HEADER header is invalid', () => {
      carrier[UBER_TRACE_ID_HEADER] = 'invalid!';
      assert.deepStrictEqual(
        getSpanContext(
          jaegerHttpTracePropagator.extract(
            ROOT_CONTEXT,
            carrier,
            defaultTextMapGetter
          )
        ),
        undefined
      );
    });
  });

  describe('.fields()', () => {
    it('returns the default header if not customized', () => {
      assert.deepStrictEqual(jaegerHttpTracePropagator.fields(), [
        'uber-trace-id',
      ]);
    });
    it('returns the customized header if customized', () => {
      assert.deepStrictEqual(customJaegerHttpTracePropagator.fields(), [
        customHeader,
      ]);
    });
  });

  it('should fail gracefully on bad responses from getter', () => {
    const ctx1 = jaegerHttpTracePropagator.extract(
      ROOT_CONTEXT,
      carrier,
      makeGetter(1) // not a number
    );
    const ctx2 = jaegerHttpTracePropagator.extract(
      ROOT_CONTEXT,
      carrier,
      makeGetter([]) // empty array
    );
    const ctx3 = jaegerHttpTracePropagator.extract(
      ROOT_CONTEXT,
      carrier,
      makeGetter(undefined) // missing value
    );

    assert.ok(ctx1 === ROOT_CONTEXT);
    assert.ok(ctx2 === ROOT_CONTEXT);
    assert.ok(ctx3 === ROOT_CONTEXT);
  });
});

function makeGetter(value: any) {
  const getter: TextMapGetter = {
    get(carrier, key) {
      return value;
    },
    keys(carrier) {
      if (carrier == null) {
        return [];
      }
      return Object.keys(carrier);
    },
  };
  return getter;
}
