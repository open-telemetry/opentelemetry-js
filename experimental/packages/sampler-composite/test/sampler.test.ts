/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';

import type { SpanContext } from '@opentelemetry/api';
import { context, SpanKind, TraceFlags, trace } from '@opentelemetry/api';
import { SamplingDecision } from '@opentelemetry/sdk-trace';

import {
  createCompositeSampler,
  createComposableAlwaysOffSampler,
  createComposableAlwaysOnSampler,
  createComposableParentThresholdSampler,
  createComposableProbabilitySampler,
} from '../src';
import { INVALID_RANDOM_VALUE, INVALID_THRESHOLD } from '../src/util';
import {
  INVALID_TRACE_STATE,
  parseOtelTraceState,
  serializeTraceState,
} from '../src/tracestate';
import { TraceState } from '@opentelemetry/core';

describe('ConsistentSampler', () => {
  const traceId = '00112233445566778800000000000000';
  const spanId = '0123456789abcdef';

  [
    {
      sampler: createComposableAlwaysOnSampler(),
      parentSampled: true,
      parentThreshold: undefined,
      parentRandomValue: undefined,
      sampled: true,
      threshold: 0n,
      randomValue: INVALID_RANDOM_VALUE,
      testId: 'min threshold no parent random value',
    },
    {
      sampler: createComposableAlwaysOnSampler(),
      parentSampled: true,
      parentThreshold: undefined,
      parentRandomValue: 0x7f99aa40c02744n,
      sampled: true,
      threshold: 0n,
      randomValue: 0x7f99aa40c02744n,
      testId: 'min threshold with parent random value',
    },
    {
      sampler: createComposableAlwaysOffSampler(),
      parentSampled: true,
      parentThreshold: undefined,
      parentRandomValue: undefined,
      sampled: false,
      threshold: INVALID_THRESHOLD,
      randomValue: INVALID_RANDOM_VALUE,
      testId: 'max threshold',
    },
    {
      sampler: createComposableParentThresholdSampler(
        createComposableAlwaysOnSampler()
      ),
      parentSampled: false,
      parentThreshold: 0x7f99aa40c02744n,
      parentRandomValue: 0x7f99aa40c02744n,
      sampled: true,
      threshold: 0x7f99aa40c02744n,
      randomValue: 0x7f99aa40c02744n,
      testId: 'parent based in consistent mode',
    },
    {
      sampler: createComposableParentThresholdSampler(
        createComposableAlwaysOnSampler()
      ),
      parentSampled: true,
      parentThreshold: undefined,
      parentRandomValue: undefined,
      sampled: true,
      threshold: INVALID_THRESHOLD,
      randomValue: INVALID_RANDOM_VALUE,
      testId: 'parent based in legacy mode',
    },
    {
      sampler: createComposableProbabilitySampler(0.5),
      parentSampled: true,
      parentThreshold: undefined,
      parentRandomValue: 0x7fffffffffffffn,
      sampled: false,
      threshold: INVALID_THRESHOLD,
      randomValue: 0x7fffffffffffffn,
      testId: 'half threshold not sampled',
    },
    {
      sampler: createComposableProbabilitySampler(0.5),
      parentSampled: false,
      parentThreshold: undefined,
      parentRandomValue: 0x80000000000000n,
      sampled: true,
      threshold: 0x80000000000000n,
      randomValue: 0x80000000000000n,
      testId: 'half threshold sampled',
    },
    {
      sampler: createComposableProbabilitySampler(1.0),
      parentSampled: false,
      parentThreshold: 0x80000000000000n,
      parentRandomValue: 0x80000000000000n,
      sampled: true,
      threshold: 0n,
      randomValue: 0x80000000000000n,
      testId: 'parent inviolating invariant',
    },
  ].forEach(
    ({
      sampler,
      parentSampled,
      parentThreshold,
      parentRandomValue,
      sampled,
      threshold,
      randomValue,
      testId,
    }) => {
      it(`should sample with ${testId}`, () => {
        let parentOtTraceState = INVALID_TRACE_STATE;
        if (parentThreshold !== undefined) {
          parentOtTraceState = {
            ...parentOtTraceState,
            threshold: parentThreshold,
          };
        }
        if (parentRandomValue !== undefined) {
          parentOtTraceState = {
            ...parentOtTraceState,
            randomValue: parentRandomValue,
          };
        }
        const parentOt = serializeTraceState(parentOtTraceState);
        const parentTraceState = parentOt
          ? new TraceState().set('ot', parentOt)
          : undefined;
        const traceFlags = parentSampled ? TraceFlags.SAMPLED : TraceFlags.NONE;
        const parentSpanContext: SpanContext = {
          traceId,
          spanId,
          traceFlags,
          traceState: parentTraceState,
        };
        const parentContext = trace.setSpanContext(
          context.active(),
          parentSpanContext
        );

        const result = createCompositeSampler(sampler).shouldSample(
          parentContext,
          traceId,
          'name',
          SpanKind.INTERNAL,
          {},
          []
        );
        const expectedDecision = sampled
          ? SamplingDecision.RECORD_AND_SAMPLED
          : SamplingDecision.NOT_RECORD;
        const state = parseOtelTraceState(result.traceState);

        assert.strictEqual(result.decision, expectedDecision);
        assert.strictEqual(state.threshold, threshold);
        assert.strictEqual(state.randomValue, randomValue);
      });
    }
  );

  describe('clearing a stale inherited `ot` value', () => {
    // Reproduces the case where the recomputed `ot` member serializes to an
    // empty string (nothing new to write): no threshold, no random value, and
    // no other members. Before the fix, the code only called
    // `traceState.set('ot', otts)` when `otts` was truthy, so an inherited
    // `ot` value from the parent passed straight through untouched.
    const parentTraceState = new TraceState().set('ot', 'th:8');
    const parentSpanContext: SpanContext = {
      traceId,
      spanId,
      traceFlags: TraceFlags.SAMPLED,
      traceState: parentTraceState,
    };
    const parentContext = trace.setSpanContext(
      context.active(),
      parentSpanContext
    );

    it('should clear the parent `ot` value from a dropped span', () => {
      // ratio 0 drops unconditionally and is not threshold-reliable, so the
      // recomputed otTraceState has no valid threshold or random value.
      const sampler = createCompositeSampler(
        createComposableProbabilitySampler(0)
      );
      const result = sampler.shouldSample(
        parentContext,
        traceId,
        'name',
        SpanKind.INTERNAL,
        {},
        []
      );
      assert.strictEqual(result.decision, SamplingDecision.NOT_RECORD);
      assert.strictEqual(result.traceState?.get('ot'), undefined);
    });

    it('should leave no `ot` member on a root span with nothing to write', () => {
      const sampler = createCompositeSampler(
        createComposableProbabilitySampler(0)
      );
      const result = sampler.shouldSample(
        context.active(),
        traceId,
        'name',
        SpanKind.INTERNAL,
        {},
        []
      );
      assert.strictEqual(result.decision, SamplingDecision.NOT_RECORD);
      assert.strictEqual(result.traceState, undefined);
    });

    it('should still write a fresh `ot` value when sampled', () => {
      const sampler = createCompositeSampler(
        createComposableProbabilitySampler(1)
      );
      const result = sampler.shouldSample(
        parentContext,
        traceId,
        'name',
        SpanKind.INTERNAL,
        {},
        []
      );
      assert.strictEqual(result.decision, SamplingDecision.RECORD_AND_SAMPLED);
      assert.strictEqual(result.traceState?.get('ot'), 'th:0');
    });

    it('should preserve unrelated tracestate members while clearing `ot`', () => {
      const sampler = createCompositeSampler(
        createComposableProbabilitySampler(0)
      );
      const parentWithVendor = new TraceState()
        .set('vendor', 'xyz')
        .set('ot', 'th:8');
      const parentContextWithVendor = trace.setSpanContext(context.active(), {
        traceId,
        spanId,
        traceFlags: TraceFlags.SAMPLED,
        traceState: parentWithVendor,
      });
      const result = sampler.shouldSample(
        parentContextWithVendor,
        traceId,
        'name',
        SpanKind.INTERNAL,
        {},
        []
      );
      assert.strictEqual(result.decision, SamplingDecision.NOT_RECORD);
      assert.strictEqual(result.traceState?.get('vendor'), 'xyz');
      assert.strictEqual(result.traceState?.get('ot'), undefined);
    });
  });
});
