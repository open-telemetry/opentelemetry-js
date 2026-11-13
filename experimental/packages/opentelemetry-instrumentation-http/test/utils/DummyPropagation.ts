/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import type {
  Context,
  TextMapGetter,
  TextMapPropagator,
  TextMapSetter,
} from '@opentelemetry/api';
import { trace, TraceFlags } from '@opentelemetry/api';

export class DummyPropagation implements TextMapPropagator {
  static TRACE_CONTEXT_KEY = 'x-dummy-trace-id';
  static SPAN_CONTEXT_KEY = 'x-dummy-span-id';
  extract<Carrier>(
    context: Context,
    carrier: Carrier,
    getter: TextMapGetter<Carrier>
  ): Context {
    const traceIdHeader = getter.get(
      carrier,
      DummyPropagation.TRACE_CONTEXT_KEY
    );
    const spanIdHeader = getter.get(carrier, DummyPropagation.SPAN_CONTEXT_KEY);
    const traceId = Array.isArray(traceIdHeader)
      ? traceIdHeader[0]
      : traceIdHeader;
    const spanId = Array.isArray(spanIdHeader) ? spanIdHeader[0] : spanIdHeader;
    if (traceId && spanId) {
      return trace.setSpanContext(context, {
        traceId,
        spanId,
        traceFlags: TraceFlags.SAMPLED,
        isRemote: true,
      });
    }
    return context;
  }
  inject<Carrier>(
    context: Context,
    carrier: Carrier,
    setter: TextMapSetter<Carrier>
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
