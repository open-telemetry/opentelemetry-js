# OpenTelemetry HTTP and HTTPS Instrumentation for Node.js

[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

This module provides automatic instrumentation for [`http`](https://nodejs.org/api/http.html) and [`https`](https://nodejs.org/api/https.html).

For automatic instrumentation see the
[@opentelemetry/node](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-node) package.

## Installation

```bash
npm install --save @opentelemetry/instrumentation-http
```

## Usage

OpenTelemetry HTTP Instrumentation allows the user to automatically collect trace data and export them to their backend of choice, to give observability to distributed systems.

To load a specific instrumentation (HTTP in this case), specify it in the Node Tracer's configuration.

```js
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');

const { ConsoleSpanExporter, SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { NodeTracerProvider } = require('@opentelemetry/node');

const provider = new NodeTracerProvider({
  // be sure to disable old plugins
  plugins: {
    http: { enabled: false, path: '@opentelemetry/plugin-http' },
    https: { enabled: false, path: '@opentelemetry/plugin-https' }
  },
});

const httpInstrumentation = new HttpInstrumentation({
  // see under for available configuration
});
httpInstrumentation.enable();

provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register();
```

See [examples/http](https://github.com/open-telemetry/opentelemetry-js/tree/main/examples/http) for a short example.

### Http instrumentation Options

Http instrumentation has few options available to choose from. You can set the following:

| Options | Type | Description |
| ------- | ---- | ----------- |
| [`applyCustomAttributesOnSpan`](https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-instrumentation-http/src/types.ts#L79) | `HttpCustomAttributeFunction` | Function for adding custom attributes |
| [`requestHook`](https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-instrumentation-http/src/types.ts#81) | `HttpRequestCustomAttributeFunction` | Function for adding custom attributes before request is handled |
| [`responseHook`](https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-instrumentation-http/src/types.ts#L83) | `HttpResponseCustomAttributeFunction` | Function for adding custom attributes before response is handled |
| [`ignoreIncomingPaths`](https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-instrumentation-http/src/types.ts#L75) | `IgnoreMatcher[]` | Http instrumentation will not trace all incoming requests that match paths |
| [`ignoreOutgoingUrls`](https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-instrumentation-http/src/types.ts#L77) | `IgnoreMatcher[]` | Http instrumentation will not trace all outgoing requests that match urls |
| [`serverName`](https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-instrumentation-http/src/types.ts#L85) | `string` | The primary server name of the matched virtual host. |
| `requireParentforOutgoingSpans` | Boolean | Require that is a parent span to create new span for outgoing requests. |
| `requireParentforIncomingSpans` | Boolean | Require that is a parent span to create new span for incoming requests. |

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-instrumentation-http
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-instrumentation-http
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-instrumentation-http
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-instrumentation-http&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/instrumentation-http
[npm-img]: https://badge.fury.io/js/%40opentelemetry%instrumentation-http.svg
