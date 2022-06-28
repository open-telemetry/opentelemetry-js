# OpenTelemetry Collector Metrics Exporter for node with protobuf

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

This module provides exporter for node to be used with [opentelemetry-collector][opentelemetry-collector-url].
Compatible with [opentelemetry-collector][opentelemetry-collector-url] versions `>=0.32 <=0.53`.

## Installation

```bash
npm install --save @opentelemetry/exporter-metrics-otlp-proto
```

## Service Name

The OpenTelemetry Collector Exporter does not have a service name configuration.
In order to set the service name, use the `service.name` resource attribute as prescribed in the [OpenTelemetry Resource Semantic Conventions][semconv-resource-service-name].
To see sample code and documentation for the traces exporter, visit the [Collector Trace Exporter for web and node][trace-exporter-url].

## Metrics in Node - PROTO over http

```js
const { MeterProvider, PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics-base');
const { OTLPMetricExporter } =  require('@opentelemetry/exporter-metrics-otlp-proto');
const collectorOptions = {
  url: '<opentelemetry-collector-url>', // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
};
const exporter = new OTLPMetricExporter(collectorOptions);
const meterProvider = new MeterProvider({});

meterProvider.addMetricReader(new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 1000,
}));

// Now, start recording data
const meter = meterProvider.getMeter('example-meter');
const counter = meter.createCounter('metric_name');
counter.add(10, { 'key': 'value' });

```

## Running opentelemetry-collector locally to see the metrics

1. Go to `examples/otlp-exporter-node`
2. Follow the instructions there to observe the metrics.

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@opentelemetry/exporter-metrics-otlp-proto
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fexporter-metrics-otlp-proto.svg
[opentelemetry-collector-url]: https://github.com/open-telemetry/opentelemetry-collector
[semconv-resource-service-name]: https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/resource/semantic_conventions/README.md#service
[trace-exporter-url]: https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/exporter-trace-otlp-http
