# Propagation

Span context fields like trace id, span id, trace flags, and baggages need to be sent to the downstream services
in order to properly associate downstream created spans with the current span.

This is commonly achieved with HTTP headers, RPC metadata, with well-known formats like:

- [W3C Trace Context][]: Supported with [W3CTraceContextPropagator][].
- [B3][]: Supported with [B3Propagator][].
- Jaeger: Supported with [JaegerPropagator][].

If none of the above formats meet your needs, you can implement your own propagator.

## Implement your own propagator

To implement a propagator, you need to define a class implementing the `TextMapPropagator` interface.

```ts
import {
  Context,
  isSpanContextValid,
  isValidSpanId,
  isValidTraceId,
  TextMapGetter,
  TextMapPropagator,
  TextMapSetter,
  TraceFlags,
  trace,
} from '@opentelemetry/api';
import { isTracingSuppressed } from '@opentelemetry/core';

// Example header, the content format can be `<trace-id>:<span-id>`
const MyHeader = 'my-header';

export class MyPropagator implements TextMapPropagator {
  // Inject the header to the outgoing request.
  inject(context: Context, carrier: unknown, setter: TextMapSetter): void {
    const spanContext = trace.getSpanContext(context);
    // Skip if the current span context is not valid or suppressed.
    if (
      !spanContext ||
      !isSpanContextValid(spanContext) ||
      isTracingSuppressed(context)
    ) {
      return;
    }

    const value = `${spanContext.traceId}:${spanContext.spanId}`;
    setter.set(carrier, MyHeader, value);
    // You can set more header fields as you need.
  }

  // Extract the header from the incoming request.
  extract(context: Context, carrier: unknown, getter: TextMapGetter): Context {
    const headers = getter.get(carrier, MyHeader);
    const header = Array.isArray(headers) ? headers[0] : headers;
    if (typeof header !== 'string') return context;

    const [traceId, spanId] = header.split(':');

    // Skip if the traceId or spanId is invalid.
    if (!isValidTraceId(traceId) || !isValidSpanId(spanId)) return context;

    return trace.setSpanContext(context, {
      traceId,
      spanId,
      isRemote: true,
      traceFlags: TraceFlags.SAMPLED,
    });
  }

  fields(): string[] {
    return [MyHeader];
  }
}
```

With the propagator defined, you can set it as the global propagator, so that all instrumentations
can make use of it.

```ts
const api = require('@opentelemetry/api');
const { MyPropagator } = require('./my-propagator');

api.propagation.setGlobalPropagator(new MyPropagator());
```

[B3]: https://github.com/openzipkin/b3-propagation
[B3Propagator]: https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-propagator-b3
[JaegerPropagator]: https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-propagator-jaeger
[W3C Trace Context]: https://www.w3.org/TR/trace-context/
[W3CTraceContextPropagator]: https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-core#w3ctracecontextpropagator-propagator
