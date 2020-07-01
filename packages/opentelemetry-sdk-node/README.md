# OpenTelemetry SDK for NodeJS

[![Gitter chat][gitter-image]][gitter-url]
[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

@ToDo
This package provides...

## Quick Start

@ToDo
To get started you need to ...

### Installation

```sh
$ # Install the SDK
$ npm install @opentelemetry/sdk-node

$ # Install exporters and plugins
$ npm install \
    @opentelemetry/exporter-jaeger \ # add tracing exporters as needed
    @opentelemetry/exporter-prometheus # add metrics exporters as needed
    @opentelemetry/plugin-http # add plugins as needed
```

> Note: this example is for Node.js. See [examples/tracer-web](https://github.com/open-telemetry/opentelemetry-js/tree/master/examples/tracer-web) for a browser example.

### Initialize the SDK

Before any other module in your application is loaded, you must initialize the SDK.
If you fail to initialize the SDK or initialize it too late, no-op implementations will be provided to any library which acquires a tracer or meter from the API.
This example uses Jaeger and Prometheus, but exporters exist for [other tracing backends][other-tracing-backends].

```javascript
const opentelemetry = require("@opentelemetry/sdk-node");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");
const { PrometheusExporter } = require("@opentelemetry/exporter-prometheus");

const jaegerExporter = new JaegerExporter({
  serviceName: 'my-service',
});
const prometheusExporter = new PrometheusExporter({ startServer: true });

const sdk = new opentelemetry.NodeSDK({
  // Optional - if omitted, the tracing SDK will not be initialized
  traceExporter: jaegerExporter,
  // Optional - If omitted, the metrics SDK will not be initialized
  metricExporter: prometheusExporter,

  // See the Configuration section below for additional  configuration options
});

// You can optionally detect resources asynchronously from the environment.
// Detected resources are merged with the resources provided in the SDK configuration.
sdk
  .autoDetectResources()
  .then(() => {
    sdk.start();
  })
```

## Configuration

@ToDo add descriptions for all configurations

### contextManager

### httpTextPropagator

### logger

### logLevel

### metricBatcher

### metricExporter

### metricInterval

### metricResource

### plugins

### resource

### sampler

### traceExporter

### traceParams

### traceResource

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
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-sdk-node
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-sdk-node
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-sdk-node
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-sdk-node&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/sdk-node
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fsdk-node.svg

[other-tracing-backends]: https://github.com/open-telemetry/opentelemetry-js#trace-exporters
