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
import {
  Context,
  SpanKind,
  Attributes,
  Link,
  TraceState,
} from '@opentelemetry/api';
import { TraceState as CoreTraceState } from '@opentelemetry/core';
import {
  Sampler,
  SamplingDecision,
  SamplingResult,
} from '@opentelemetry/sdk-trace-base';
import { ComposableSampler } from './types';
import { getSpanContext } from '../../../../api/src/trace/context-utils';
import { parseOtelTraceState, serializeTraceState } from './tracestate';
import {
  INVALID_THRESHOLD,
  isValidRandomValue,
  isValidThreshold,
} from './util';

export class CompositeSampler implements Sampler {
  constructor(private readonly delegate: ComposableSampler) {}

  shouldSample(
    context: Context,
    traceId: string,
    spanName: string,
    spanKind: SpanKind,
    attributes: Attributes,
    links: Link[]
  ): SamplingResult {
    const spanContext = getSpanContext(context);

    const traceState = spanContext?.traceState;
    const otTraceState = parseOtelTraceState(traceState);

    const intent = this.delegate.getSamplingIntent(
      context,
      traceId,
      spanName,
      spanKind,
      attributes,
      links
    );

    let adjustedCountCorrect = false;
    let sampled = false;
    if (isValidThreshold(intent.threshold)) {
      adjustedCountCorrect = intent.thresholdReliable;
      let randomness: bigint;
      if (isValidRandomValue(otTraceState.randomValue)) {
        randomness = otTraceState.randomValue;
      } else {
        // Use last 56 bits of trace_id as randomness.
        randomness = BigInt(`0x${traceId.slice(-14)}`);
      }
      sampled = intent.threshold <= randomness;
    }

    const decision = sampled
      ? SamplingDecision.RECORD_AND_SAMPLED
      : SamplingDecision.NOT_RECORD;
    if (sampled && adjustedCountCorrect) {
      otTraceState.threshold = intent.threshold;
    } else {
      otTraceState.threshold = INVALID_THRESHOLD;
    }

    const otts = serializeTraceState(otTraceState);

    let newTraceState: TraceState | undefined;
    if (traceState) {
      newTraceState = traceState;
      if (intent.updateTraceState) {
        newTraceState = intent.updateTraceState(newTraceState);
      }
    }
    if (otts) {
      if (!newTraceState) {
        newTraceState = new CoreTraceState();
      }
      newTraceState = newTraceState.set('ot', otts);
    }

    return {
      decision,
      attributes: intent.attributes,
      traceState: newTraceState,
    };
  }
}
