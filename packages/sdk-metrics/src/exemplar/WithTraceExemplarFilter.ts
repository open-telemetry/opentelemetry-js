/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Context,
  HrTime,
  isSpanContextValid,
  trace,
  TraceFlags,
  Attributes,
} from '@opentelemetry/api';
import { ExemplarFilter } from './ExemplarFilter';

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
