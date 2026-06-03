/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';

import {
  propagation,
  ROOT_CONTEXT,
  trace,
  TraceFlags,
} from '@opentelemetry/api';
import {
  TraceState,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';

import { EnvironmentGetter, EnvironmentSetter } from '../src';

type EnvironmentCarrier = Record<string, string>;

describe('EnvironmentGetter and EnvironmentSetter', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    clearEnv();
  });

  afterEach(() => {
    clearEnv();
    Object.assign(process.env, originalEnv);
  });

  describe('EnvironmentSetter', () => {
    it('should normalize keys when setting values', () => {
      const carrier: EnvironmentCarrier = {};
      const setter = new EnvironmentSetter();

      setter.set(carrier, 'traceparent', 'traceparent-value');
      setter.set(carrier, 'trace-state', 'tracestate-value');
      setter.set(carrier, 'foo.bar', 'dot-value');
      setter.set(carrier, 'MiXeD_cAsE', 'mixed-value');
      setter.set(carrier, 'h\u00e9llo', 'non-ascii-value');
      setter.set(carrier, '1abc', 'leading-digit-value');

      assert.deepStrictEqual(carrier, {
        TRACEPARENT: 'traceparent-value',
        TRACE_STATE: 'tracestate-value',
        FOO_BAR: 'dot-value',
        MIXED_CASE: 'mixed-value',
        H_LLO: 'non-ascii-value',
        _1ABC: 'leading-digit-value',
      });
    });

    it('should preserve digits and underscores when normalizing keys', () => {
      const carrier: EnvironmentCarrier = {};
      const setter = new EnvironmentSetter();

      setter.set(carrier, 'a_1-b_2', 'value');

      assert.deepStrictEqual(carrier, {
        A_1_B_2: 'value',
      });
    });

    it('should overwrite values with the same normalized key', () => {
      const carrier: EnvironmentCarrier = {};
      const setter = new EnvironmentSetter();

      setter.set(carrier, 'trace-state', 'first');
      setter.set(carrier, 'TRACE_STATE', 'second');

      assert.deepStrictEqual(carrier, {
        TRACE_STATE: 'second',
      });
    });

    it('should treat values as opaque strings', () => {
      const carrier: EnvironmentCarrier = {};
      const setter = new EnvironmentSetter();

      setter.set(carrier, 'empty', '');
      setter.set(carrier, 'whitespace', '  value  ');

      assert.deepStrictEqual(carrier, {
        EMPTY: '',
        WHITESPACE: '  value  ',
      });
    });

    it('should not modify process.env', () => {
      const carrier: EnvironmentCarrier = {};
      const setter = new EnvironmentSetter();

      setter.set(carrier, 'traceparent', 'value');

      assert.deepStrictEqual(Object.keys(process.env), []);
      assert.deepStrictEqual(carrier, { TRACEPARENT: 'value' });
    });
  });

  describe('EnvironmentGetter', () => {
    it('should normalize keys when reading values', () => {
      process.env.TRACEPARENT = 'traceparent-value';
      process.env.TRACE_STATE = 'tracestate-value';
      process.env.FOO_BAR = 'dot-value';
      process.env.MIXED_CASE = 'mixed-value';
      process.env.H_LLO = 'non-ascii-value';
      process.env._1ABC = 'leading-digit-value';
      process.env['x-b3-traceid'] = 'b3-value';

      const getter = new EnvironmentGetter();

      assert.strictEqual(
        getter.get(undefined, 'traceparent'),
        'traceparent-value'
      );
      assert.strictEqual(
        getter.get(undefined, 'trace-state'),
        'tracestate-value'
      );
      assert.strictEqual(getter.get(undefined, 'foo.bar'), 'dot-value');
      assert.strictEqual(
        getter.get(undefined, 'MiXeD_cAsE'),
        'mixed-value'
      );
      assert.strictEqual(
        getter.get(undefined, 'h\u00e9llo'),
        'non-ascii-value'
      );
      assert.strictEqual(
        getter.get(undefined, '1abc'),
        'leading-digit-value'
      );
      assert.strictEqual(getter.get(undefined, 'X_B3_TRACEID'), 'b3-value');
      assert.strictEqual(getter.get(undefined, 'x-b3-traceid'), 'b3-value');
    });

    it('should return normalized snapshot keys', () => {
      process.env.traceparent = 'traceparent-value';
      process.env['trace-state'] = 'tracestate-value';

      const getter = new EnvironmentGetter();

      assert.deepStrictEqual(getter.keys(undefined).sort(), [
        'TRACEPARENT',
        'TRACE_STATE',
      ]);
    });

    it('should return empty keys for an empty environment snapshot', () => {
      const getter = new EnvironmentGetter();

      assert.deepStrictEqual(getter.keys(undefined), []);
    });

    it('should return undefined when a key is missing', () => {
      process.env.TRACEPARENT = 'traceparent-value';

      const getter = new EnvironmentGetter();

      assert.strictEqual(getter.get(undefined, 'tracestate'), undefined);
    });

    it('should list duplicate normalized environment names once', () => {
      process.env.traceparent = 'first';
      process.env.TRACEPARENT = 'second';

      const getter = new EnvironmentGetter();

      assert.deepStrictEqual(getter.keys(undefined), ['TRACEPARENT']);
    });

    it('should preserve empty string values', () => {
      process.env.EMPTY = '';

      const getter = new EnvironmentGetter();

      assert.strictEqual(getter.get(undefined, 'empty'), '');
    });

    it('should snapshot process.env at construction time', () => {
      process.env.TRACEPARENT = 'original';
      const getter = new EnvironmentGetter();

      process.env.TRACEPARENT = 'updated';
      process.env.TRACESTATE = 'added-after-construction';

      assert.strictEqual(getter.get(undefined, 'traceparent'), 'original');
      assert.strictEqual(getter.get(undefined, 'tracestate'), undefined);
    });

    it('should read from the environment snapshot without a carrier', () => {
      process.env.TRACEPARENT = 'environment-value';

      const getter = new EnvironmentGetter();

      assert.strictEqual(
        getter.get(undefined, 'traceparent'),
        'environment-value'
      );
    });
  });

  describe('propagator integration', () => {
    const traceId = '4bf92f3577b34da6a3ce929d0e0e4736';
    const spanId = '00f067aa0ba902b7';

    it('should inject W3C trace context into an environment carrier', () => {
      const propagator = new W3CTraceContextPropagator();
      const context = trace.setSpanContext(ROOT_CONTEXT, {
        traceId,
        spanId,
        traceFlags: TraceFlags.SAMPLED,
        traceState: new TraceState('vendor1=value1,vendor2=value2'),
      });
      const carrier: EnvironmentCarrier = {};

      propagator.inject(context, carrier, new EnvironmentSetter());

      assert.deepStrictEqual(carrier, {
        TRACEPARENT: `00-${traceId}-${spanId}-01`,
        TRACESTATE: 'vendor1=value1,vendor2=value2',
      });
    });

    it('should extract W3C trace context from an environment snapshot', () => {
      process.env.TRACEPARENT = `00-${traceId}-${spanId}-01`;
      process.env.TRACESTATE = 'vendor1=value1,vendor2=value2';

      const propagator = new W3CTraceContextPropagator();
      const context = propagator.extract(
        ROOT_CONTEXT,
        undefined,
        new EnvironmentGetter()
      );
      const spanContext = trace.getSpanContext(context);

      assert.strictEqual(spanContext?.traceId, traceId);
      assert.strictEqual(spanContext?.spanId, spanId);
      assert.strictEqual(spanContext?.traceFlags, TraceFlags.SAMPLED);
      assert.strictEqual(spanContext?.isRemote, true);
      assert.strictEqual(spanContext?.traceState?.get('vendor1'), 'value1');
      assert.strictEqual(spanContext?.traceState?.get('vendor2'), 'value2');
    });

    it('should inject W3C baggage into an environment carrier', () => {
      const propagator = new W3CBaggagePropagator();
      const context = propagation.setBaggage(
        ROOT_CONTEXT,
        propagation.createBaggage({
          first: { value: 'one' },
          second: { value: 'two' },
        })
      );
      const carrier: EnvironmentCarrier = {};

      propagator.inject(context, carrier, new EnvironmentSetter());

      assert.strictEqual(carrier.BAGGAGE, 'first=one,second=two');
    });

    it('should extract W3C baggage from an environment snapshot', () => {
      process.env.BAGGAGE = 'first=one,second=two';

      const propagator = new W3CBaggagePropagator();
      const context = propagator.extract(
        ROOT_CONTEXT,
        undefined,
        new EnvironmentGetter()
      );
      const baggage = propagation.getBaggage(context);

      assert.strictEqual(baggage?.getEntry('first')?.value, 'one');
      assert.strictEqual(baggage?.getEntry('second')?.value, 'two');
    });
  });
});

function clearEnv() {
  for (const key of Object.keys(process.env)) {
    delete process.env[key];
  }
}
