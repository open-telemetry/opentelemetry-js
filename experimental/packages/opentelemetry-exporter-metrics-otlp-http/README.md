# OpenTelemetry Collector Metrics Exporter for web and node

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

This module provides exporter for web and node to be used with [opentelemetry-collector][opentelemetry-collector-url].
Compatible with [opentelemetry-collector][opentelemetry-collector-url] versions `>=0.52 <=0.53`.

## Installation

```bash
npm install --save @opentelemetry/exporter-metrics-otlp-http
```

## Service Name

The OpenTelemetry Collector Metrics Exporter does not have a service name configuration.
In order to set the service name, use the `service.name` resource attribute as prescribed in the [OpenTelemetry Resource Semantic Conventions][semconv-resource-service-name].
To see sample code and documentation for the traces exporter, visit the [Collector Trace Exporter for web and node][trace-exporter-url].

## Metrics in Web

The OTLPMetricExporter in Web expects the endpoint to end in `/v1/metrics`.

```js
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics-base';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
const collectorOptions = {
  url: '<opentelemetry-collector-url>', // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
  headers: {}, // an optional object containing custom headers to be sent with each request
  concurrencyLimit: 1, // an optional limit on pending requests
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

## Metrics in Node

```js
const { MeterProvider, PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics-base');
const { OTLPMetricExporter } =  require('@opentelemetry/exporter-metrics-otlp-http');
const collectorOptions = {
  url: '<opentelemetry-collector-url>', // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
  concurrencyLimit: 1, // an optional limit on pending requests
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

## GRPC

For exporting metrics with GRPC please check [exporter-metrics-otlp-grpc][npm-url-grpc]

## PROTOBUF

For exporting metrics with PROTOBUF please check [exporter-metrics-otlp-proto][npm-url-proto]

## Configuration options as environment variables

Instead of providing options to `OTLPMetricExporter` and `OTLPTraceExporter` explicitly, environment variables may be provided instead.

```sh
OTEL_EXPORTER_OTLP_ENDPOINT=https://localhost:4318
# this will automatically append the version and signal path
# e.g. https://localhost:4318/v1/traces for `OTLPTraceExporter` and https://localhost:4318/v1/metrics for `OTLPMetricExporter`
```

If the trace and metric exporter endpoints have different providers, the env var for per-signal endpoints are available to use

```sh
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=https://trace-service:4318/v1/traces
OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=https://metric-service:4318/v1/metrics
# version and signal needs to be explicit
```

> The per-signal endpoints take precedence and overrides `OTEL_EXPORTER_OTLP_ENDPOINT`

For more details, see [OpenTelemetry Specification on Protocol Exporter][opentelemetry-spec-protocol-exporter].

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
[npm-url]: https://www.npmjs.com/package/@opentelemetry/exporter-metrics-otlp-http
[npm-url-grpc]: https://www.npmjs.com/package/@opentelemetry/exporter-metrics-otlp-grpc
[npm-url-proto]: https://www.npmjs.com/package/@opentelemetry/exporter-metrics-otlp-proto
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fexporter-metrics-otlp-http.svg
[opentelemetry-collector-url]: https://github.com/open-telemetry/opentelemetry-collector
[opentelemetry-spec-protocol-exporter]: https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/exporter.md#configuration-options
[semconv-resource-service-name]: https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/resource/semantic_conventions/README.md#service
[trace-exporter-url]: https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/exporter-trace-otlp-http
