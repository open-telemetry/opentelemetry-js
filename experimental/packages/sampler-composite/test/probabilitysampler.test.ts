/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as assert from 'assert';

import type { DiagLogger, SpanContext } from '@opentelemetry/api';
import {
  context,
  diag,
  DiagLogLevel,
  SpanKind,
  TraceFlags,
  trace,
} from '@opentelemetry/api';
import { TraceState } from '@opentelemetry/core';
import type { Sampler } from '@opentelemetry/sdk-trace';
import { SamplingDecision } from '@opentelemetry/sdk-trace';

import {
  createCompositeSampler,
  createComposableProbabilitySampler,
  createProbabilitySampler,
} from '../src';
import { parseOtelTraceState } from '../src/tracestate';
import { traceIdGenerator } from './util';

const traceId = '00112233445566778800000000000000';
// The rightmost 56 bits are the randomness value; this one is all-ones, so it
// falls above every threshold below 1.0.
const highRandomnessTraceId = '001122334455667788ffffffffffffff';
const spanId = '0123456789abcdef';

/** The `random` flag from W3C Trace Context Level 2. */
const TRACE_FLAG_RANDOM = 0x2;

function sample(
  sampler: ReturnType<typeof createProbabilitySampler>,
  ctx = context.active(),
  id = traceId
) {
  return sampler.shouldSample(ctx, id, 'name', SpanKind.INTERNAL, {}, []);
}

function parentContext(traceFlags: number, ot?: string) {
  const spanContext: SpanContext = {
    traceId,
    spanId,
    traceFlags,
    traceState: ot ? new TraceState().set('ot', ot) : undefined,
  };
  return trace.setSpanContext(context.active(), spanContext);
}

describe('ProbabilitySampler', () => {
  [1.0, 0.5, 0.25, 0.001, 0].forEach(ratio => {
    it(`should have a description for ratio ${ratio}`, () => {
      assert.strictEqual(
        createProbabilitySampler(ratio).toString(),
        `ProbabilitySampler{${ratio}}`
      );
    });
  });

  [-0.1, 1.1].forEach(ratio => {
    it(`should reject the out-of-range ratio ${ratio}`, () => {
      assert.throws(
        () => createProbabilitySampler(ratio),
        /Invalid sampling probability/
      );
    });
  });

  it('should sample everything at ratio 1', () => {
    assert.strictEqual(
      sample(createProbabilitySampler(1.0)).decision,
      SamplingDecision.RECORD_AND_SAMPLED
    );
  });

  it('should sample nothing at ratio 0', () => {
    assert.strictEqual(
      sample(createProbabilitySampler(0)).decision,
      SamplingDecision.NOT_RECORD
    );
  });

  it('should record the threshold in the tracestate when sampled', () => {
    const result = sample(
      createProbabilitySampler(0.5),
      context.active(),
      highRandomnessTraceId
    );
    assert.strictEqual(result.decision, SamplingDecision.RECORD_AND_SAMPLED);
    assert.strictEqual(
      parseOtelTraceState(result.traceState).threshold,
      0x80000000000000n
    );
  });

  // The spec requires the parent SampledFlag to be ignored; ParentBased is the
  // documented way to respect it.
  it('should ignore an unsampled parent', () => {
    assert.strictEqual(
      sample(createProbabilitySampler(1.0), parentContext(TraceFlags.NONE))
        .decision,
      SamplingDecision.RECORD_AND_SAMPLED
    );
  });

  it('should ignore a sampled parent', () => {
    assert.strictEqual(
      sample(createProbabilitySampler(0), parentContext(TraceFlags.SAMPLED))
        .decision,
      SamplingDecision.NOT_RECORD
    );
  });

  it('should decide identically to the equivalent composite sampler', () => {
    const ratio = 0.25;
    const probability = createProbabilitySampler(ratio);
    const composite = createCompositeSampler(
      createComposableProbabilitySampler(ratio)
    );
    const nextTraceId = traceIdGenerator();

    let sampled = 0;
    for (let i = 0; i < 1000; i++) {
      const id = nextTraceId();
      const args: Parameters<Sampler['shouldSample']> = [
        context.active(),
        id,
        'name',
        SpanKind.INTERNAL,
        {},
        [],
      ];
      const actual = probability.shouldSample(...args);
      assert.strictEqual(
        actual.decision,
        composite.shouldSample(...args).decision,
        id
      );
      if (actual.decision === SamplingDecision.RECORD_AND_SAMPLED) {
        sampled++;
      }
    }
    // Guards against both samplers being trivially broken in the same way.
    assert.ok(
      sampled > 200 && sampled < 300,
      `sampled ${sampled} of 1000, want ~250`
    );
  });

  describe('compatibility warning', () => {
    let warnings: string[];

    beforeEach(() => {
      warnings = [];
      const logger = {
        warn: (message: string) => warnings.push(message),
        error: () => {},
        info: () => {},
        debug: () => {},
        verbose: () => {},
      } satisfies DiagLogger;
      diag.setLogger(logger, DiagLogLevel.WARN);
      // setLogger itself reports the change; drop anything logged before the test.
      warnings.length = 0;
    });

    afterEach(() => {
      diag.disable();
    });

    const presumed = () =>
      warnings.filter(w => w.includes('presuming TraceIDs are random'));

    it('should not warn for a root span', () => {
      sample(createProbabilitySampler(0.5));
      assert.deepStrictEqual(presumed(), []);
    });

    it('should not warn when the trace random flag is set', () => {
      const ctx = parentContext(TraceFlags.SAMPLED | TRACE_FLAG_RANDOM);
      sample(createProbabilitySampler(0.5), ctx);
      assert.deepStrictEqual(presumed(), []);
    });

    it('should not warn when an explicit random value is present', () => {
      const ctx = parentContext(TraceFlags.SAMPLED, 'rv:7f99aa40c02744');
      sample(createProbabilitySampler(0.5), ctx);
      assert.deepStrictEqual(presumed(), []);
    });

    it('should warn for a non-root span presuming trace ID randomness', () => {
      sample(createProbabilitySampler(0.5), parentContext(TraceFlags.SAMPLED));
      assert.strictEqual(presumed().length, 1);
      assert.match(presumed()[0], /W3C Trace Context Level 2/);
    });

    it('should warn at most once per sampler', () => {
      const sampler = createProbabilitySampler(0.5);
      const ctx = parentContext(TraceFlags.SAMPLED);
      for (let i = 0; i < 5; i++) {
        sample(sampler, ctx);
      }
      assert.strictEqual(presumed().length, 1);
    });
  });
});
