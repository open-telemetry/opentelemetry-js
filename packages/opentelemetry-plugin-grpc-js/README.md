# OpenTelemetry @grpc/grpc-js Instrumentation for Node.js

[![Gitter chat][gitter-image]][gitter-url]
[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

This module provides automatic instrumentation for [`@grpc/grpc-js`](https://grpc.io/blog/grpc-js-1.0/). Currently, version [`1.x`](https://www.npmjs.com/package/@grpc/grpc-js?activeTab=versions) of `@grpc/grpc-js` is supported.

For automatic instrumentation see the
[@opentelemetry/node](https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-node) package.

## Installation

```sh
npm install --save @opentelemetry/plugin-grpc-js
```

## Usage

OpenTelemetry gRPC Instrumentation allows the user to automatically collect trace data and export them to the backend of choice, to give observability to distributed systems when working with [gRPC](https://www.npmjs.com/package/@grpc/grpc-js).

To load a specific plugin (**gRPC** in this case), specify it in the Node Tracer's configuration.

```javascript
const { NodeTracerProvider } = require('@opentelemetry/node');

const provider = new NodeTracerProvider({
  plugins: {
    '@grpc/grpc-js': {
      enabled: true,
      // You may use a package name or absolute path to the file.
      path: '@opentelemetry/plugin-grpc-js',
      // gRPC-js plugin options
    }
  }
});
```

To load all of the [supported plugins](https://github.com/open-telemetry/opentelemetry-js#plugins), use below approach. Each plugin is only loaded when the module that it patches is loaded; in other words, there is no computational overhead for listing plugins for unused modules.

```javascript
const { NodeTracerProvider } = require('@opentelemetry/node');

const provider = new NodeTracerProvider();
```

<!-- See [examples/grpc-js](https://github.com/open-telemetry/opentelemetry-js/tree/master/examples/grpc-js) for a short example. -->

### gRPC-js Plugin Options

gRPC-js plugin accepts the following configuration:

| Options | Type | Description |
| ------- | ---- | ----------- |
| [`ignoreGrpcMethods`](https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-plugin-grpc-js/src/types.ts#L24) | `IgnoreMatcher[]` | gRPC plugin will not trace any methods that match anything in this list. You may pass a string (case-insensitive match), a `RegExp` object, or a filter function. |

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
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-plugin-grpc-js
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-plugin-grpc-js
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-plugin-grpc-js
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-plugin-grpc-js&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/plugin-grpc-js
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fplugin-grpc-js.svg
