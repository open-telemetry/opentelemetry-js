# OpenTelemetry Express Instrumentation for Node.js
[![Gitter chat][gitter-image]][gitter-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

This module provides automatic instrumentation for [`express`](https://github.com/expressjs/express).

For automatic instrumentation see the
[@opentelemetry/node](https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-node) package.

## Installation

```bash
npm install --save @opentelemetry/plugin-express
```
### Supported Versions
 - `^4.0.0`

## Usage

OpenTelemetry Express Instrumentation allows the user to automatically collect trace data and export them to their backend of choice, to give observability to distributed systems.

To load a specific plugin (express in this case), specify it in the Node Tracer's configuration.
```js
const { NodeTracerProvider } = require('@opentelemetry/node');

const provider = new NodeTracerProvider({
  plugins: {
    express: {
      enabled: true,
      // You may use a package name or absolute path to the file.
      path: '@opentelemetry/plugin-express',
    }
  }
});
```

To load all the [supported plugins](https://github.com/open-telemetry/opentelemetry-js#plugins), use below approach. Each plugin is only loaded when the module that it patches is loaded; in other words, there is no computational overhead for listing plugins for unused modules.
```js
const { NodeTracerProvider } = require('@opentelemetry/node');

const provider = new NodeTracerProvider();
```

See [examples/express](https://github.com/open-telemetry/opentelemetry-js/tree/master/examples/express) for a short example.

### Caveats

Because of the way express works, it's hard to correctly compute the time taken by asynchronous middlewares and request handlers. For this reason, the time you'll see reported for asynchronous middlewares and request handlers will only represent the synchronous execution time, and **not** any asynchronous work.

### Express Plugin Options

Express plugin has few options available to choose from. You can set the following:

| Options | Type | Description |
| ------- | ---- | ----------- |
| `ignoreLayers` | `IgnoreMatcher[]` | Express plugin will not trace all layers that match. |
| `ignoreLayersType`| `ExpressLayerType[]` | Express plugin will ignore the layers that match based on their type. |

For reference, here are the three different layer type:
  - `router` is the name of `express.Router()`
  - `middleware`
  - `request_handler` is the name for anything thats not a router or a middleware.

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
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-plugin-express
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-plugin-express
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-plugin-express
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-plugin-express&type=dev
