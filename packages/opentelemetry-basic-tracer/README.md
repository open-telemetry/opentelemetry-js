# OpenTelemetry Basic Tracer SDK
[![Gitter chat][gitter-image]][gitter-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

This module provides a full control over instrumentation and span creation. It doesn't load [`async_hooks`](https://nodejs.org/api/async_hooks.html) or any instrumentation plugin by default. It is intended for use both on the server and in the browser.

For automatic instrumentation see the
[@opentelemetry/node-tracer](https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-node-tracer) package.

## Installation

```
npm install --save @opentelemetry/basic-tracer
```

## Usage

```
const opentelemetry = require('@opentelemetry/core');
const { BasicTracer } = require('@opentelemetry/basic-tracer');
const { NoopScopeManager } = require('@opentelemetry/scope-base');

// To start a trace, you first need to initialize the Tracer.
// NOTE: the default OpenTelemetry tracer does not record any tracing information.
const tracer = new BasicTracer({
  scopeManager: new NoopScopeManager()
});

// Initialize the OpenTelemetry APIs to use the BasicTracer bindings
opentelemetry.initGlobalTracer(tracer);

// To create a span in a trace, we used the global singleton tracer to start a new span.
const span = opentelemetry.getTracer().startSpan('foo');

// Create an Attributes
span.setAttribute('key', 'value');

// We must end the spans so they becomes available for exporting.
span.end();

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
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-basic-tracer
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-basic-tracer
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-basic-tracer
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-basic-tracer&type=dev
