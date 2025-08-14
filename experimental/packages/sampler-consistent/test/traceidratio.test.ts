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

import { context, SpanKind } from '@opentelemetry/api';
import { SamplingDecision } from '@opentelemetry/sdk-trace-base';

import { CompositeSampler, ComposableTraceIDRatioBasedSampler } from '../src';
import { traceIdGenerator } from './util';
import { parseOtelTraceState } from '../src/tracestate';
import { INVALID_RANDOM_VALUE } from '../src/util';

describe('ComposableTraceIDRatioBasedSampler', () => {
  [
    { ratio: 1.0, thresholdStr: '0' },
    { ratio: 0.5, thresholdStr: '8' },
    { ratio: 0.25, thresholdStr: 'c' },
    { ratio: 1e-300, thresholdStr: 'max' },
    { ratio: 0, thresholdStr: 'max' },
  ].forEach(({ ratio, thresholdStr }) => {
    it(`should have a description for ratio ${ratio}`, () => {
      const sampler = new ComposableTraceIDRatioBasedSampler(ratio);
      assert.strictEqual(
        sampler.toString(),
        `ComposableTraceIDRatioBasedSampler(threshold=${thresholdStr}, ratio=${ratio})`
      );
    });
  });

  [
    { ratio: 1.0, threshold: 0n },
    { ratio: 0.5, threshold: 36028797018963968n },
    { ratio: 0.25, threshold: 54043195528445952n },
    { ratio: 0.125, threshold: 63050394783186944n },
    { ratio: 0.0, threshold: 72057594037927936n },
    { ratio: 0.45, threshold: 39631676720860364n },
    { ratio: 0.2, threshold: 57646075230342348n },
    { ratio: 0.13, threshold: 62690106812997304n },
    { ratio: 0.05, threshold: 68454714336031539n },
  ].forEach(({ ratio, threshold }) => {
    it(`should sample spans with ratio ${ratio}`, () => {
      const sampler = new CompositeSampler(
        new ComposableTraceIDRatioBasedSampler(ratio)
      );

      const generator = traceIdGenerator();
      let numSampled = 0;
      for (let i = 0; i < 10000; i++) {
        const result = sampler.shouldSample(
          context.active(),
          generator(),
          'span',
          SpanKind.SERVER,
          {},
          []
        );
        if (result.decision === SamplingDecision.RECORD_AND_SAMPLED) {
          numSampled++;
          const otTraceState = parseOtelTraceState(result.traceState);
          assert.strictEqual(otTraceState?.threshold, threshold);
          assert.strictEqual(otTraceState?.randomValue, INVALID_RANDOM_VALUE);
        }
      }
      const expectedNumSampled = 10000 * ratio;
      assert.ok(
        Math.abs(numSampled - expectedNumSampled) < 50,
        `expected ${expectedNumSampled}, have ${numSampled}`
      );
    });
  });
});
