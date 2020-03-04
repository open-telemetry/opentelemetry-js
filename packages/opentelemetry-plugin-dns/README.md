# OpenTelemetry DNS Instrumentation for Node.js
[![Gitter chat][gitter-image]][gitter-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

This module provides automatic instrumentation for [`dns`](http://nodejs.org/dist/latest/docs/api/dns.html).

For automatic instrumentation see the
[@opentelemetry/node](https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-node) package.

## Installation

```bash
npm install --save @opentelemetry/plugin-dns
```

## Usage

```js
const { NodeTracerProvider } = require('@opentelemetry/node');

const provider = new NodeTracerProvider({
  plugins: {
    dns: {
      enabled: true,
      // You may use a package name or absolute path to the file.
      path: '@opentelemetry/plugin-dns',
      // dns plugin options
    }
  }
});
```

### Zipkin

If you use Zipkin, you must use `ignoreHostnames` in order to not trace those calls. If the server is local. You can set :

```js
const provider = new NodeTracerProvider({
  plugins: {
    dns: {
      enabled: true,
      // You may use a package name or absolute path to the file.
      path: '@opentelemetry/plugin-dns',
      ignoreHostnames: ['localhost']
    }
  }
});
```

### Dns Plugin Options

Dns plugin has currently one option. You can set the following:

| Options | Type | Description |
| ------- | ---- | ----------- |
| [`ignoreHostnames`](https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-plugin-dns/src/types.ts#L98) | `IgnoreMatcher[]` | Dns plugin will not trace all requests that match hostnames |

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
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-plugin-dns
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-plugin-dns
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-plugin-dns
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-plugin-dns&type=dev
