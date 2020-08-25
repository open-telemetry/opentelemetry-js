# OpenTelemetry Collector Exporter for node with protobuf

[![Gitter chat][gitter-image]][gitter-url]
[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

This module provides exporter for web and node to be used with [opentelemetry-collector][opentelemetry-collector-url] - last tested with version **0.6.0**.

## Installation

```bash
npm install --save @opentelemetry/exporter-collector-proto
```

## Traces in Node - PROTO over http

```js
const { BasicTracerProvider, SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { CollectorExporter } =  require('@opentelemetry/exporter-collector-proto');

const collectorOptions = {
  serviceName: 'basic-service',
  url: '<opentelemetry-collector-url>', // url is optional and can be omitted - default is http://localhost:55681/v1/trace
  headers: {
    foo: 'bar'
  }, //an optional object containing custom headers to be sent with each request will only work with http
};

const provider = new BasicTracerProvider();
const exporter = new CollectorExporter(collectorOptions);
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

provider.register();

```

## Metrics in Node - PROTO over http

```js
const { MeterProvider } = require('@opentelemetry/metrics');
const { CollectorMetricExporter } =  require('@opentelemetry/exporter-collector-proto');
const collectorOptions = {
  serviceName: 'basic-service',
  url: '<opentelemetry-collector-url>', // url is optional and can be omitted - default is http://localhost:55681/v1/metrics
};
const exporter = new CollectorMetricExporter(collectorOptions);

// Register the exporter
const meter = new MeterProvider({
  exporter,
  interval: 60000,
}).getMeter('example-meter');

// Now, start recording data
const counter = meter.createCounter('metric_name');
counter.add(10, { 'key': 'value' });

```

## Running opentelemetry-collector locally to see the traces

1. Go to examples/collector-exporter-node
2. run `npm run docker:start`
3. Open page at `http://localhost:9411/zipkin/` to observe the traces

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
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-exporter-collector-proto
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-exporter-collector-proto
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-exporter-collector-proto
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-exporter-collector-proto&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/exporter-collector-proto
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fexporter-collector-proto.svg
[opentelemetry-collector-url]: https://github.com/open-telemetry/opentelemetry-collector
