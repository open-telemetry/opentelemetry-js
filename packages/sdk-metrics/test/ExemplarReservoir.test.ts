/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ROOT_CONTEXT,
  SpanContext,
  TraceFlags,
  trace,
} from '@opentelemetry/api';
import { hrTime } from '@opentelemetry/core';
import * as assert from 'assert';

import {
  SimpleFixedSizeExemplarReservoir,
  AlignedHistogramBucketExemplarReservoir,
} from '../src/exemplar';

describe('ExemplarReservoir', () => {
  const TRACE_ID = 'd4cda95b652f4a1592b449d5929fda1b';
  const SPAN_ID = '6e0c63257de34c92';

  describe('SimpleFixedSizeExemplarReservoir', () => {
    it('should not return any result without measurements', () => {
      const reservoir = new SimpleFixedSizeExemplarReservoir(10);
      assert.strictEqual(reservoir.collect({}).length, 0);
    });

    it('should have the trace context information', () => {
      const reservoir = new SimpleFixedSizeExemplarReservoir(1);
      const spanContext: SpanContext = {
        traceId: TRACE_ID,
        spanId: SPAN_ID,
        traceFlags: TraceFlags.SAMPLED,
      };
      const ctx = trace.setSpanContext(ROOT_CONTEXT, spanContext);

      reservoir.offer(1, hrTime(), {}, ctx);
      const exemplars = reservoir.collect({});
      assert.strictEqual(exemplars.length, 1);
      assert.strictEqual(exemplars[0].traceId, TRACE_ID);
      assert.strictEqual(exemplars[0].spanId, SPAN_ID);
    });
  });

  it('should filter the attributes', () => {
    const reservoir = new SimpleFixedSizeExemplarReservoir(1);
    reservoir.offer(
      1,
      hrTime(),
      { key1: 'value1', key2: 'value2' },
      ROOT_CONTEXT
    );
    const exemplars = reservoir.collect({ key2: 'value2', key3: 'value3' });
    assert.notStrictEqual(exemplars[0].filteredAttributes, { key1: 'value1' });
  });

  describe('AlignedHistogramBucketExemplarReservoir', () => {
    it('should put measurements into buckets', () => {
      const reservoir = new AlignedHistogramBucketExemplarReservoir([
        0, 5, 10, 25, 50, 75,
      ]);
      reservoir.offer(52, hrTime(), { bucket: '5' }, ROOT_CONTEXT);
      reservoir.offer(7, hrTime(), { bucket: '3' }, ROOT_CONTEXT);
      reservoir.offer(6, hrTime(), { bucket: '3' }, ROOT_CONTEXT);
      const exemplars = reservoir.collect({ bucket: '3' });
      assert.strictEqual(exemplars.length, 2);
      assert.strictEqual(exemplars[0].value, 6);
      assert.strictEqual(
        Object.keys(exemplars[0].filteredAttributes).length,
        0
      );
      assert.strictEqual(exemplars[1].value, 52);
      assert.notStrictEqual(exemplars[1].filteredAttributes, { bucket: '5' });
    });
  });
});
