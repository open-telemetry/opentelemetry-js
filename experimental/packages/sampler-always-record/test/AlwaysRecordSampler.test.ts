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

// Includes work from:
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as assert from 'assert';
import {
  Attributes,
  SpanKind,
  TraceState,
  context,
  createTraceState,
} from '@opentelemetry/api';
import {
  AlwaysOffSampler,
  RandomIdGenerator,
  Sampler,
  SamplingDecision,
  SamplingResult,
} from '@opentelemetry/sdk-trace-base';
import { AlwaysRecordSampler } from '../src';

let mockedSampler: Sampler;
let sampler: AlwaysRecordSampler;

describe('AlwaysRecordSamplerTest', () => {
  beforeEach(() => {
    mockedSampler = new AlwaysOffSampler();
    sampler = AlwaysRecordSampler.create(mockedSampler);
  });

  it('testGetDescription', () => {
    mockedSampler.toString = () => 'mockDescription';
    assert.strictEqual(
      sampler.toString(),
      'AlwaysRecordSampler{mockDescription}'
    );
  });

  it('testRecordAndSampleSamplingDecision', () => {
    validateShouldSample(
      SamplingDecision.RECORD_AND_SAMPLED,
      SamplingDecision.RECORD_AND_SAMPLED
    );
  });

  it('testRecordOnlySamplingDecision', () => {
    validateShouldSample(SamplingDecision.RECORD, SamplingDecision.RECORD);
  });

  it('testDropSamplingDecision', () => {
    validateShouldSample(SamplingDecision.NOT_RECORD, SamplingDecision.RECORD);
  });

  it('testCreateAlwaysRecordSamplerThrows', () => {
    assert.throws(() => AlwaysRecordSampler.create(null as unknown as Sampler));
    assert.throws(() =>
      AlwaysRecordSampler.create(undefined as unknown as Sampler)
    );
  });
});

function validateShouldSample(
  rootDecision: SamplingDecision,
  expectedDecision: SamplingDecision
): void {
  const rootResult: SamplingResult = buildRootSamplingResult(rootDecision);
  mockedSampler.shouldSample = () => {
    return rootResult;
  };

  const actualResult: SamplingResult = sampler.shouldSample(
    context.active(),
    new RandomIdGenerator().generateTraceId(),
    'spanName',
    SpanKind.CLIENT,
    {},
    []
  );

  if (rootDecision === expectedDecision) {
    assert.strictEqual(actualResult, rootResult);
    assert.strictEqual(actualResult.decision, rootDecision);
  } else {
    assert.notEqual(actualResult, rootResult);
    assert.strictEqual(actualResult.decision, expectedDecision);
  }

  assert.strictEqual(actualResult.attributes, rootResult.attributes);
  assert.strictEqual(actualResult.traceState, rootResult.traceState);
}

function buildRootSamplingResult(
  samplingDecision: SamplingDecision
): SamplingResult {
  const samplingAttr: Attributes = { key: SamplingDecision[samplingDecision] };
  const samplingTraceState: TraceState = createTraceState();
  samplingTraceState.set('key', SamplingDecision[samplingDecision]);
  const samplingResult: SamplingResult = {
    decision: samplingDecision,
    attributes: samplingAttr,
    traceState: samplingTraceState,
  };
  return samplingResult;
}
