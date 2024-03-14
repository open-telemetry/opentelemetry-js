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
import { Sampler, SamplingDecision, SamplingResult } from '../../../../packages/opentelemetry-sdk-trace-base/src/Sampler';
import { globalErrorHandler } from '@opentelemetry/core';
import { SpanKind } from '@opentelemetry/api/src/trace/span_kind';
import { Link } from '@opentelemetry/api/src/trace/link';
import { SpanAttributes } from '@opentelemetry/api/src/trace/attributes';

/** JaegerRemoteSampler */
export class JaegerRemoteSampler implements Sampler {
  private _endpoint: String;
  private _poolingInterval: number;
  private _initialSampler: Sampler;
  constructor(config: JaegerRemoteSamplerConfig) {
    this._endpoint = config.endpoint;
    this._poolingInterval = config.poolingInterval;
    this._initialSampler = config.initialSampler;

    if (!this._endpoint) {
      globalErrorHandler(
        new Error('JaegerRemoteSampler must have a endpoint configured')
      );
    }
    if (!this._poolingInterval) {
      globalErrorHandler(
        new Error('JaegerRemoteSampler must have a pooling interval configured')
      );
    }
    if (!this._initialSampler) {
      globalErrorHandler(
        new Error('JaegerRemoteSampler must have a initial sampler configured')
      );
    }
  }

  shouldSample(context: Context,
    traceId: string,
    spanName: string,
    spanKind: SpanKind,
    attributes: SpanAttributes,
    links: Link[]): SamplingResult {
    return {
      decision: SamplingDecision.RECORD_AND_SAMPLED,
    };
  }

  toString(): string {
    return 'JaegerRemoteSampler';
  }
}

interface JaegerRemoteSamplerConfig {
  /** Address of a service that implements the Remote Sampling API, such as Jaeger Collector or OpenTelemetry Collector */
  endpoint: String;
  /** Polling interval for getting configuration from remote */
  poolingInterval: number;
  /** Initial sampler that is used before the first configuration is fetched */
  initialSampler: Sampler;
}
