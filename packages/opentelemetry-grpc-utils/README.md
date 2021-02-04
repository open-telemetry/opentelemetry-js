# OpenTelemetry gRPC Instrumentation for Node.js

[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

This module provides automatic instrumentation for [`grpc`](https://grpc.github.io/grpc/node/). Currently, version [`1.x`](https://www.npmjs.com/package/grpc?activeTab=versions) of the Node.js gRPC library is supported.

For automatic instrumentation see the
[@opentelemetry/node](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-node) package.

## Installation

```sh
npm install --save @opentelemetry/plugin-grpc
```

## Usage

OpenTelemetry gRPC Instrumentation allows the user to automatically collect trace data and export them to the backend of choice, to give observability to distributed systems when working with [gRPC](https://www.npmjs.com/package/grpc).

To load a specific plugin (**gRPC** in this case), specify it in the Node Tracer's configuration.

```javascript
const { NodeTracerProvider } = require('@opentelemetry/node');

const provider = new NodeTracerProvider({
  plugins: {
    grpc: {
      enabled: true,
      // You may use a package name or absolute path to the file.
      path: '@opentelemetry/plugin-grpc',
    }
  }
});
```

To load all of the [supported plugins](https://github.com/open-telemetry/opentelemetry-js#plugins), use below approach. Each plugin is only loaded when the module that it patches is loaded; in other words, there is no computational overhead for listing plugins for unused modules.

```javascript
const { NodeTracerProvider } = require('@opentelemetry/node');

const provider = new NodeTracerProvider();
```

See [examples/grpc](https://github.com/open-telemetry/opentelemetry-js/tree/main/examples/grpc) for a short example.

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-plugin-grpc
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-plugin-grpc
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-plugin-grpc
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-plugin-grpc&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/plugin-grpc
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fplugin-grpc.svg
