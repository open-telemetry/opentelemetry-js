/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Context, HrTime, Attributes } from '@opentelemetry/api';
import { isSpanContextValid, trace, TraceFlags } from '@opentelemetry/api';
import type { ExemplarFilter } from './ExemplarFilter';

export class WithTraceExemplarFilter implements ExemplarFilter {
  shouldSample(
    value: number,
    timestamp: HrTime,
    attributes: Attributes,
    ctx: Context
  ): boolean {
    const spanContext = trace.getSpanContext(ctx);
    if (!spanContext || !isSpanContextValid(spanContext)) return false;
    return spanContext.traceFlags & TraceFlags.SAMPLED ? true : false;
  }
}
