/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AlwaysOffSampler,
  AlwaysOnSampler,
  ParentBasedSampler,
  SamplingDecision,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';
import * as api from '@opentelemetry/api';
import { JaegerRemoteSampler } from '../src';
import * as sinon from 'sinon';
import * as assert from 'assert';
import { SpanKind } from '@opentelemetry/api';
import { SamplingStrategyResponse, StrategyType } from '../src/types';
import { PerOperationSampler } from '../src/PerOperationSampler';
import { randomSamplingProability } from './utils';
import * as axios from 'axios';

describe('JaegerRemoteSampler', () => {
  const endpoint = 'http://localhost:5778';
  const serviceName = 'foo';
  const alwaysOnSampler = new AlwaysOnSampler();
  const alwaysOffSampler = new AlwaysOffSampler();
  const numberOfIterations = Math.floor((Math.random() + 0.01) * 100);
  const poolingInterval = Math.floor((Math.random() + 0.01) * 5 * 1000);

  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers(Date.now());
  });

  afterEach(() => {
    clock.restore();
  });

  describe('constructor', () => {
    let getAndUpdateSamplerStub: sinon.SinonStub;

    beforeEach(() => {
      getAndUpdateSamplerStub = sinon
        .stub(JaegerRemoteSampler.prototype, 'getAndUpdateSampler' as any)
        .resolves();
    });

    afterEach(() => {
      getAndUpdateSamplerStub.restore();
    });

    it('Test Sampler to run at fixed poolingInterval', async () => {
      new JaegerRemoteSampler({
        endpoint,
        serviceName,
        poolingInterval,
        initialSampler: alwaysOnSampler,
      });
      await clock.tickAsync(poolingInterval * numberOfIterations);
      sinon.assert.callCount(getAndUpdateSamplerStub, numberOfIterations);
    });

    it('Dont try to sync if already syncing.', async () => {
      getAndUpdateSamplerStub.callsFake(
        async () =>
          new Promise(resolve => setTimeout(resolve, poolingInterval + 1000))
      );
      new JaegerRemoteSampler({
        endpoint,
        poolingInterval,
        serviceName,
        initialSampler: alwaysOnSampler,
      });
      await clock.tickAsync(poolingInterval * 2);
      sinon.assert.callCount(getAndUpdateSamplerStub, 1);
    });

    it('Doesnt throw unhandled promise rejection when failing to get remote config', async () => {
      getAndUpdateSamplerStub.rejects();
      const unhandledRejectionListener = sinon.fake();
      process.once('unhandledRejection', unhandledRejectionListener);
      new JaegerRemoteSampler({
        endpoint,
        serviceName,
        poolingInterval,
        initialSampler: alwaysOnSampler,
      });
      await clock.tickAsync(poolingInterval * 2);
      sinon.assert.callCount(getAndUpdateSamplerStub, 2);
      sinon.assert.callCount(unhandledRejectionListener, 0);
    });
  });

  describe('shouldSample', () => {
    let samplerStubInstance: sinon.SinonStubbedInstance<AlwaysOnSampler>;

    beforeEach(() => {
      samplerStubInstance = sinon.createStubInstance(AlwaysOnSampler);
      samplerStubInstance.shouldSample.returns({
        decision: SamplingDecision.RECORD,
      });
    });

    it('Should return SamplingDecision.RECORD decision provided by the current sampler set in it.', async () => {
      const jaegerRemoteSampler = new JaegerRemoteSampler({
        endpoint,
        serviceName,
        poolingInterval,
        initialSampler: samplerStubInstance,
      });

      assert.equal(
        jaegerRemoteSampler.shouldSample(
          api.ROOT_CONTEXT,
          '',
          '',
          SpanKind.CLIENT,
          {},
          []
        ).decision,
        SamplingDecision.RECORD
      );
    });
  });

  describe('getAndUpdateSampler', () => {
    let getSamplerConfigStub: sinon.SinonStub;
    let convertSamplingResponseToSamplerStub: sinon.SinonStub;

    const sampleSamplingStrategyResponse: SamplingStrategyResponse = {
      strategyType: StrategyType.PROBABILISTIC,
      probabilisticSampling: {
        samplingRate: 0,
      },
      operationSampling: {
        defaultSamplingProbability: 0,
        defaultLowerBoundTracesPerSecond: 0,
        perOperationStrategies: [],
        defaultUpperBoundTracesPerSecond: 0,
      },
    };

    beforeEach(() => {
      getSamplerConfigStub = sinon
        .stub(JaegerRemoteSampler.prototype, 'getSamplerConfig' as any)
        .resolves(sampleSamplingStrategyResponse);
      convertSamplingResponseToSamplerStub = sinon
        .stub(
          JaegerRemoteSampler.prototype,
          'convertSamplingResponseToSampler' as any
        )
        .resolves(alwaysOffSampler);
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
      sinon.assert.calledWithExactly(
        convertSamplingResponseToSamplerStub,
        sampleSamplingStrategyResponse
      );
    });

    it('internal sampler is set to sampler returned by convertSamplingResponseToSampler.', async () => {
      const jaegerRemoteSampler = new JaegerRemoteSampler({
        endpoint,
        serviceName,
        poolingInterval,
        initialSampler: alwaysOnSampler,
      });
      await clock.tickAsync(poolingInterval);
      assert.equal(jaegerRemoteSampler['_sampler'], alwaysOffSampler);
    });
  });

  describe('convertSamplingResponseToSampler', () => {
    let getSamplerConfigStub: sinon.SinonStub;

    beforeEach(() => {
      getSamplerConfigStub = sinon.stub(
        JaegerRemoteSampler.prototype,
        'getSamplerConfig' as any
      );
    });

    afterEach(() => {
      getSamplerConfigStub.restore();
    });

    describe('defaultStrategy', () => {
      it('Use root level samplingRate when operationSampling object is null.', async () => {
        const samplingRate = randomSamplingProability();

        const samplingStrategyResponseWithoutPerOperationStrategies: SamplingStrategyResponse =
          {
            strategyType: StrategyType.PROBABILISTIC,
            probabilisticSampling: {
              samplingRate,
            },
          };

        getSamplerConfigStub.resolves(
          samplingStrategyResponseWithoutPerOperationStrategies
        );

        const jaegerRemoteSampler = new JaegerRemoteSampler({
          endpoint,
          serviceName,
          poolingInterval,
          initialSampler: alwaysOnSampler,
        });
        await clock.tickAsync(poolingInterval);
        const jaegerCurrentSampler = jaegerRemoteSampler['_sampler'];
        assert.equal(jaegerCurrentSampler instanceof ParentBasedSampler, true);
        const parentBasedRootSampler = (
          jaegerCurrentSampler as ParentBasedSampler
        )['_root'];
        assert.equal(
          parentBasedRootSampler instanceof TraceIdRatioBasedSampler,
          true
        );
        const internalTraceIdRatioBasedSamplerRatio = (
          parentBasedRootSampler as TraceIdRatioBasedSampler
        )['_ratio'];
        assert.equal(internalTraceIdRatioBasedSamplerRatio, samplingRate);
      });

      it('Use root level samplingRate perOperation Strategies is a empty array.', async () => {
        const samplingRate = randomSamplingProability();

        const samplingStrategyResponseWithoutPerOperationStrategies: SamplingStrategyResponse =
          {
            strategyType: StrategyType.PROBABILISTIC,
            probabilisticSampling: {
              samplingRate,
            },
            operationSampling: {
              defaultSamplingProbability: 1.5,
              defaultLowerBoundTracesPerSecond: 1.6,
              perOperationStrategies: [],
              defaultUpperBoundTracesPerSecond: 18,
            },
          };

        getSamplerConfigStub.resolves(
          samplingStrategyResponseWithoutPerOperationStrategies
        );

        const jaegerRemoteSampler = new JaegerRemoteSampler({
          endpoint,
          serviceName,
          poolingInterval,
          initialSampler: alwaysOnSampler,
        });
        await clock.tickAsync(poolingInterval);
        const jaegerCurrentSampler = jaegerRemoteSampler['_sampler'];
        assert.equal(jaegerCurrentSampler instanceof ParentBasedSampler, true);
        const parentBasedRootSampler = (
          jaegerCurrentSampler as ParentBasedSampler
        )['_root'];
        assert.equal(
          parentBasedRootSampler instanceof TraceIdRatioBasedSampler,
          true
        );
        const internalTraceIdRatioBasedSamplerRatio = (
          parentBasedRootSampler as TraceIdRatioBasedSampler
        )['_ratio'];
        assert.equal(internalTraceIdRatioBasedSamplerRatio, samplingRate);
      });
    });

    describe('perOperationStrategy', () => {
      const defaultSamplingProbability = randomSamplingProability();
      const op1SamplingRate = randomSamplingProability();
      const op2SamplingRate = randomSamplingProability();
      const op1 = 'op1';
      const op2 = 'op2';

      const samplingStrategyResponseWithPerOperationStrategies: SamplingStrategyResponse =
        {
          strategyType: StrategyType.PROBABILISTIC,
          probabilisticSampling: {
            samplingRate: 1.5,
          },
          operationSampling: {
            defaultSamplingProbability,
            defaultLowerBoundTracesPerSecond: 1.6,
            perOperationStrategies: [
              {
                operation: op1,
                probabilisticSampling: {
                  samplingRate: op1SamplingRate,
                },
              },
              {
                operation: op2,
                probabilisticSampling: {
                  samplingRate: op2SamplingRate,
                },
              },
            ],
            defaultUpperBoundTracesPerSecond: 1.8,
          },
        };

      beforeEach(() => {
        getSamplerConfigStub.resolves(
          samplingStrategyResponseWithPerOperationStrategies
        );
      });

      it('Use default probability from inside operationSampling object and perOperationStrategies values for specific operations.', async () => {
        const jaegerRemoteSampler = new JaegerRemoteSampler({
          endpoint,
          serviceName,
          poolingInterval,
          initialSampler: alwaysOnSampler,
        });
        await clock.tickAsync(poolingInterval);
        const jaegerCurrentSampler = jaegerRemoteSampler['_sampler'];
        assert.equal(jaegerCurrentSampler instanceof ParentBasedSampler, true);
        const parentBasedRootSampler = (
          jaegerCurrentSampler as ParentBasedSampler
        )['_root'];
        assert.equal(
          parentBasedRootSampler instanceof PerOperationSampler,
          true
        );
        const perOperationSampler =
          parentBasedRootSampler as PerOperationSampler;

        const defaultSampler =
          perOperationSampler['getSamplerForOperation']('');
        assert.equal(defaultSampler instanceof TraceIdRatioBasedSampler, true);

        const defautRatio = (defaultSampler as TraceIdRatioBasedSampler)[
          '_ratio'
        ];
        assert.equal(defaultSamplingProbability, defautRatio);

        const op1Sampler = perOperationSampler['getSamplerForOperation'](op1);
        assert.equal(op1Sampler instanceof TraceIdRatioBasedSampler, true);

        const op1Ratio = (op1Sampler as TraceIdRatioBasedSampler)['_ratio'];
        assert.equal(op1SamplingRate, op1Ratio);

        const op2Sampler = perOperationSampler['getSamplerForOperation'](op2);
        assert.equal(op2Sampler instanceof TraceIdRatioBasedSampler, true);

        const op2Ratio = (op2Sampler as TraceIdRatioBasedSampler)['_ratio'];
        assert.equal(op2SamplingRate, op2Ratio);
      });
    });

    describe('errorCase', () => {
      let diagWarnStub: sinon.SinonStub;
      const invalidStrategyType = 'ANY_TEXT';
      const errorSamplingStrategyResponse = {
        strategyType: invalidStrategyType,
        probabilisticSampling: {
          samplingRate: 0,
        },
        operationSampling: {
          defaultSamplingProbability: 0,
          defaultLowerBoundTracesPerSecond: 0,
          perOperationStrategies: [],
          defaultUpperBoundTracesPerSecond: 0,
        },
      };

      beforeEach(() => {
        getSamplerConfigStub.resolves(errorSamplingStrategyResponse);
        diagWarnStub = sinon.stub(api.diag, 'warn');
      });

      it('Throw error when unsupported strategy type is sent by api.', async () => {
        new JaegerRemoteSampler({
          endpoint,
          serviceName,
          poolingInterval,
          initialSampler: alwaysOnSampler,
        });
        await clock.tickAsync(poolingInterval);
        sinon.assert.calledOnceWithExactly(
          diagWarnStub,
          `Strategy ${invalidStrategyType} not supported.`
        );
      });
    });
  });

  describe('toString', () => {
    let getSamplerConfigStub: sinon.SinonStub;

    const defaultSamplingProbability = randomSamplingProability();
    const op1SamplingRate = randomSamplingProability();
    const op1 = 'op1';

    const samplingStrategyResponseWithPerOperationStrategies: SamplingStrategyResponse =
      {
        strategyType: StrategyType.PROBABILISTIC,
        probabilisticSampling: {
          samplingRate: 1.5,
        },
        operationSampling: {
          defaultSamplingProbability,
          defaultLowerBoundTracesPerSecond: 1.6,
          perOperationStrategies: [
            {
              operation: op1,
              probabilisticSampling: {
                samplingRate: op1SamplingRate,
              },
            },
          ],
          defaultUpperBoundTracesPerSecond: 1.8,
        },
      };

    beforeEach(() => {
      getSamplerConfigStub = sinon.stub(
        JaegerRemoteSampler.prototype,
        'getSamplerConfig' as any
      );
    });

    afterEach(() => {
      getSamplerConfigStub.restore();
    });

    beforeEach(() => {
      getSamplerConfigStub.resolves(
        samplingStrategyResponseWithPerOperationStrategies
      );
    });

    it('Should reflect sampler name with current sampler runninng in it', async () => {
      const jaegerRemoteSampler = new JaegerRemoteSampler({
        endpoint,
        serviceName,
        poolingInterval,
        initialSampler: alwaysOnSampler,
      });
      await clock.tickAsync(poolingInterval);
      const jaegerCurrentSampler = jaegerRemoteSampler.toString();
      assert.equal(
        jaegerCurrentSampler,
        `JaegerRemoteSampler{endpoint=${endpoint}, serviceName=${serviceName}, poolingInterval=${poolingInterval}, sampler=ParentBased{root=PerOperationSampler{default=TraceIdRatioBased{${defaultSamplingProbability}}, perOperationSamplers={${op1}=TraceIdRatioBased{${op1SamplingRate}}}}, remoteParentSampled=AlwaysOnSampler, remoteParentNotSampled=AlwaysOffSampler, localParentSampled=AlwaysOnSampler, localParentNotSampled=AlwaysOffSampler}}`
      );
    });
  });

  describe('getSamplerConfig', () => {
    let axiosGetStub: sinon.SinonStub;

    beforeEach(() => {
      axiosGetStub = sinon.stub(axios, 'get');
    });

    afterEach(() => {
      axiosGetStub.restore();
    });

    it('Should pass endpoint and service name.', async () => {
      new JaegerRemoteSampler({
        endpoint,
        serviceName,
        poolingInterval,
        initialSampler: alwaysOnSampler,
      });
      await clock.tickAsync(poolingInterval);
      sinon.assert.calledOnceWithExactly(
        axiosGetStub,
        `${endpoint}/sampling?service=${serviceName}`
      );
    });

    it('Should pass endpoint and blank service name if nothing is provided.', async () => {
      new JaegerRemoteSampler({
        endpoint,
        serviceName: undefined,
        poolingInterval,
        initialSampler: alwaysOnSampler,
      });
      await clock.tickAsync(poolingInterval);
      sinon.assert.calledOnceWithExactly(
        axiosGetStub,
        `${endpoint}/sampling?service=`
      );
    });
  });
});
