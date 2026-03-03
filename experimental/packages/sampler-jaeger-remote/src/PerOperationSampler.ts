/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, SpanKind, Link, SpanAttributes } from '@opentelemetry/api';
import {
  Sampler,
  SamplingResult,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';
import { PerOperationStrategy } from './types';

interface PerOperationSamplerOptions {
  /** The default sampler to use in case span does not have a custom strategy. */
  defaultSampler: Sampler;
  /** Stores strategies for every custom span. */
  perOperationStrategies: PerOperationStrategy[];
}

/** PerOperationSampler to be used from JaegerRemoteSampler */
export class PerOperationSampler implements Sampler {
  private _defaultSampler: Sampler;
  private _perOperationSampler: Map<string, Sampler>;

  constructor(config: PerOperationSamplerOptions) {
    this._defaultSampler = config.defaultSampler;
    this._perOperationSampler = new Map<string, Sampler>(
      config.perOperationStrategies.map(perOperationStrategy => [
        perOperationStrategy.operation,
        new TraceIdRatioBasedSampler(
          perOperationStrategy.probabilisticSampling.samplingRate
        ),
      ])
    );
  }

  private getSamplerForOperation(spanName: string): Sampler {
    let resultantSampler = this._perOperationSampler.get(spanName);
    if (resultantSampler == null) {
      resultantSampler = this._defaultSampler;
    }
    return resultantSampler;
  }

  shouldSample(
    context: Context,
    traceId: string,
    spanName: string,
    spanKind: SpanKind,
    attributes: SpanAttributes,
    links: Link[]
  ): SamplingResult {
    return this.getSamplerForOperation(spanName).shouldSample(
      context,
      traceId,
      spanName,
      spanKind,
      attributes,
      links
    );
  }

  toString(): string {
    return `PerOperationSampler{default=${
      this._defaultSampler
    }, perOperationSamplers={${Array.from(this._perOperationSampler).map(
      ([key, value]) => `${key}=${value}`
    )}}}`;
  }
}
