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

import { Attributes, Link, Sampler, SamplingResult, SpanContext, SpanKind, TraceFlags } from '@opentelemetry/api';
import { AlwaysOffSampler } from './AlwaysOffSampler';
import { AlwaysOnSampler } from './AlwaysOnSampler';

/**
 * A composite sampler that either respects the parent span's sampling decision
 * or delegates to `delegateSampler` for root spans.
 */
export class ParentBasedSampler implements Sampler {
  private root: Sampler;
  private remoteParentSampled: Sampler;
  private remoteParentNotSampled: Sampler;
  private localParentSampled: Sampler;
  private localParentNotSampled: Sampler;

  constructor(config: ParentBasedSamplerConfig) {
    this.root = config.root;
    this.remoteParentSampled = config.remoteParentSampled ?? new AlwaysOnSampler();
    this.remoteParentNotSampled = config.remoteParentNotSampled ?? new AlwaysOffSampler();
    this.localParentSampled = config.localParentSampled ?? new AlwaysOnSampler();
    this.localParentNotSampled = config.localParentNotSampled ?? new AlwaysOffSampler();
  }

  shouldSample(
    parentContext: SpanContext | undefined,
    traceId: string,
    spanName: string,
    spanKind: SpanKind,
    attributes: Attributes,
    links: Link[]
  ): SamplingResult {
    if (!parentContext) {
      return this.root.shouldSample(parentContext, traceId, spanName, spanKind, attributes, links);
    }

    if (parentContext.isRemote) {
      if (parentContext.traceFlags & TraceFlags.SAMPLED) {
        return this.remoteParentSampled.shouldSample(parentContext, traceId, spanName, spanKind, attributes, links)
      }
      return this.remoteParentNotSampled.shouldSample(parentContext, traceId, spanName, spanKind, attributes, links);
    }

    if (parentContext.traceFlags & TraceFlags.SAMPLED) {
      return this.localParentSampled.shouldSample(parentContext, traceId, spanName, spanKind, attributes, links);
    }

    return this.localParentNotSampled.shouldSample(parentContext, traceId, spanName, spanKind, attributes, links);
  }

  toString(): string {
    return `ParentBased{root=${this.root.toString()}, remoteParentSampled=${this.remoteParentSampled.toString()}, remoteParentNotSampled=${this.remoteParentNotSampled.toString()}, localParentSampled=${this.localParentSampled.toString()}, localParentNotSampled=${this.localParentNotSampled.toString()}}`;
  }
}

interface ParentBasedSamplerConfig {
  /** Sampler called for spans with no parent */
  root: Sampler;
  /** Sampler called for spans with a remote parent which was sampled. Default AlwaysOn */
  remoteParentSampled?: Sampler;
  /** Sampler called for spans with a remote parent which was not sampled. Default AlwaysOff */
  remoteParentNotSampled?: Sampler;
  /** Sampler called for spans with a local parent which was sampled. Default AlwaysOn */
  localParentSampled?: Sampler;
  /** Sampler called for spans with a local parent which was not sampled. Default AlwaysOff */
  localParentNotSampled?: Sampler;
}
