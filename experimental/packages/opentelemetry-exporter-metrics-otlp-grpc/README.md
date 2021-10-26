# OpenTelemetry Collector Metrics Exporter for node with grpc

[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

This module provides exporter for web and node to be used with [opentelemetry-collector][opentelemetry-collector-url] - last tested with version **0.25.0**.

## Installation

```bash
npm install --save @opentelemetry/exporter-metrics-otlp-grpc
```

## Service Name

The OpenTelemetry Collector Exporter does not have a service name configuration.
In order to set the service name, use the `service.name` resource attribute as prescribed in the [OpenTelemetry Resource Semantic Conventions][semconv-resource-service-name].
To see sample code and documentation for the traces exporter, as well as instructions for using TLS, visit the [Collector Trace Exporter for web and node][trace-exporter-url].

## Metrics in Node - GRPC

The OTLPTraceExporter in Node expects the URL to only be the hostname. It will not work with `/v1/metrics`. All options that work with trace also work with metrics.

```js
const { MeterProvider } = require('@opentelemetry/sdk-metrics-base');
const { OTLPMetricExporter } =  require('@opentelemetry/exporter-metrics-otlp-grpc');
const collectorOptions = {
  // url is optional and can be omitted - default is grpc://localhost:4317
  url: 'grpc://<collector-hostname>:<port>',
};
const exporter = new OTLPMetricExporter(collectorOptions);

// Register the exporter
const provider = new MeterProvider({
  exporter,
  interval: 60000,
})
['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => provider.shutdown().catch(console.error));
});

// Now, start recording data
const meter = provider.getMeter('example-meter');
const counter = meter.createCounter('metric_name');
counter.add(10, { 'key': 'value' });
```

## Running opentelemetry-collector locally to see the metrics

1. Go to examples/otlp-exporter-node
2. run `npm run docker:start`
3. Open page at `http://localhost:9411/zipkin/` to observe the metrics

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[dependencies-image]: https://status.david-dm.org/gh/open-telemetry/opentelemetry-js.svg?path=experimental%2Fpackages%2Fopentelemetry-exporter-metrics-otlp-grpc
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=experimental%2Fpackages%2Fopentelemetry-exporter-metrics-otlp-grpc
[devDependencies-image]: https://status.david-dm.org/gh/open-telemetry/opentelemetry-js.svg?path=experimental%2Fpackages%2Fopentelemetry-exporter-metrics-otlp-grpc&type=dev
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=experimental%2Fpackages%2Fopentelemetry-exporter-metrics-otlp-grpc&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/exporter-metrics-otlp-grpc
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fexporter-metrics-otlp-grpc.svg
[opentelemetry-collector-url]: https://github.com/open-telemetry/opentelemetry-collector
[semconv-resource-service-name]: https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/resource/semantic_conventions/README.md#service
[trace-exporter-url]: https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-exporter-trace-otlp-grpc
