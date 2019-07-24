# OpenTelemetry Basic Tracer SDK

This module provides a full control over instrumentation and span creation. It doesn't load [`async_hooks`](https://nodejs.org/api/async_hooks.html) or any instrumentation plugin by default. It is intended for use both on the server and in the browser.

For automatic insturmentation see the
[@opentelemetry/node-tracer](https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-node-tracer) package.

## Installation

```
npm install --save @opentelemetry/basic-tracer
```

## Usage

```
const opentelemetry = require('@opentelemetry/basic-tracer');

// TODO: DEMONSTRATE API
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
