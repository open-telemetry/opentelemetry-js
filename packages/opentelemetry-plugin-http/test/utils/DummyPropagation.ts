import { SpanContext, HttpTextFormat } from '@opentelemetry/types';
import * as http from 'http';

export class DummyPropagation implements HttpTextFormat {
  static TRACE_CONTEXT_KEY = 'x-dummy-trace-id';
  static SPAN_CONTEXT_KEY = 'x-dummy-span-id';
  extract(format: string, carrier: unknown): SpanContext {
    return {
      traceId: 'ca35dd5daef1401de22bcee7b7069195',
      spanId: DummyPropagation.SPAN_CONTEXT_KEY,
    };
  }
  inject(
    spanContext: SpanContext,
    format: string,
    headers: http.IncomingHttpHeaders
  ): void {
    headers[DummyPropagation.TRACE_CONTEXT_KEY] =
      spanContext.traceId || 'undefined';
    headers[DummyPropagation.SPAN_CONTEXT_KEY] =
      spanContext.spanId || 'undefined';
  }
}
