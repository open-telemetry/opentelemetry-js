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

import { Attributes } from '@opentelemetry/api-metrics-wip'
import { Context, HrTime, isSpanContextValid, trace, TraceFlags } from '@opentelemetry/api'
import { ExemplarFilter } from './ExemplarFilter';

export class WithTraceExemplarFilter implements ExemplarFilter {

  shouldSample(
    value: number,
    timestamp: HrTime,
    attributes: Attributes,
    ctx: Context
  ): boolean {
    const spanContext = trace.getSpanContext(ctx);
    if (!spanContext || !isSpanContextValid(spanContext))
      return false;
    return spanContext.traceFlags & TraceFlags.SAMPLED ? true : false;
  }
}
