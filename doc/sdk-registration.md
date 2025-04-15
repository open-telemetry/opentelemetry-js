# SDK Registration Methods

These methods are used to register a compatible OpenTelemetry SDK. Some SDKs like the [OpenTelemetry JS SDK][opentelemetry-js] provide convenience methods which call these registration methods for you.

- [Trace API Documentation][trace-api-docs]
- [Propagation API Documentation][propagation-api-docs]
- [Context API Documentation][context-api-docs]

```javascript
const api = require("@opentelemetry/api");

/* Register a global TracerProvider */
api.trace.setGlobalTracerProvider(tracerProvider);
/* returns tracerProvider (no-op if a working provider has not been initialized) */
api.trace.getTracerProvider();
/* returns a tracer from the registered global tracer provider (no-op if a working provider has not been initialized) */
api.trace.getTracer(name, version);

/* Register a global Propagator */
api.propagation.setGlobalPropagator(httpTraceContextPropagator);

/* Register a global Context Manager */
api.context.setGlobalContextManager(asyncHooksContextManager);
```

[opentelemetry-js]: https://github.com/open-telemetry/opentelemetry-js
[trace-api-docs]: https://open-telemetry.github.io/opentelemetry-js/classes/_opentelemetry_api._opentelemetry_api.TraceAPI.html
[propagation-api-docs]: https://open-telemetry.github.io/opentelemetry-js/classes/_opentelemetry_api._opentelemetry_api.PropagationAPI.html
[context-api-docs]: https://open-telemetry.github.io/opentelemetry-js/classes/_opentelemetry_api._opentelemetry_api.ContextAPI.html
