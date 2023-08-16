# OpenTelemetry Collector Metrics Exporter for web and node

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

**Note: This is an experimental package under active development. New releases may include breaking changes.**

This module provides a metrics-exporter for OTLP (http/json) using protocol version `v0.20.0`.

## Installation

```bash
npm install --save @opentelemetry/exporter-metrics-otlp-http
```

## Service Name

The OpenTelemetry Collector Metrics Exporter does not have a service name configuration.
In order to set the service name, use the `service.name` resource attribute as prescribed in
the [OpenTelemetry Resource Semantic Conventions][semconv-resource-service-name].
To see sample code and documentation for the traces exporter, visit
the [Collector Trace Exporter for web and node][trace-exporter-url].

## Metrics in Web

The OTLPMetricExporter in Web expects the endpoint to end in `/v1/metrics`.

```js
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';

const collectorOptions = {
  url: '<opentelemetry-collector-url>', // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
  headers: {}, // an optional object containing custom headers to be sent with each request
  concurrencyLimit: 1, // an optional limit on pending requests
};
const metricExporter = new OTLPMetricExporter(collectorOptions);
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
const { MeterProvider, PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const collectorOptions = {
  url: '<opentelemetry-collector-url>', // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
  concurrencyLimit: 1, // an optional limit on pending requests
};
const metricExporter = new OTLPMetricExporter(collectorOptions);
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

## Environment Variable Configuration

In addition to settings passed to the constructor, the exporter also supports configuration via environment variables:

| Environment variable                              | Description                                                                                                                                                                                                                                                                                                                                                                                                                |
|---------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| OTEL_EXPORTER_OTLP_ENDPOINT                       | The endpoint to send metrics to. This will also be used for the traces exporter if `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` is not configured. By default `http://localhost:4318` will be used. `/v1/metrics` will be automatically appended to configured values.                                                                                                                                                             |
| OTEL_EXPORTER_OTLP_METRICS_ENDPOINT               | The endpoint to send metrics to. By default `https://localhost:4318/v1/metrics` will be used. `v1/metrics` will not be appended automatically and has to be added explicitly.                                                                                                                                                                                                                                              |
| OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE | The exporters aggregation temporality preference. Valid values are `cumulative`, `delta`, and `lowmemory`. `cumulative` selects cumulative temporality for all instrument kinds. `delta` selects delta aggregation temporality for Counter, Asynchronous Counter and Histogram instrument kinds, and selects cumulative aggregation for UpDownCounter and Asynchronous UpDownCounter instrument kinds. `lowmemory` selects delta aggregation temporality for Counter and Histogram instrument kinds, and selects cumulative aggregation for UpDownCounter, Asynchronous Counter and Asynchronous UpDownCounter instrument kinds. By default `cumulative` is used. |

> Settings configured programmatically take precedence over environment variables. Per-signal environment variables take
> precedence over non-per-signal environment variables.

## Running opentelemetry-collector locally to see the metrics

1. Go to `examples/otlp-exporter-node`
2. Follow the instructions there to observe the metrics.

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]
- For exporting metrics via gRPC please check [exporter-metrics-otlp-grpc][npm-url-grpc]
- For exporting metrics via protobuf please check [exporter-metrics-otlp-proto][npm-url-proto]

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
