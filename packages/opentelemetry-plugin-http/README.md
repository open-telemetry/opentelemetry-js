# OpenTelemetry HTTP Instrumentation for Node.js

[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

This module provides automatic instrumentation for [`http`](https://nodejs.org/api/http.html).

For automatic instrumentation see the
[@opentelemetry/node](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-node) package.

## Installation

```bash
npm install --save @opentelemetry/plugin-http
```

## Usage

OpenTelemetry HTTP Instrumentation allows the user to automatically collect trace data and export them to their backend of choice, to give observability to distributed systems.

To load a specific plugin (HTTP in this case), specify it in the Node Tracer's configuration.

```js
const { NodeTracerProvider } = require('@opentelemetry/node');

const provider = new NodeTracerProvider({
  plugins: {
    http: {
      enabled: true,
      // You may use a package name or absolute path to the file.
      path: '@opentelemetry/plugin-http',
      // http plugin options
    }
  }
});
```

To load all of the [supported plugins](https://github.com/open-telemetry/opentelemetry-js#plugins), use below approach. Each plugin is only loaded when the module that it patches is loaded; in other words, there is no computational overhead for listing plugins for unused modules.

```js
const { NodeTracerProvider } = require('@opentelemetry/node');

const provider = new NodeTracerProvider();
```

See [examples/http](https://github.com/open-telemetry/opentelemetry-js/tree/main/examples/http) for a short example.

### Http Plugin Options

Http plugin has few options available to choose from. You can set the following:

| Options | Type | Description |
| ------- | ---- | ----------- |
| [`applyCustomAttributesOnSpan`](https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-plugin-http/src/types.ts#L52) | `HttpCustomAttributeFunction` | Function for adding custom attributes |
| [`requestHook`](https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-plugin-http/src/types.ts#L60) | `HttpRequestCustomAttributeFunction` | Function for adding custom attributes before request is handled |
| [`responseHook`](https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-plugin-http/src/types.ts#L67) | `HttpResponseCustomAttributeFunction` | Function for adding custom attributes before response is handled |
| [`ignoreIncomingPaths`](https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-plugin-http/src/types.ts#L28) | `IgnoreMatcher[]` | Http plugin will not trace all incoming requests that match paths |
| [`ignoreOutgoingUrls`](https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-plugin-http/src/types.ts#L28) | `IgnoreMatcher[]` | Http plugin will not trace all outgoing requests that match urls |
| [`serverName`](https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-plugin-http/src/types.ts#L28) | `string` | The primary server name of the matched virtual host. |
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
[dependencies-image]: https://status.david-dm.org/gh/open-telemetry/opentelemetry-js.svg?path=packages%2Fopentelemetry-plugin-http
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-plugin-http
[devDependencies-image]: https://status.david-dm.org/gh/open-telemetry/opentelemetry-js.svg?path=packages%2Fopentelemetry-plugin-http&type=dev
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-plugin-http&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/plugin-http
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fplugin-http.svg
