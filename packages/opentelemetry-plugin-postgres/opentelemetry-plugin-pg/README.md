# OpenTelemetry Postgres Instrumentation for Node.js
[![Gitter chat][gitter-image]][gitter-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

This module provides automatic instrumentation for [`pg`](https://github.com/brianc/node-postgres).

For automatic instrumentation see the
[@opentelemetry/node](https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-node) package.

## Installation

```bash
npm install --save @opentelemetry/plugin-pg
npm install --save @opentelemetry/plugin-pg-pool
```

## Usage

To load all of the [default supported plugins](https://github.com/open-telemetry/opentelemetry-js#plugins), use the below approach. Each plugin is only loaded when the module that it patches is loaded; in other words, there is no computational overhead for listing plugins for unused modules.

```js
const { NodeTracerProvider } = require('@opentelemetry/node');

const provider = new NodeTracerProvider(); // All default plugins will be used
```

If instead you would just want to load a specific plugin (**pg** in this case), specify it in the `NodeTracer` configuration.

```js
const { NodeTracerProvider } = require('@opentelemetry/node');

const provider = new NodeTracerProvider({
  plugins: {
    pg: {
      enabled: true,
      // You may use a package name or absolute path to the module
      path: '@opentelemetry/plugin-pg',
    }
  }
});
```

If you are using any of the [`pg.Pool`](https://node-postgres.com/api/pool) APIs, you will also need to include the [`pg-pool` plugin](../opentelemetry-plugin-pg-pool).

```js
const { NodeTracerProvider } = require('@opentelemetry/node');

const provider = new NodeTracerProvider({
  plugins: {
    pg: {
      enabled: true,
      // You may use a package name or absolute path to the module
      path: '@opentelemetry/plugin-pg',
    },
    'pg-pool': {
      enabled: true,
      // You may use a package name or absolute path to the module
      path: '@opentelemetry/plugin-pg-pool',
    },
  }
});
```

See [examples/postgres](https://github.com/open-telemetry/opentelemetry-js/tree/master/examples/postgres) for a short example.

## Supported Versions

- [pg](https://npmjs.com/package/pg): `7.x`
- [pg-pool](https://npmjs.com/package/pg-pool): `2.x` (Installed by `pg`)

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
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-plugin-pg
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-plugin-pg
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-plugin-pg
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-plugin-pg&type=dev
