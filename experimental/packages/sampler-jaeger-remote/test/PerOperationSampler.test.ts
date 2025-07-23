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
import {
  AlwaysOnSampler,
  SamplingDecision,
} from '@opentelemetry/sdk-trace-base';
import { PerOperationSampler } from '../src/PerOperationSampler';
import * as sinon from 'sinon';
import * as api from '@opentelemetry/api';

describe('PerOPerationSampler', () => {
  describe('shouldSample', () => {
    let samplerStubInstance1: sinon.SinonStubbedInstance<AlwaysOnSampler>;

    beforeEach(() => {
      samplerStubInstance1 = sinon.createStubInstance(AlwaysOnSampler);
      samplerStubInstance1.shouldSample.returns({
        decision: SamplingDecision.RECORD,
      });
    });

    it('Should return samplingDecision decision provided by default sampler.', async () => {
      const perOperationSampler = new PerOperationSampler({
        defaultSampler: samplerStubInstance1,
        perOperationStrategies: [],
      });

      perOperationSampler.shouldSample(
        api.ROOT_CONTEXT,
        '',
        '',
        api.SpanKind.CLIENT,
        {},
        []
      );
      sinon.assert.callCount(samplerStubInstance1.shouldSample, 1);
    });
  });
});
