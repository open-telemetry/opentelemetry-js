/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import type {
  Context,
  TextMapGetter,
  TextMapPropagator,
} from '@opentelemetry/api';
import { trace, TraceFlags } from '@opentelemetry/api';
import type * as http from 'http';

export class DummyPropagation implements TextMapPropagator {
  static TRACE_CONTEXT_KEY = 'x-dummy-trace-id';
  static SPAN_CONTEXT_KEY = 'x-dummy-span-id';
  extract(
    context: Context,
    carrier: http.IncomingMessage,
    getter: TextMapGetter<http.IncomingMessage>
  ) {
    const extractedSpanContext = {
      traceId: getter.get(
        carrier,
        DummyPropagation.TRACE_CONTEXT_KEY
      ) as string,
      spanId: getter.get(carrier, DummyPropagation.SPAN_CONTEXT_KEY) as string,
      traceFlags: TraceFlags.SAMPLED,
      isRemote: true,
    };
    if (extractedSpanContext.traceId && extractedSpanContext.spanId) {
      return trace.setSpanContext(context, extractedSpanContext);
    }
    return context;
  }
  inject(context: Context, headers: { [custom: string]: string }): void {
    const spanContext = trace.getSpanContext(context);
    if (!spanContext) return;
    headers[DummyPropagation.TRACE_CONTEXT_KEY] = spanContext.traceId;
    headers[DummyPropagation.SPAN_CONTEXT_KEY] = spanContext.spanId;
  }
  fields(): string[] {
    return [
      DummyPropagation.TRACE_CONTEXT_KEY,
      DummyPropagation.SPAN_CONTEXT_KEY,
    ];
  }
}
