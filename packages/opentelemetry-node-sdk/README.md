# OpenTelemetry Node SDK
[![Gitter chat][gitter-image]][gitter-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

This module provides *automated instrumentation and tracing* for Node.js applications.

For manual instrumentation see the
[@opentelemetry/basic-tracer](https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-basic-tracer) package.

## How does automated instrumentation work?
node-sdk exposes a `NodeTracer` that will automatically hook into the module loader of Node.js.

For this to work, please make sure that `NodeTracer` is initialized before any other module of your application, (like `http` or `express`) is loaded.

OpenTelemetry comes with a growing number of instrumentation plugins for well know modules (see [supported modules](https://github.com/open-telemetry/opentelemetry-js#plugins)) and an API to create custom plugins (see [the plugin developer guide](https://github.com/open-telemetry/opentelemetry-js/blob/master/doc/plugin-guide.md)).


Whenever a module is loaded `NodeTracer` will check if a matching instrumentation plugin has been installed.

> **Please note:** This module does *not* bundle any plugins. They need to be installed separately.

If the respective plugin was found, it will be used to patch the original module to add instrumentation code.
This is done by wrapping all tracing-relevant functions.

This instrumentation code will automatically
- extract a trace-context identifier from inbound requests to allow distributed tracing (if applicable)
- make sure that this current trace-context is propagated while the transaction traverses an application (see [@opentelemetry/opentelemetry-scope-base](https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-scope-base/README.md) for an in-depth explanation)
- add this trace-context identifier to outbound requests to allow continuing the distributed trace on the next hop (if applicable)
- create and end spans

In short, this means that this module will use provided plugins to automatically instrument your application to produce spans and provide end-to-end tracing by just adding a few lines of code.

## Creating custom spans on top of auto-instrumentation
Additionally to automated instrumentation, `NodeTracer` exposes the same API as [@opentelemetry/basic-tracer](https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-basic-tracer), allowing creating custom spans if needed.

## Installation

```bash
npm install --save @opentelemetry/core
npm install --save @opentelemetry/node-sdk

# Install instrumentation plugins
npm install --save @opentelemetry/plugin-http
npm install --save @opentelemetry/plugin-grpc
```

## Usage

The following code will configure the `NodeTracer` to instrument `http` using `@opentelemetry/plugin-http`.

```js
const opentelemetry = require('@opentelemetry/core');
const { NodeTracer } = require('@opentelemetry/node-sdk');

// Create and configure NodeTracer
const tracer = new NodeTracer({
  plugins: {
    http: {
      enabled: true,
      // You may use a package name or absolute path to the file.
      path: '@opentelemetry/plugin-http',
      // http plugin options
    }
  }
});

// Initialize the tracer
opentelemetry.initGlobalTracer(tracer);

// Your application code - http will automatically be instrumented if
// @opentelemetry/plugin-http is present
const http = require('http');
```

To enable instrumentation for all [supported modules](https://github.com/open-telemetry/opentelemetry-js#plugins), create an instance of `NodeTracer` without providing any plugin configuration to the constructor.

```js
const opentelemetry = require('@opentelemetry/core');
const { NodeTracer } = require('@opentelemetry/node-sdk');

// Create and initialize NodeTracer
const tracer = new NodeTracer();

// Initialize the tracer
opentelemetry.initGlobalTracer(tracer);

// Your application code
// ...
```

## Examples
See how to automatically instrument [http](https://github.com/open-telemetry/opentelemetry-js/tree/master/examples/http) and [gRPC](https://github.com/open-telemetry/opentelemetry-js/tree/master/examples/grpc) using node-sdk.


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
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-node-sdk
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-node-sdk
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-node-sdk
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-node-sdk&type=dev
