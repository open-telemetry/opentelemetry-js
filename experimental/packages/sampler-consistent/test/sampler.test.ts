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

import { context, SpanContext, SpanKind, TraceFlags } from '@opentelemetry/api';
import { SamplingDecision } from '@opentelemetry/sdk-trace-base';

import {
  CompositeSampler,
  ComposableAlwaysOffSampler,
  ComposableAlwaysOnSampler,
  ComposableParentThresholdSampler,
  ComposableTraceIDRatioBasedSampler,
} from '../src';
import { INVALID_RANDOM_VALUE, INVALID_THRESHOLD } from '../src/util';
import {
  invalidTraceState,
  parseOtelTraceState,
  serializeTraceState,
} from '../src/tracestate';
import { TraceState } from '@opentelemetry/core';
import { setSpanContext } from '../../../../api/src/trace/context-utils';

describe('ConsistentSampler', () => {
  const traceId = '00112233445566778800000000000000';
  const spanId = '0123456789abcdef';

  [
    {
      sampler: new ComposableAlwaysOnSampler(),
      parentSampled: true,
      parentThreshold: undefined,
      parentRandomValue: undefined,
      sampled: true,
      threshold: 0n,
      randomValue: INVALID_RANDOM_VALUE,
      testId: 'min threshold no parent random value',
    },
    {
      sampler: new ComposableAlwaysOnSampler(),
      parentSampled: true,
      parentThreshold: undefined,
      parentRandomValue: 0x7f99aa40c02744n,
      sampled: true,
      threshold: 0n,
      randomValue: 0x7f99aa40c02744n,
      testId: 'min threshold with parent random value',
    },
    {
      sampler: new ComposableAlwaysOffSampler(),
      parentSampled: true,
      parentThreshold: undefined,
      parentRandomValue: undefined,
      sampled: false,
      threshold: INVALID_THRESHOLD,
      randomValue: INVALID_RANDOM_VALUE,
      testId: 'max threshold',
    },
    {
      sampler: new ComposableParentThresholdSampler(
        new ComposableAlwaysOnSampler()
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
      sampler: new ComposableParentThresholdSampler(
        new ComposableAlwaysOnSampler()
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
      sampler: new ComposableTraceIDRatioBasedSampler(0.5),
      parentSampled: true,
      parentThreshold: undefined,
      parentRandomValue: 0x7fffffffffffffn,
      sampled: false,
      threshold: INVALID_THRESHOLD,
      randomValue: 0x7fffffffffffffn,
      testId: 'half threshold not sampled',
    },
    {
      sampler: new ComposableTraceIDRatioBasedSampler(0.5),
      parentSampled: false,
      parentThreshold: undefined,
      parentRandomValue: 0x80000000000000n,
      sampled: true,
      threshold: 0x80000000000000n,
      randomValue: 0x80000000000000n,
      testId: 'half threshold sampled',
    },
    {
      sampler: new ComposableTraceIDRatioBasedSampler(1.0),
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
        const parentOtTraceState = invalidTraceState();
        if (parentThreshold !== undefined) {
          parentOtTraceState.threshold = parentThreshold;
        }
        if (parentRandomValue !== undefined) {
          parentOtTraceState.randomValue = parentRandomValue;
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
        const parentContext = setSpanContext(
          context.active(),
          parentSpanContext
        );

        const result = new CompositeSampler(sampler).shouldSample(
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
});
