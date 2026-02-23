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

import type { ComposableSampler, SamplingIntent, SamplingRule } from './types';
import { INVALID_THRESHOLD } from './util';

const NON_SAMPLING_INTENT: SamplingIntent = Object.freeze({
  threshold: INVALID_THRESHOLD,
  thresholdReliable: false,
});

class ComposableRuleBasedSampler implements ComposableSampler {
  private readonly rules: SamplingRule[];
  private readonly description: string;

  constructor(rules: SamplingRule[]) {
    this.rules = rules;
    const ruleReprs = rules.map(
      rule => `(${rule[0].name || '(anonymous)'}, ${rule[1].toString()})`
    );
    this.description = `ComposableRuleBasedSampler([${ruleReprs.join(', ')}])`;
  }

  getSamplingIntent(
    context: Context,
    traceId: string,
    spanName: string,
    spanKind: SpanKind,
    attributes: Attributes,
    links: Link[]
  ): SamplingIntent {
    for (const [predicate, sampler] of this.rules) {
      if (predicate(context, traceId, spanName, spanKind, attributes, links)) {
        return sampler.getSamplingIntent(
          context,
          traceId,
          spanName,
          spanKind,
          attributes,
          links
        );
      }
    }
    return NON_SAMPLING_INTENT;
  }

  toString(): string {
    return this.description;
  }
}

export function createComposableRuleBasedSampler(
  rules: SamplingRule[]
): ComposableSampler {
  return new ComposableRuleBasedSampler(rules);
}
