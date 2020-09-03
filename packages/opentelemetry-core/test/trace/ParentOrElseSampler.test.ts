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
import * as api from '@opentelemetry/api';
import { AlwaysOnSampler } from '../../src/trace/sampler/AlwaysOnSampler';
import { ParentOrElseSampler } from '../../src/trace/sampler/ParentOrElseSampler';
import { TraceFlags, SpanKind } from '@opentelemetry/api';
import { AlwaysOffSampler } from '../../src/trace/sampler/AlwaysOffSampler';
import { ProbabilitySampler } from '../../src';

const traceId = 'd4cda95b652f4a1592b449d5929fda1b';
const spanId = '6e0c63257de34c92';
const spanName = 'foobar';

describe('ParentOrElseSampler', () => {
  it('should reflect sampler name with delegate sampler', () => {
    let sampler = new ParentOrElseSampler(new AlwaysOnSampler());
    assert.strictEqual(sampler.toString(), 'ParentOrElse{AlwaysOnSampler}');

    sampler = new ParentOrElseSampler(new AlwaysOnSampler());
    assert.strictEqual(sampler.toString(), 'ParentOrElse{AlwaysOnSampler}');

    sampler = new ParentOrElseSampler(new ProbabilitySampler(0.5));
    assert.strictEqual(
      sampler.toString(),
      'ParentOrElse{ProbabilitySampler{0.5}}'
    );
  });

  it('should return api.SamplingDecision.NOT_RECORD for not sampled parent while composited with AlwaysOnSampler', () => {
    const sampler = new ParentOrElseSampler(new AlwaysOnSampler());

    const spanContext = {
      traceId,
      spanId,
      traceFlags: TraceFlags.NONE,
    };
    assert.deepStrictEqual(
      sampler.shouldSample(
        spanContext,
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

  it('should return api.SamplingDecision.RECORD_AND_SAMPLED while composited with AlwaysOnSampler', () => {
    const sampler = new ParentOrElseSampler(new AlwaysOnSampler());

    assert.deepStrictEqual(
      sampler.shouldSample(
        undefined,
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
    const sampler = new ParentOrElseSampler(new AlwaysOffSampler());

    const spanContext = {
      traceId,
      spanId,
      traceFlags: TraceFlags.SAMPLED,
    };
    assert.deepStrictEqual(
      sampler.shouldSample(
        spanContext,
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

  it('should return api.SamplingDecision.RECORD_AND_SAMPLED while composited with AlwaysOffSampler', () => {
    const sampler = new ParentOrElseSampler(new AlwaysOffSampler());

    assert.deepStrictEqual(
      sampler.shouldSample(
        undefined,
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
