import { AlwaysOnSampler, SamplingDecision } from "@opentelemetry/sdk-trace-base";
import { PerOperationSampler } from "../src/PerOperationSampler";
import sinon = require("sinon");
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
            perOperationStrategies: []
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