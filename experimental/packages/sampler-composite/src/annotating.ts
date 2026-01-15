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
import { Attributes, Context, Link, SpanKind } from '@opentelemetry/api';
import type { ComposableSampler, SamplingIntent } from './types';

class ComposableAnnotatingSampler implements ComposableSampler {
  private readonly attributes: Attributes;
  private readonly delegate: ComposableSampler;
  private readonly description: string;

  constructor(attributes: Attributes, delegate: ComposableSampler) {
    // Shallow copy `attributes` to avoid changes to the original object (at
    // least top-level fields) impacting the sampler. Freeze the object so
    // we can return it in `getSamplingIntent` without copying there.
    this.attributes = Object.freeze({ ...attributes });
    this.delegate = delegate;
    this.description = `ComposableAnnotatingSampler(attributes, delegate=${delegate})`;
  }

  getSamplingIntent(
    context: Context,
    traceId: string,
    spanName: string,
    spanKind: SpanKind,
    attributes: Attributes,
    links: Link[]
  ): SamplingIntent {
    const intent = this.delegate.getSamplingIntent(
      context,
      traceId,
      spanName,
      spanKind,
      attributes,
      links
    );
    if (!intent.attributes) {
      intent.attributes = this.attributes;
    } else {
      intent.attributes = { ...intent.attributes, ...this.attributes };
    }
    return intent;
  }

  toString(): string {
    return this.description;
  }
}

export function createComposableAnnotatingSampler(
  attributes: Attributes,
  delegate: ComposableSampler
): ComposableSampler {
  return new ComposableAnnotatingSampler(attributes, delegate);
}
