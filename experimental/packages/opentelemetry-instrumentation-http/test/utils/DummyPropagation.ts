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
  TextMapGetter,
  TextMapPropagator,
  TextMapSetter,
  trace,
  TraceFlags,
} from '@opentelemetry/api';

export class DummyPropagation implements TextMapPropagator {
  static TRACE_CONTEXT_KEY = 'x-dummy-trace-id';
  static SPAN_CONTEXT_KEY = 'x-dummy-span-id';

  extract<Carrier>(
    context: Context,
    carrier: Carrier,
    getter: TextMapGetter<Carrier>
  ) {
    const traceId = getter.get(carrier, DummyPropagation.TRACE_CONTEXT_KEY);
    const spanId = getter.get(carrier, DummyPropagation.SPAN_CONTEXT_KEY);

    if (traceId && spanId) {
      if (typeof traceId !== 'string') {
        throw new Error('expecting traceId to be a string');
      }

      if (typeof spanId !== 'string') {
        throw new Error('expecting spanId to be a string');
      }

      const extractedSpanContext = {
        traceId,
        spanId,
        traceFlags: TraceFlags.SAMPLED,
        isRemote: true,
      };

      return trace.setSpanContext(context, extractedSpanContext);
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
