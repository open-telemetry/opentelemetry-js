# OpenTelemetry Browser Tracer SDK
[![Gitter chat][gitter-image]][gitter-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

This module provides automatic tracing for Web applications.

For manual instrumentation see the
[@opentelemetry/tracer-web](https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-tracer-web) package.

## How does automatic tracing work?
> Automatic Instrumentation is in progress, manual instrumentation only supported

## Installation

```bash
npm install --save @opentelemetry/tracer-web
```

## Usage

```js
// Manual 
const { WebTracer } = require('@opentelemetry/tracer-web');
const webTracer = new WebTracer();
const span = webTracer.startSpan('span1');
webTracer.withSpan(span, function () {
  // this === span
  this.addEvent('start');
});
span.addEvent('middle');
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
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-tracer-web
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-tracer-web
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-tracer-web
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-tracer-web&type=dev
