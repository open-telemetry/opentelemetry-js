/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as assert from 'assert';
import * as api from '@opentelemetry/api';
import { TraceFlags, SpanKind, trace } from '@opentelemetry/api';
import {
  AlwaysOnSampler,
  ParentBasedSampler,
  AlwaysOffSampler,
  TraceIdRatioBasedSampler,
} from '../../../src';

const traceId = 'd4cda95b652f4a1592b449d5929fda1b';
const spanId = '6e0c63257de34c92';
const spanName = 'foobar';

describe('ParentBasedSampler', () => {
  it('should reflect sampler name with delegate sampler', () => {
    let sampler = new ParentBasedSampler({ root: new AlwaysOnSampler() });
    assert.strictEqual(
      sampler.toString(),
      'ParentBased{root=AlwaysOnSampler, remoteParentSampled=AlwaysOnSampler, remoteParentNotSampled=AlwaysOffSampler, localParentSampled=AlwaysOnSampler, localParentNotSampled=AlwaysOffSampler}'
    );

    sampler = new ParentBasedSampler({ root: new AlwaysOffSampler() });
    assert.strictEqual(
      sampler.toString(),
      'ParentBased{root=AlwaysOffSampler, remoteParentSampled=AlwaysOnSampler, remoteParentNotSampled=AlwaysOffSampler, localParentSampled=AlwaysOnSampler, localParentNotSampled=AlwaysOffSampler}'
    );

    sampler = new ParentBasedSampler({
      root: new TraceIdRatioBasedSampler(0.5),
    });
    assert.strictEqual(
      sampler.toString(),
      'ParentBased{root=TraceIdRatioBased{0.5}, remoteParentSampled=AlwaysOnSampler, remoteParentNotSampled=AlwaysOffSampler, localParentSampled=AlwaysOnSampler, localParentNotSampled=AlwaysOffSampler}'
    );
  });

  it('should return api.SamplingDecision.NOT_RECORD for not sampled parent while composited with AlwaysOnSampler', () => {
    const sampler = new ParentBasedSampler({ root: new AlwaysOnSampler() });

    const spanContext = {
      traceId,
      spanId,
      traceFlags: TraceFlags.NONE,
    };
    assert.deepStrictEqual(
      sampler.shouldSample(
        trace.setSpanContext(api.ROOT_CONTEXT, spanContext),
        traceId,
        spanName,
        SpanKind.CLIENT,
        {},
        []
      ),
      {
        decision: api.SamplingDecision.NOT_RECORD,
      }
    );
  });

  it('should return api.SamplingDecision.RECORD_AND_SAMPLED for invalid parent spanContext while composited with AlwaysOnSampler', () => {
    const sampler = new ParentBasedSampler({ root: new AlwaysOnSampler() });

    assert.deepStrictEqual(
      sampler.shouldSample(
        trace.setSpanContext(api.ROOT_CONTEXT, api.INVALID_SPAN_CONTEXT),
        traceId,
        spanName,
        SpanKind.CLIENT,
        {},
        []
      ),
      {
        decision: api.SamplingDecision.RECORD_AND_SAMPLED,
      }
    );
  });

  it('should return api.SamplingDecision.RECORD_AND_SAMPLED while composited with AlwaysOnSampler', () => {
    const sampler = new ParentBasedSampler({ root: new AlwaysOnSampler() });

    assert.deepStrictEqual(
      sampler.shouldSample(
        api.ROOT_CONTEXT,
        traceId,
        spanName,
        SpanKind.CLIENT,
        {},
        []
      ),
      {
        decision: api.SamplingDecision.RECORD_AND_SAMPLED,
      }
    );
  });

  it('should return api.SamplingDecision.RECORD_AND_SAMPLED for sampled parent while composited with AlwaysOffSampler', () => {
    const sampler = new ParentBasedSampler({ root: new AlwaysOffSampler() });

    const spanContext = {
      traceId,
      spanId,
      traceFlags: TraceFlags.SAMPLED,
    };
    assert.deepStrictEqual(
      sampler.shouldSample(
        trace.setSpanContext(api.ROOT_CONTEXT, spanContext),
        traceId,
        spanName,
        SpanKind.CLIENT,
        {},
        []
      ),
      {
        decision: api.SamplingDecision.RECORD_AND_SAMPLED,
      }
    );
  });

  it('should return api.SamplingDecision.NOT_RECORD for invalid parent spanContext while composited with AlwaysOffSampler', () => {
    const sampler = new ParentBasedSampler({ root: new AlwaysOffSampler() });

    assert.deepStrictEqual(
      sampler.shouldSample(
        trace.setSpanContext(api.ROOT_CONTEXT, api.INVALID_SPAN_CONTEXT),
        traceId,
        spanName,
        SpanKind.CLIENT,
        {},
        []
      ),
      {
        decision: api.SamplingDecision.NOT_RECORD,
      }
    );
  });

  it('should return api.SamplingDecision.RECORD_AND_SAMPLED while composited with AlwaysOffSampler', () => {
    const sampler = new ParentBasedSampler({ root: new AlwaysOffSampler() });

    assert.deepStrictEqual(
      sampler.shouldSample(
        api.ROOT_CONTEXT,
        traceId,
        spanName,
        SpanKind.CLIENT,
        {},
        []
      ),
      {
        decision: api.SamplingDecision.NOT_RECORD,
      }
    );
  });
});
