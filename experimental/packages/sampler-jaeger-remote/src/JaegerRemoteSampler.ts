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

import { Context } from '@opentelemetry/api/src/context/types';
import {
  Sampler,
  SamplingResult,
} from '../../../../packages/opentelemetry-sdk-trace-base/src/Sampler';
import { SpanKind } from '@opentelemetry/api/src/trace/span_kind';
import { Link } from '@opentelemetry/api/src/trace/link';
import { SpanAttributes } from '@opentelemetry/api/src/trace/attributes';
import axios from 'axios';
import {
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from '../../../../packages/opentelemetry-sdk-trace-base/src';
import { PerOperationSampler } from './PerOperationSampler';
import { SamplingStrategyResponse, StrategyType } from './types';

/** JaegerRemoteSampler */
export class JaegerRemoteSampler implements Sampler {
  private _endpoint: string;
  private _serviceName?: string;
  private _poolingInterval: number;
  private _sampler: Sampler;
  private _syncingConfig: boolean;

  constructor(config: JaegerRemoteSamplerOptions) {
    this._endpoint = config.endpoint;
    this._serviceName = config.serviceName;
    this._poolingInterval = config.poolingInterval;
    this._sampler = config.initialSampler;
    this._syncingConfig = false;

    setInterval(async () => {
      if (this._syncingConfig) {
        return;
      }
      this._syncingConfig = true;
      try {
        await this.getAndUpdateSampler();
      } finally {
        this._syncingConfig = false;
      }
    }, this._poolingInterval);
  }

  shouldSample(
    context: Context,
    traceId: string,
    spanName: string,
    spanKind: SpanKind,
    attributes: SpanAttributes,
    links: Link[]
  ): SamplingResult {
    return this._sampler.shouldSample(
      context,
      traceId,
      spanName,
      spanKind,
      attributes,
      links
    );
  }

  toString(): string {
    return `JaegerRemoteSampler${this._sampler}`;
  }

  async getAndUpdateSampler() {
    const newConfig = await this.getSamplerConfig(this._serviceName);
    this._sampler = this.convertSamplingResponseToSampler(newConfig);
  }

  convertSamplingResponseToSampler(newConfig: SamplingStrategyResponse) {
    const perOperationStrategies = newConfig.operationSampling?.perOperationStrategies;
    if (perOperationStrategies && perOperationStrategies.length > 0) {
      const defaultSampler: Sampler = new TraceIdRatioBasedSampler(
        newConfig.operationSampling?.defaultSamplingProbability
      );
      return new ParentBasedSampler({
        root: new PerOperationSampler({
          defaultSampler,
          perOperationStrategies: newConfig.operationSampling?.perOperationStrategies ?? [],
        }),
      });
    }
    switch (newConfig.strategyType) {
      case StrategyType.PROBABILISTIC:
        return new ParentBasedSampler({
          root: new TraceIdRatioBasedSampler(
            newConfig.probabilisticSampling.samplingRate
          ),
        });
      default:
        throw new Error('Strategy not supported.');
    }
  }

  async getSamplerConfig(serviceName?: string) {
    const response = await axios.get<SamplingStrategyResponse>(
      `${this._endpoint}/sampling?service=${serviceName ?? ''}`
    );
    return response.data;
  }

  getCurrentSampler() {
    return this._sampler;
  }
}

interface JaegerRemoteSamplerOptions {
  /** Address of a service that implements the Remote Sampling API, such as Jaeger Collector or OpenTelemetry Collector */
  endpoint: string;
  /** Service name for Remote Sampling API */
  serviceName?: string;
  /** Polling interval for getting configuration from remote */
  poolingInterval: number;
  /** Initial sampler that is used before the first configuration is fetched */
  initialSampler: Sampler;
}
