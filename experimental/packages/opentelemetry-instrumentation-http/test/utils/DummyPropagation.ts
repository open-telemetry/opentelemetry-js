/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import type {
  Context,
  TextMapPropagator,
  TextMapSetter,
} from '@opentelemetry/api';
import { defaultTextMapSetter, trace, TraceFlags } from '@opentelemetry/api';
import type * as http from 'http';

export class DummyPropagation implements TextMapPropagator {
  static TRACE_CONTEXT_KEY = 'x-dummy-trace-id';
  static SPAN_CONTEXT_KEY = 'x-dummy-span-id';
  extract(context: Context, carrier: http.OutgoingHttpHeaders) {
    const extractedSpanContext = {
      traceId: carrier[DummyPropagation.TRACE_CONTEXT_KEY] as string,
      spanId: carrier[DummyPropagation.SPAN_CONTEXT_KEY] as string,
      traceFlags: TraceFlags.SAMPLED,
      isRemote: true,
    };
    if (extractedSpanContext.traceId && extractedSpanContext.spanId) {
      return trace.setSpanContext(context, extractedSpanContext);
    }
    return context;
  }
  inject(
    context: Context,
    carrier: unknown,
    setter: TextMapSetter = defaultTextMapSetter
  ): void {
    const spanContext = trace.getSpanContext(context);
    if (!spanContext) return;
    setter.set(
      carrier,
      DummyPropagation.TRACE_CONTEXT_KEY,
      spanContext.traceId
    );
    setter.set(carrier, DummyPropagation.SPAN_CONTEXT_KEY, spanContext.spanId);
  }
  fields(): string[] {
    return [
      DummyPropagation.TRACE_CONTEXT_KEY,
      DummyPropagation.SPAN_CONTEXT_KEY,
    ];
  }
}
