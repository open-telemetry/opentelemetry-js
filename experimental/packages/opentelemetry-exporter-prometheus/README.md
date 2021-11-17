# OpenTelemetry Prometheus Metric Exporter

[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

The OpenTelemetry Prometheus Metrics Exporter allows the user to send collected [OpenTelemetry Metrics](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-sdk-metrics-base) to Prometheus.

[Prometheus](https://prometheus.io/) is a monitoring system that collects metrics, by scraping exposed endpoints at regular intervals, evaluating rule expressions. It can also trigger alerts if certain conditions are met. For assistance setting up Prometheus, [Click here](https://opencensus.io/codelabs/prometheus/#0) for a guided codelab.

## Work In Progress

The OpenTelemetry SDK in this directory is undergoing drastic changes. If you need to use metrics, we recommend you use [version `0.27.0`](https://github.com/open-telemetry/opentelemetry-js/blob/experimental/v0.27.0/experimental/packages/opentelemetry-exporter-prometheus).

## Installation

```bash
npm install --save "@opentelemetry/sdk-metrics-base~0.27.0"
npm install --save "@opentelemetry/exporter-prometheus~0.27.0"
```

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- To learn more about Prometheus, visit: <https://prometheus.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[dependencies-image]: https://status.david-dm.org/gh/open-telemetry/opentelemetry-js.svg?path=experimental%2Fpackages%2Fopentelemetry-exporter-prometheus
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=experimental%2Fpackages%2Fopentelemetry-exporter-prometheus
[devDependencies-image]: https://status.david-dm.org/gh/open-telemetry/opentelemetry-js.svg?path=experimental%2Fpackages%2Fopentelemetry-exporter-prometheus&type=dev
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=experimental%2Fpackages%2Fopentelemetry-exporter-prometheus&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/exporter-prometheus
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fexporter-prometheus.svg
