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

import { Link, SpanKind, Attributes, diag, Context } from '@opentelemetry/api';
import {
  Sampler,
  SamplingResult,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';
import axios from 'axios';
import { PerOperationSampler } from './PerOperationSampler';
import { SamplingStrategyResponse, StrategyType } from './types';

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
      } catch (err) {
        diag.warn('Could not update sampler', err);
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
    attributes: Attributes,
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
    return `JaegerRemoteSampler{endpoint=${this._endpoint},${
      this._serviceName && ` serviceName=${this._serviceName},`
    } poolingInterval=${this._poolingInterval}, sampler=${this._sampler}}`;
  }

  private async getAndUpdateSampler() {
    const newConfig = await this.getSamplerConfig(this._serviceName);
    this._sampler = await this.convertSamplingResponseToSampler(newConfig);
  }

  private convertSamplingResponseToSampler(
    newConfig: SamplingStrategyResponse
  ): Sampler {
    const perOperationStrategies =
      newConfig.operationSampling?.perOperationStrategies;
    if (
      newConfig.operationSampling &&
      perOperationStrategies &&
      perOperationStrategies.length > 0
    ) {
      const defaultSampler: Sampler = new TraceIdRatioBasedSampler(
        newConfig.operationSampling.defaultSamplingProbability
      );
      return new ParentBasedSampler({
        root: new PerOperationSampler({
          defaultSampler,
          perOperationStrategies,
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
        diag.warn(`Strategy ${newConfig.strategyType} not supported.`);
        return this._sampler;
    }
  }

  private async getSamplerConfig(
    serviceName?: string
  ): Promise<SamplingStrategyResponse> {
    const response = await axios.get<SamplingStrategyResponse>(
      `${this._endpoint}/sampling?service=${serviceName ?? ''}`
    );
    return response.data;
  }
}
