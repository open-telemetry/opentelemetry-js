# OpenTelemetry API for JavaScript
[![Gitter chat][gitter-image]][gitter-url]
[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

This package provides everything needed to interact with the OpenTelemetry API, including all TypeScript interfaces, enums, and no-op implementations. It is intended for use both on the server and in the browser.

## Basic Use

### API Entry Point

API entry points are defined as global singleton objects `trace` and `metrics` which contain methods used to initialize SDK implementations and acquire resources from the API.

- [Trace API Documentation][trace-api-docs]
- [Metrics API Documentation][metrics-api-docs]

```javascript
const api = require("@opentelemetry/api")

/* Initialize TraceProvider */
api.trace.initGlobalTracerProvider(traceProvider);
/* returns traceProvider (no-op if a working provider has not been initialized) */
api.trace.getTracerProvider();
/* returns a tracer from the registered global tracer provider (no-op if a working provider has not been initialized); */
api.trace.getTracer(name, version);

/* Initialize MeterProvider */
api.metrics.initGlobalMeterProvider(meterProvider);
/* returns meterProvider (no-op if a working provider has not been initialized) */
api.metrics.getMeterProvider();
/* returns a meter from the registered global meter provider (no-op if a working provider has not been initialized); */
api.metrics.getMeter(name, version);
```

### Application Owners

Application owners will also need a working OpenTelemetry SDK implementation. OpenTelemetry provides working SDK implementations for [web] and [node] for both [tracing] and [metrics].

#### Simple NodeJS Example

Before any other module in your application is loaded, you must initialize the global tracer and meter registries. If you fail to initialize a provider, no-op implementations will be provided to any library which acquires them from the API.

```javascript
const api = require("@opentelemetry/api");
const sdk = require("@opentelemetry/node");

const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

// Initialize an exporter
const exporter = new JaegerExporter({
  serviceName: 'basic-service'
});

// Create a provider which we will configure as the global tracer provider
const provider = new sdk.NodeTracerProvider();

// Configure span processor to send spans to the exporter
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

// Initialize the OpenTelemetry APIs to use the NodeTracerProvider bindings
api.trace.initGlobalTracerProvider(provider);

// your application code below this line
```

### Library Authors

Library authors need only to depend on the `@opentelemetry/api` package and trust that the application owners which use their library will initialize an appropriate SDK.

```javascript
const api = require("@opentelemetry/api");

const tracer = api.trace.getTracer("my-library-name", "0.2.3");

async function doSomething() {
  const span = tracer.startSpan("doSomething", { parent: tracer.getCurrentSpan() });
  try {
    const result = await doSomethingElse();
    span.end();
    return result;
  } catch (err) {
    span.setStatus({
      // use an appropriate status code here
      code: api.CanonicalCode.INTERNAL,
      message: err.message,
    });
    span.end();
    return null;
  }
}
```


## Useful links
- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us on [gitter][gitter-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[gitter-image]: https://badges.gitter.im/open-telemetry/opentelemetry-js.svg
[gitter-url]: https://gitter.im/open-telemetry/opentelemetry-node?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/master/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-api
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-api
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-api
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-api&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/api
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fapi.svg

[trace-api-docs]: https://open-telemetry.github.io/opentelemetry-js/classes/traceapi.html
[metrics-api-docs]: https://open-telemetry.github.io/opentelemetry-js/classes/metricsapi.html

[web]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-web
[tracing]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-tracing
[node]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-node
[metrics]: https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-metrics
