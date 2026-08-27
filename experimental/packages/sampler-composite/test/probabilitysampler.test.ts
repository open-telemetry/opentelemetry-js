/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as assert from 'assert';

import type { DiagLogger, SpanContext } from '@opentelemetry/api';
import {
  context,
  defaultTextMapGetter,
  diag,
  DiagLogLevel,
  SpanKind,
  TraceFlags,
  trace,
} from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { TraceState, W3CTraceContextPropagator } from '@opentelemetry/core';
import {
  ParentBasedSampler,
  SamplingDecision,
  TracerProvider,
} from '@opentelemetry/sdk-trace';

import { createProbabilitySampler } from '../src';
import { parseOtelTraceState } from '../src/tracestate';

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

  describe('compatibility warning (through a real TracerProvider)', () => {
    // The unit tests above hand-build a `SpanContext` to reach every branch
    // of the warning logic directly. `Tracer.startSpan()` only ever passes
    // through the *incoming* context (from context propagation) unmodified,
    // but always rebuilds the *new* span's own `traceFlags` down to just
    // `SAMPLED`/`NONE`, so a locally created span can never itself carry the
    // random flag. That means the "random flag set" / "explicit rv" cases
    // are only reachable in practice via a remote parent extracted from real
    // W3C headers -- this exercises that path end to end, propagator
    // extraction included, instead of a synthetic SpanContext.
    let warnings: string[];
    const propagator = new W3CTraceContextPropagator();
    const remoteTraceId = '00112233445566778899aabbccddeeff';
    const presumed = () =>
      warnings.filter(w => w.includes('presuming TraceIDs are random'));

    function extractRemoteContext(traceparent: string, tracestate?: string) {
      const carrier: Record<string, string> = { traceparent };
      if (tracestate) carrier.tracestate = tracestate;
      return propagator.extract(
        context.active(),
        carrier,
        defaultTextMapGetter
      );
    }

    beforeEach(() => {
      context.setGlobalContextManager(new AsyncLocalStorageContextManager());
      warnings = [];
      const logger = {
        warn: (message: string) => warnings.push(message),
        error: () => {},
        info: () => {},
        debug: () => {},
        verbose: () => {},
      } satisfies DiagLogger;
      diag.setLogger(logger, DiagLogLevel.WARN);
      warnings.length = 0;
    });

    afterEach(() => {
      diag.disable();
      context.disable();
    });

    it('should not warn for a local root span', () => {
      const provider = new TracerProvider({
        sampler: createProbabilitySampler(0.5),
        spanProcessors: [],
      });
      const span = provider.getTracer('test').startSpan('root');
      assert.deepStrictEqual(presumed(), []);
      // The new span's own flags never carry the random bit, confirming it
      // can only ever be observed by way of an extracted remote parent.
      assert.strictEqual(span.spanContext().traceFlags & TRACE_FLAG_RANDOM, 0);
    });

    it('should not warn for a remote parent with the random flag set', () => {
      const provider = new TracerProvider({
        sampler: createProbabilitySampler(0.5),
        spanProcessors: [],
      });
      const parentCtx = extractRemoteContext(
        `00-${remoteTraceId}-0123456789abcdef-02`
      );
      context.with(parentCtx, () =>
        provider.getTracer('test').startSpan('child')
      );
      assert.deepStrictEqual(presumed(), []);
    });

    it('should not warn for a remote parent with an explicit rv', () => {
      const provider = new TracerProvider({
        sampler: createProbabilitySampler(0.5),
        spanProcessors: [],
      });
      const parentCtx = extractRemoteContext(
        `00-${remoteTraceId}-0123456789abcdef-00`,
        'ot=rv:7f99aa40c02744'
      );
      context.with(parentCtx, () =>
        provider.getTracer('test').startSpan('child')
      );
      assert.deepStrictEqual(presumed(), []);
    });

    it('should warn for an old-style remote parent with no rv', () => {
      const provider = new TracerProvider({
        sampler: createProbabilitySampler(0.5),
        spanProcessors: [],
      });
      const parentCtx = extractRemoteContext(
        `00-${remoteTraceId}-0123456789abcdef-01`
      );
      context.with(parentCtx, () =>
        provider.getTracer('test').startSpan('child')
      );
      assert.strictEqual(presumed().length, 1);
    });

    it('should warn for a remote parent with a malformed rv', () => {
      const provider = new TracerProvider({
        sampler: createProbabilitySampler(0.5),
        spanProcessors: [],
      });
      const parentCtx = extractRemoteContext(
        `00-${remoteTraceId}-0123456789abcdef-00`,
        'ot=rv:zz' // not valid hex; falls back to unconfirmed
      );
      context.with(parentCtx, () =>
        provider.getTracer('test').startSpan('child')
      );
      assert.strictEqual(presumed().length, 1);
    });

    it('should not warn when rv is present alongside other tracestate vendors', () => {
      const provider = new TracerProvider({
        sampler: createProbabilitySampler(0.5),
        spanProcessors: [],
      });
      const parentCtx = extractRemoteContext(
        `00-${remoteTraceId}-0123456789abcdef-00`,
        'congo=t61rcWkgMzE,ot=rv:7f99aa40c02744,rojo=00f067aa0ba902b7'
      );
      context.with(parentCtx, () =>
        provider.getTracer('test').startSpan('child')
      );
      assert.deepStrictEqual(presumed(), []);
    });

    it('should warn for a local child of a local root using the trace-ID fallback', () => {
      // The root correctly doesn't warn (nothing upstream to distrust), but it
      // also doesn't have an explicit `rv` to hand down -- it sampled using the
      // trace-ID fallback. A local child inherits that same unconfirmed trace
      // ID, so it re-presumes randomness and warns once, on the child.
      const provider = new TracerProvider({
        sampler: createProbabilitySampler(0.5),
        spanProcessors: [],
      });
      const tracer = provider.getTracer('test');
      const root = tracer.startSpan('root');
      assert.deepStrictEqual(presumed(), []);

      context.with(trace.setSpan(context.active(), root), () =>
        tracer.startSpan('child')
      );
      assert.strictEqual(presumed().length, 1);
    });

    it('known limitation: confirmed randomness does not survive a second hop', () => {
      // Service A receives a remote parent with the random flag confirmed.
      // Tracer.startSpan() always rebuilds a new span's own traceFlags down to
      // SAMPLED/NONE (see Tracer.ts), and the spec only permits -- it does not
      // require -- a *root* sampler to write an explicit `rv` into tracestate
      // (https://opentelemetry.io/docs/specs/otel/trace/sdk/#probabilitysampler-sampler-configuration).
      // ProbabilitySampler doesn't do this, so once the flag is gone, a second
      // hop (service B, receiving A's outgoing header) has no way to confirm
      // randomness and warns again, even though the trace genuinely started
      // with confirmed randomness. This test documents that current, spec-
      // compliant behavior rather than asserting it's ideal.
      const providerA = new TracerProvider({
        sampler: createProbabilitySampler(0.5),
        spanProcessors: [],
      });
      const tracerA = providerA.getTracer('serviceA');
      const incomingToA = extractRemoteContext(
        `00-${remoteTraceId}-0123456789abcdef-02`
      );

      const outgoingCarrier: Record<string, string> = {};
      context.with(incomingToA, () => {
        const spanA = tracerA.startSpan('handle-request');
        assert.deepStrictEqual(presumed(), []);
        propagator.inject(
          trace.setSpan(context.active(), spanA),
          outgoingCarrier,
          {
            set: (carrier, key, value) => {
              carrier[key] = value;
            },
          }
        );
      });

      warnings.length = 0;
      const providerB = new TracerProvider({
        sampler: createProbabilitySampler(0.5),
        spanProcessors: [],
      });
      const incomingToB = propagator.extract(
        context.active(),
        outgoingCarrier,
        defaultTextMapGetter
      );
      context.with(incomingToB, () =>
        providerB.getTracer('serviceB').startSpan('handle-in-b')
      );
      assert.strictEqual(presumed().length, 1);
    });

    it('should warn independently per sampler instance, not globally', () => {
      const samplerX = createProbabilitySampler(0.5);
      const samplerY = createProbabilitySampler(0.5);
      const providerX = new TracerProvider({
        sampler: samplerX,
        spanProcessors: [],
      });
      const providerY = new TracerProvider({
        sampler: samplerY,
        spanProcessors: [],
      });
      const oldStyleCtx = extractRemoteContext(
        `00-${remoteTraceId}-0123456789abcdef-01`
      );

      context.with(oldStyleCtx, () =>
        providerX.getTracer('x').startSpan('spanX1')
      );
      assert.strictEqual(presumed().length, 1);

      // Same instance, same unconfirmed parent again: still just the one warning.
      context.with(oldStyleCtx, () =>
        providerX.getTracer('x').startSpan('spanX2')
      );
      assert.strictEqual(presumed().length, 1);

      // A different sampler instance hasn't warned yet, so it warns on its own.
      context.with(oldStyleCtx, () =>
        providerY.getTracer('y').startSpan('spanY1')
      );
      assert.strictEqual(presumed().length, 2);
    });

    it('should not warn when `root: true` overrides an unconfirmed active parent', () => {
      // `Tracer.startSpan()` strips the parent from context before invoking the
      // sampler when `root: true` is passed, so this should behave exactly
      // like the no-parent case regardless of what the active parent was.
      const provider = new TracerProvider({
        sampler: createProbabilitySampler(0.5),
        spanProcessors: [],
      });
      const oldStyleCtx = extractRemoteContext(
        `00-${remoteTraceId}-0123456789abcdef-01`
      );
      context.with(oldStyleCtx, () =>
        provider.getTracer('test').startSpan('forced-root', { root: true })
      );
      assert.deepStrictEqual(presumed(), []);
    });

    it('should sample correctly and never warn when composed as the root of a ParentBasedSampler', () => {
      // createProbabilitySampler()'s own doc comment recommends wrapping it in
      // ParentBasedSampler to respect the parent SampledFlag (this sampler
      // ignores it on its own). ParentBasedSampler only ever delegates to the
      // wrapped `root` sampler when there is no parent at all -- a sampled or
      // unsampled remote parent is handled by ParentBasedSampler's own
      // defaults and never reaches ProbabilitySampler.
      const provider = new TracerProvider({
        sampler: new ParentBasedSampler({
          root: createProbabilitySampler(0.5),
        }),
        spanProcessors: [],
      });
      const tracer = provider.getTracer('test');

      let sampled = 0;
      const N = 2000;
      for (let i = 0; i < N; i++) {
        const span = tracer.startSpan(`root${i}`);
        if ((span.spanContext().traceFlags & TraceFlags.SAMPLED) !== 0) {
          sampled++;
        }
      }
      assert.ok(
        Math.abs(sampled / N - 0.5) < 0.05,
        `sampled ${sampled} of ${N}, want ~${N / 2}`
      );
      assert.deepStrictEqual(presumed(), []);

      // A sampled remote parent is respected as-is, bypassing ProbabilitySampler.
      const sampledParentCtx = extractRemoteContext(
        `00-${remoteTraceId}-0123456789abcdef-01`
      );
      let child: ReturnType<typeof tracer.startSpan> | undefined;
      context.with(sampledParentCtx, () => {
        child = tracer.startSpan('child-of-sampled-parent');
      });
      assert.strictEqual(
        (child!.spanContext().traceFlags & TraceFlags.SAMPLED) !== 0,
        true
      );
      assert.deepStrictEqual(presumed(), []);
    });
  });
});
