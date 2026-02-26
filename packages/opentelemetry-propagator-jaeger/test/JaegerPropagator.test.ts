/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  defaultTextMapGetter,
  defaultTextMapSetter,
  propagation,
  ROOT_CONTEXT,
  SpanContext,
  TextMapGetter,
  trace,
  TraceFlags,
} from '@opentelemetry/api';
import { suppressTracing } from '@opentelemetry/core';
import * as assert from 'assert';
import {
  JaegerPropagator,
  UBER_TRACE_ID_HEADER,
  UBER_BAGGAGE_HEADER_PREFIX,
} from '../src/JaegerPropagator';

describe('JaegerPropagator', () => {
  const jaegerPropagator = new JaegerPropagator();
  const customHeader = 'new-header';
  const customBaggageHeaderPrefix = 'custom-baggage-header-prefix';
  const customJaegerPropagator = new JaegerPropagator(customHeader);
  const customJaegerPropagatorWithConfig = new JaegerPropagator({
    customTraceHeader: customHeader,
    customBaggageHeaderPrefix,
  });
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

      jaegerPropagator.inject(
        trace.setSpanContext(ROOT_CONTEXT, spanContext),
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

      customJaegerPropagator.inject(
        trace.setSpanContext(ROOT_CONTEXT, spanContext),
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

      jaegerPropagator.inject(
        suppressTracing(trace.setSpanContext(ROOT_CONTEXT, spanContext)),
        carrier,
        defaultTextMapSetter
      );
      assert.strictEqual(carrier[UBER_TRACE_ID_HEADER], undefined);
    });

    it('should propagate baggage with url encoded values', () => {
      const baggage = propagation.createBaggage({
        test: {
          value: '1',
        },
        myuser: {
          value: '%id%',
        },
      });

      jaegerPropagator.inject(
        propagation.setBaggage(ROOT_CONTEXT, baggage),
        carrier,
        defaultTextMapSetter
      );
      assert.strictEqual(carrier[`${UBER_BAGGAGE_HEADER_PREFIX}-test`], '1');
      assert.strictEqual(
        carrier[`${UBER_BAGGAGE_HEADER_PREFIX}-myuser`],
        encodeURIComponent('%id%')
      );
    });

    it('should propagate baggage with custom prefix with url encoded values', () => {
      const baggage = propagation.createBaggage({
        test: {
          value: '1',
        },
        myuser: {
          value: '%id%',
        },
      });

      customJaegerPropagatorWithConfig.inject(
        propagation.setBaggage(ROOT_CONTEXT, baggage),
        carrier,
        defaultTextMapSetter
      );
      assert.strictEqual(carrier[`${customBaggageHeaderPrefix}-test`], '1');
      assert.strictEqual(
        carrier[`${customBaggageHeaderPrefix}-myuser`],
        encodeURIComponent('%id%')
      );
    });
  });

  describe('.extract()', () => {
    it('should extract context of a sampled span from carrier', () => {
      carrier[UBER_TRACE_ID_HEADER] =
        'd4cda95b652f4a1592b449d5929fda1b:6e0c63257de34c92:0:01';
      const extractedSpanContext = trace.getSpanContext(
        jaegerPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
      );

      assert.deepStrictEqual(extractedSpanContext, {
        spanId: '6e0c63257de34c92',
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('should extract context of a sampled span from carrier with 1 bit flag(1)', () => {
      carrier[UBER_TRACE_ID_HEADER] =
        '9c41e35aeb6d1272:45fd2a9709dadcf1:a13699e3fb724f40:1';
      const extractedSpanContext = trace.getSpanContext(
        jaegerPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
      );

      assert.deepStrictEqual(extractedSpanContext, {
        spanId: '45fd2a9709dadcf1',
        traceId: '00000000000000009c41e35aeb6d1272',
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('should extract context of a sampled span from carrier with 1 bit flag(0)', () => {
      carrier[UBER_TRACE_ID_HEADER] =
        '9c41e35aeb6d1272:45fd2a9709dadcf1:a13699e3fb724f40:0';
      const extractedSpanContext = trace.getSpanContext(
        jaegerPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
      );

      assert.deepStrictEqual(extractedSpanContext, {
        spanId: '45fd2a9709dadcf1',
        traceId: '00000000000000009c41e35aeb6d1272',
        isRemote: true,
        traceFlags: TraceFlags.NONE,
      });
    });

    it('should extract context of a sampled span from UTF-8 encoded carrier', () => {
      carrier[UBER_TRACE_ID_HEADER] =
        'ac1f3dc3c2c0b06e%3A5ac292c4a11a163e%3Ac086aaa825821068%3A1';
      const extractedSpanContext = trace.getSpanContext(
        jaegerPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
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
      const extractedSpanContext = trace.getSpanContext(
        customJaegerPropagator.extract(
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
        trace.getSpanContext(
          jaegerPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
        ),
        undefined
      );
    });

    it('returns undefined if UBER_TRACE_ID_HEADER header is invalid', () => {
      carrier[UBER_TRACE_ID_HEADER] = 'invalid!';
      assert.deepStrictEqual(
        trace.getSpanContext(
          jaegerPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
        ),
        undefined
      );
    });

    it('should extract baggage from carrier', () => {
      carrier[`${UBER_BAGGAGE_HEADER_PREFIX}-test`] = 'value';
      carrier[`${UBER_BAGGAGE_HEADER_PREFIX}-myuser`] = '%25id%25';
      const extractedBaggage = propagation.getBaggage(
        jaegerPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
      );

      const firstEntry = extractedBaggage?.getEntry('test');
      assert.ok(typeof firstEntry !== 'undefined');
      assert.ok(firstEntry.value === 'value');
      const secondEntry = extractedBaggage?.getEntry('myuser');
      assert.ok(typeof secondEntry !== 'undefined');
      assert.ok(secondEntry.value === '%id%');
    });

    it('should extract baggage with custom prefix from carrier', () => {
      carrier[`${customBaggageHeaderPrefix}-test`] = 'value';
      carrier[`${customBaggageHeaderPrefix}-myuser`] = '%25id%25';
      const extractedBaggage = propagation.getBaggage(
        customJaegerPropagatorWithConfig.extract(
          ROOT_CONTEXT,
          carrier,
          defaultTextMapGetter
        )
      );

      const firstEntry = extractedBaggage?.getEntry('test');
      assert.ok(typeof firstEntry !== 'undefined');
      assert.ok(firstEntry.value === 'value');
      const secondEntry = extractedBaggage?.getEntry('myuser');
      assert.ok(typeof secondEntry !== 'undefined');
      assert.ok(secondEntry.value === '%id%');
    });

    it('should extract baggage from carrier and not override current one', () => {
      carrier[`${UBER_BAGGAGE_HEADER_PREFIX}-test`] = 'value';
      carrier[`${UBER_BAGGAGE_HEADER_PREFIX}-myuser`] = '%25id%25';
      const extractedBaggage = propagation.getBaggage(
        jaegerPropagator.extract(
          propagation.setBaggage(
            ROOT_CONTEXT,
            propagation.createBaggage({ one: { value: 'two' } })
          ),
          carrier,
          defaultTextMapGetter
        )
      );

      const firstEntry = extractedBaggage?.getEntry('test');
      assert.ok(typeof firstEntry !== 'undefined');
      assert.ok(firstEntry.value === 'value');
      const secondEntry = extractedBaggage?.getEntry('myuser');
      assert.ok(typeof secondEntry !== 'undefined');
      assert.ok(secondEntry.value === '%id%');
      const alreadyExistingEntry = extractedBaggage?.getEntry('one');
      assert.ok(typeof alreadyExistingEntry !== 'undefined');
      assert.ok(alreadyExistingEntry.value === 'two');
    });

    it('should handle invalid baggage from carrier (undefined)', () => {
      carrier[`${UBER_BAGGAGE_HEADER_PREFIX}-test`] = undefined;
      const extractedBaggage = propagation.getBaggage(
        jaegerPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
      );

      const firstEntry = extractedBaggage?.getEntry('test');
      assert.ok(typeof firstEntry === 'undefined');
    });

    it('should handle invalid baggage from carrier (array)', () => {
      carrier[`${UBER_BAGGAGE_HEADER_PREFIX}-test`] = ['one', 'two'];
      const extractedBaggage = propagation.getBaggage(
        jaegerPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
      );

      const firstEntry = extractedBaggage?.getEntry('test');
      assert.ok(typeof firstEntry !== 'undefined');
      assert.ok(firstEntry.value === 'one');
    });

    it('should 0-pad span and trace id from header', () => {
      carrier[UBER_TRACE_ID_HEADER] =
        '4cda95b652f4a1592b449d5929fda1b:e0c63257de34c92:0:01';
      const extractedSpanContext = trace.getSpanContext(
        jaegerPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
      );

      assert.ok(extractedSpanContext);
      assert.equal(extractedSpanContext.spanId, '0e0c63257de34c92');
      assert.equal(
        extractedSpanContext.traceId,
        '04cda95b652f4a1592b449d5929fda1b'
      );
    });
  });

  describe('.fields()', () => {
    it('returns the default header if not customized', () => {
      assert.deepStrictEqual(jaegerPropagator.fields(), ['uber-trace-id']);
    });
    it('returns the customized header if customized', () => {
      assert.deepStrictEqual(customJaegerPropagator.fields(), [customHeader]);
    });
    it('returns the customized header if customized with config', () => {
      assert.deepStrictEqual(customJaegerPropagatorWithConfig.fields(), [
        customHeader,
      ]);
    });
  });

  it('should fail gracefully on bad responses from getter', () => {
    const ctx1 = jaegerPropagator.extract(
      ROOT_CONTEXT,
      carrier,
      makeGetter(1) // not a number
    );
    const ctx2 = jaegerPropagator.extract(
      ROOT_CONTEXT,
      carrier,
      makeGetter([]) // empty array
    );
    const ctx3 = jaegerPropagator.extract(
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
