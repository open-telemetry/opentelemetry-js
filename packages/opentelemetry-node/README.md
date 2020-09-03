# OpenTelemetry Node SDK

[![Gitter chat][gitter-image]][gitter-url]
[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

This module provides *automated instrumentation and tracing* for Node.js applications.

For manual instrumentation see the
[@opentelemetry/tracing](https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-tracing) package.

## How auto instrumentation works

This package exposes a `NodeTracerProvider` that will automatically hook into the module loader of Node.js.

For this to work, please make sure that `NodeTracerProvider` is initialized before any other module of your application, (like `http` or `express`) is loaded.

OpenTelemetry comes with a growing number of instrumentation plugins for well know modules (see [supported modules](https://github.com/open-telemetry/opentelemetry-js#plugins)) and an API to create custom plugins (see [the plugin developer guide](https://github.com/open-telemetry/opentelemetry-js/blob/master/doc/plugin-guide.md)).

Whenever a module is loaded `NodeTracerProvider` will check if a matching instrumentation plugin has been installed.

> **Please note:** This module does *not* bundle any plugins. They need to be installed separately.

If the respective plugin was found, it will be used to patch the original module to add instrumentation code.
This is done by wrapping all tracing-relevant functions.

This instrumentation code will automatically

- extract a trace-context identifier from inbound requests to allow distributed tracing (if applicable)
- make sure that this current trace-context is propagated while the transaction traverses an application (see [@opentelemetry/context-base](https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-context-base/README.md) for an in-depth explanation)
- add this trace-context identifier to outbound requests to allow continuing the distributed trace on the next hop (if applicable)
- create and end spans

In short, this means that this module will use provided plugins to automatically instrument your application to produce spans and provide end-to-end tracing by just adding a few lines of code.

## Creating custom spans on top of auto-instrumentation

Additionally to automated instrumentation, `NodeTracerProvider` exposes the same API as [@opentelemetry/tracing](https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-tracing), allowing creating custom spans if needed.

## Installation

```bash
npm install --save @opentelemetry/api
npm install --save @opentelemetry/node

# Install instrumentation plugins
npm install --save @opentelemetry/plugin-http
npm install --save @opentelemetry/plugin-https
```

## Usage

The following code will configure the `NodeTracerProvider` to instrument `http`
(and any other installed [supported
modules](https://github.com/open-telemetry/opentelemetry-js#plugins))
using `@opentelemetry/plugin-http`.

```js
const { NodeTracerProvider } = require('@opentelemetry/node');

// Create and configure NodeTracerProvider
const provider = new NodeTracerProvider();

// Initialize the provider
provider.register()

// Your application code - http will automatically be instrumented if
// @opentelemetry/plugin-http is present
const http = require('http');
```

## Plugin configuration

User supplied plugin configuration is merged with the default plugin
configuration. Furthermore, custom plugins that are configured are implicitly
enabled just as default plugins are.

In the following example:

- the default express plugin is disabled
- the http plugin has a custom config for a `requestHook`
- the customPlugin is loaded from the user supplied path
- all default plugins are still loaded if installed.

```js
const provider = new NodeTracerProvider({
  plugins: {
    express: {
      enabled: false,
    },
    http: {
      requestHook: (span, request) => {
        span.setAttribute("custom request hook attribute", "request");
      },
    },
    customPlugin: {
      path: "/path/to/custom/module",
    },
  },
});
```

### Disable Plugins with Environment Variables

Plugins can be disabled without modifying and redeploying code.
`OTEL_NO_PATCH_MODULES` accepts a
comma separated list of module names to disabled specific plugins.
The names should match what you use to `require` the module into your application.
For example, `OTEL_NO_PATCH_MODULES=pg,https` will disable the postgres plugin and the https plugin. To disable **all** plugins, set the environment variable to `*`.

## Examples

See how to automatically instrument [http](https://github.com/open-telemetry/opentelemetry-js/tree/master/examples/http) and [gRPC](https://github.com/open-telemetry/opentelemetry-js/tree/master/examples/grpc) / [grpc-js](https://github.com/open-telemetry/opentelemetry-js/tree/master/examples/grpc-js) using node-sdk.

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
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-node
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-node
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-node
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-node&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/node
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fnode.svg
