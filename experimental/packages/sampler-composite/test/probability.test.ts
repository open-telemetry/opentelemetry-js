/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as assert from 'assert';

import { context, SpanKind } from '@opentelemetry/api';
import { SamplingDecision } from '@opentelemetry/sdk-trace';

import {
  createCompositeSampler,
  createComposableProbabilitySampler,
} from '../src';
import { traceIdGenerator } from './util';
import { parseOtelTraceState } from '../src/tracestate';
import { INVALID_RANDOM_VALUE } from '../src/util';

describe('ComposableProbabilitySampler', () => {
  [
    { ratio: 1.0, thresholdStr: '0' },
    { ratio: 0.5, thresholdStr: '8' },
    { ratio: 0.25, thresholdStr: 'c' },
    { ratio: 0, thresholdStr: 'max' },
  ].forEach(({ ratio, thresholdStr }) => {
    it(`should have a description for ratio ${ratio}`, () => {
      const sampler = createComposableProbabilitySampler(ratio);
      assert.strictEqual(
        sampler.toString(),
        `ComposableProbabilitySampler(threshold=${thresholdStr}, ratio=${ratio})`
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
      const sampler = createCompositeSampler(
        createComposableProbabilitySampler(ratio)
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

  describe('ratio validation', () => {
    [-1, -0.0001, 1.0001, 2].forEach(ratio => {
      it(`should reject the out-of-range ratio ${ratio}`, () => {
        assert.throws(
          () => createComposableProbabilitySampler(ratio),
          /Invalid sampling probability/
        );
      });
    });

    // The spec's minimum valid nonzero sampling ratio is 2^-56; anything
    // smaller cannot be represented and would silently collapse to the same
    // behavior as ratio 0.
    [Math.pow(2, -57), Math.pow(2, -100), 1e-300].forEach(ratio => {
      it(`should reject the unrepresentable nonzero ratio ${ratio}`, () => {
        assert.throws(
          () => createComposableProbabilitySampler(ratio),
          /Invalid sampling probability/
        );
      });
    });

    it('should still allow ratio 0', () => {
      assert.doesNotThrow(() => createComposableProbabilitySampler(0));
    });

    it('should still allow the minimum representable nonzero ratio', () => {
      assert.doesNotThrow(() =>
        createComposableProbabilitySampler(Math.pow(2, -56))
      );
    });
  });
});
