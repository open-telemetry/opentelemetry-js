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
import { Counter, Meter, SpanContext, UpDownCounter } from '@opentelemetry/api';
import { SamplingDecision } from './Sampler';

/**
 * Generates `otel.sdk.span.*` metrics.
 * https://opentelemetry.io/docs/specs/semconv/otel/sdk-metrics/#span-metrics
 */
export class TracerMetrics {
  private readonly startedSpans: Counter;
  private readonly liveSpans: UpDownCounter;

  constructor(meter: Meter) {
    this.startedSpans = meter.createCounter('otel.sdk.span.started', {
      unit: '{span}',
      description: 'The number of created spans.',
    });

    this.liveSpans = meter.createUpDownCounter('otel.sdk.span.live', {
      unit: '{span}',
      description: 'The number of currently live spans.',
    });
  }

  startSpan(
    parentSpanCtx: SpanContext | undefined,
    samplingDecision: SamplingDecision
  ): () => void {
    const samplingDecisionStr = samplingDecisionToString(samplingDecision);
    this.startedSpans.add(1, {
      'otel.span.parent.origin': parentOrigin(parentSpanCtx),
      'otel.span.sampling_result': samplingDecisionStr,
    });

    if (samplingDecision === SamplingDecision.NOT_RECORD) {
      return () => {};
    }

    const liveSpanAttributes = {
      'otel.span.sampling_result': samplingDecisionStr,
    };
    this.liveSpans.add(1, liveSpanAttributes);
    return () => {
      this.liveSpans.add(-1, liveSpanAttributes);
    };
  }
}

function parentOrigin(parentSpanContext: SpanContext | undefined): string {
  if (!parentSpanContext) {
    return 'none';
  }
  if (parentSpanContext.isRemote) {
    return 'remote';
  }
  return 'local';
}

function samplingDecisionToString(decision: SamplingDecision): string {
  switch (decision) {
    case SamplingDecision.RECORD_AND_SAMPLED:
      return 'RECORD_AND_SAMPLE';
    case SamplingDecision.RECORD:
      return 'RECORD_ONLY';
    case SamplingDecision.NOT_RECORD:
      return 'DROP';
  }
}
