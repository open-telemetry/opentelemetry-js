# OpenTelemetry Collector Metrics Exporter for node with protobuf

[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

This module provides exporter for node to be used with [opentelemetry-collector][opentelemetry-collector-url] - last tested with version **0.25.0**.

## Work In Progress

The OpenTelemetry SDK in this directory is undergoing drastic changes. If you need to use metrics, we recommend you use [version `0.27.0`](https://github.com/open-telemetry/opentelemetry-js/blob/experimental/v0.27.0/experimental/packages/opentelemetry-exporter-metrics-otlp-grpc).

## Installation

```bash
npm install --save "@opentelemetry/exporter-metrics-otlp-proto~0.27.0"
```

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[dependencies-image]: https://status.david-dm.org/gh/open-telemetry/opentelemetry-js.svg?path=experimental%2Fpackages%2Fopentelemetry-exporter-metrics-otlp-proto
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=experimental%2Fpackages%2Fopentelemetry-exporter-metrics-otlp-proto
[devDependencies-image]: https://status.david-dm.org/gh/open-telemetry/opentelemetry-js.svg?path=experimental%2Fpackages%2Fopentelemetry-exporter-metrics-otlp-proto&type=dev
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=experimental%2Fpackages%2Fopentelemetry-exporter-metrics-otlp-proto&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/exporter-metrics-otlp-proto
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fexporter-metrics-otlp-proto.svg
[opentelemetry-collector-url]: https://github.com/open-telemetry/opentelemetry-collector
[semconv-resource-service-name]: https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/resource/semantic_conventions/README.md#service
[trace-exporter-url]: https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-exporter-trace-otlp-http
