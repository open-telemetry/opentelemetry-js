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

import { AlwaysOffSampler, AlwaysOnSampler, SamplingDecision } from '../../../../packages/opentelemetry-sdk-trace-base/src';
import { JaegerRemoteSampler } from '../src';
import * as sinon from 'sinon';
import * as assert from 'assert';
import { Context, SpanKind } from '@opentelemetry/api';
import { SamplingStrategyResponse, StrategyType } from '../src/types';

describe('JaegerRemoteSampler', () => {

  const endpoint = 'http://localhost:5778';
  const serviceName = 'foo';
  const alwaysOnSampler = new AlwaysOnSampler();
  const alwaysOffSampler = new AlwaysOffSampler();
  const numberOfIterations = Math.floor(Math.random() + 1  * 100);
  const poolingInterval = Math.floor(Math.random() + 1 * 5) * 1000;

  const shouldSampleContext = {
    getValue: function (key: symbol): unknown {
      throw new Error('Function not implemented.');
    },
    setValue: function (key: symbol, value: unknown): Context {
      throw new Error('Function not implemented.');
    },
    deleteValue: function (key: symbol): Context {
      throw new Error('Function not implemented.');
    }
  };

  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers(Date.now());
  });

  afterEach(() => {
    clock.restore();
  });

  describe('constructor', () => {
    let getAndUpdateSamplerStub: sinon.SinonStub;

    before(() => {
      getAndUpdateSamplerStub = sinon.stub(JaegerRemoteSampler.prototype, 'getAndUpdateSampler').resolves();
    });

    after(() => {
      getAndUpdateSamplerStub.restore();
    });
  
    it('Test Sampler to run at fixed poolingInterval', async () => {
      console.log(`numberOfIterations: ${numberOfIterations}`);
      console.log(`poolingInterval: ${poolingInterval}`);
      new JaegerRemoteSampler({
        endpoint,
        serviceName,
        poolingInterval,
        initialSampler: alwaysOnSampler,
      });
      await clock.tickAsync(poolingInterval*numberOfIterations);
      sinon.assert.callCount(getAndUpdateSamplerStub, numberOfIterations);
    });
  });

  describe('shouldSample', () => {
    let samplerStubInstance: sinon.SinonStubbedInstance<AlwaysOnSampler>;

    before(() => {
      samplerStubInstance = sinon.createStubInstance(AlwaysOnSampler);
      samplerStubInstance.shouldSample.returns({
        decision: SamplingDecision.RECORD
      })
    });

    it('Should return SamplingDecision.RECORD decision provided by the current sampler set in it.', async () => {
      const jaegerRemoteSampler = new JaegerRemoteSampler({
        endpoint,
        serviceName,
        poolingInterval,
        initialSampler: samplerStubInstance,
      });

      assert.equal(jaegerRemoteSampler.shouldSample(shouldSampleContext, "", "", SpanKind.CLIENT, {}, []).decision, SamplingDecision.RECORD);
    });
  });

  describe('getAndUpdateSampler', () => {
    let getSamplerConfigStub: sinon.SinonStub;
    let convertSamplingResponseToSamplerStub: sinon.SinonStub;

    const sampleSamplingStrategyResponse : SamplingStrategyResponse = {
      strategyType: StrategyType.PROBABILISTIC,
      probabilisticSampling: {
        samplingRate: 0
      },
      operationSampling: {
        defaultSamplingProbability: 0,
        defaultLowerBoundTracesPerSecond: 0,
        perOperationStrategies: [],
        defaultUpperBoundTracesPerSecond: 0
      }
    };

    beforeEach(() => {
      getSamplerConfigStub = sinon.stub(JaegerRemoteSampler.prototype, 'getSamplerConfig').resolves(sampleSamplingStrategyResponse);
      convertSamplingResponseToSamplerStub = sinon.stub(JaegerRemoteSampler.prototype, 'convertSamplingResponseToSampler').resolves(alwaysOffSampler);
    });

    afterEach(() => {
      getSamplerConfigStub.restore();
      convertSamplingResponseToSamplerStub.restore();
    });

    it('getSamplerConfig is called with service name set in the constructor.', async () => {
      new JaegerRemoteSampler({
        endpoint,
        serviceName,
        poolingInterval,
        initialSampler: alwaysOnSampler,
      });
      await clock.tickAsync(poolingInterval);
      sinon.assert.calledWithExactly(getSamplerConfigStub, serviceName);
    });

    it('convertSamplingResponseToSampler is passed config provided by getSamplerConfig.', async () => {
      new JaegerRemoteSampler({
        endpoint,
        serviceName,
        poolingInterval,
        initialSampler: alwaysOnSampler,
      });
      await clock.tickAsync(poolingInterval);
      sinon.assert.calledWithExactly(convertSamplingResponseToSamplerStub, sampleSamplingStrategyResponse);
    });

    it('internal sampler is set to sampler returned by convertSamplingResponseToSampler.', async () => {
      const jaegerRemoteSampler = new JaegerRemoteSampler({
        endpoint,
        serviceName,
        poolingInterval,
        initialSampler: alwaysOnSampler,
      });
      await clock.tickAsync(poolingInterval);
      assert.equal(await jaegerRemoteSampler.getCurrentSampler(), alwaysOffSampler);
    });
  });

  // describe('convertSamplingResponseToSampler', () => {
  //   let getSamplerConfigStub: sinon.SinonStub;

  //   const sampleSamplingStrategyResponse : SamplingStrategyResponse = {
  //     strategyType: StrategyType.PROBABILISTIC,
  //     probabilisticSampling: {
  //       samplingRate: 0
  //     },
  //     operationSampling: {
  //       defaultSamplingProbability: 0,
  //       defaultLowerBoundTracesPerSecond: 0,
  //       perOperationStrategies: [],
  //       defaultUpperBoundTracesPerSecond: 0
  //     }
  //   };

  //   beforeEach(() => {
  //     getSamplerConfigStub = sinon.stub(JaegerRemoteSampler.prototype, 'getSamplerConfig').resolves(sampleSamplingStrategyResponse);
  //   });

  //   afterEach(() => {
  //     getSamplerConfigStub.restore();
  //   });

  //   it('enter perOperationStrategy flow if per operation strategies exist.', async () => {
  //     new JaegerRemoteSampler({
  //       endpoint,
  //       serviceName,
  //       poolingInterval,
  //       initialSampler: alwaysOnSampler,
  //     });
  //     await clock.tickAsync(poolingInterval);
  //     sinon.assert.calledWithExactly(getSamplerConfigStub, serviceName);
  //   });

  //   describe('perOperationStrategy', () => {

  //   beforeEach(() => {
  //   });

  //   afterEach(() => {
  //   });

  //   it('getSamplerConfig is called with service name set in the constructor.', async () => {
  //     // new JaegerRemoteSampler({
  //     //   endpoint,
  //     //   serviceName,
  //     //   poolingInterval,
  //     //   initialSampler: alwaysOnSampler,
  //     // });
  //     // await clock.tickAsync(poolingInterval);
  //     // sinon.assert.calledWithExactly(getSamplerConfigStub, serviceName);
  //   });

  //   });
  //   describe('defaultStrategy', () => {

  //     beforeEach(() => {
  //     });
  
  //     afterEach(() => {
  //     });
  
  //     it('getSamplerConfig is called with service name set in the constructor.', async () => {
  //       // new JaegerRemoteSampler({
  //       //   endpoint,
  //       //   serviceName,
  //       //   poolingInterval,
  //       //   initialSampler: alwaysOnSampler,
  //       // });
  //       // await clock.tickAsync(poolingInterval);
  //       // sinon.assert.calledWithExactly(getSamplerConfigStub, serviceName);
  //     });
  
  //     });
  //   });
});
