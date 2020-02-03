# OpenTelemetry Prometheus Exporter
[![Gitter chat][gitter-image]][gitter-url]
[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

The OpenTelemetry Prometheus Metrics Exporter allows the user to send collected [OpenTelemetry Metrics](https://github.com/open-telemetry/opentelemetry-js/tree/master/packages/opentelemetry-metrics) to Prometheus.

[Prometheus](https://prometheus.io/) is a monitoring system that collects metrics, by scraping exposed endpoints at regular intervals, evaluating rule expressions. It can also trigger alerts if certain conditions are met. For assistance setting up Prometheus, [Click here](https://opencensus.io/codelabs/prometheus/#0) for a guided codelab.

## Installation

```bash
npm install --save @opentelemetry/metrics
npm install --save @opentelemetry/exporter-prometheus
```

## Usage

Create & register the exporter on your application.

```js
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const { MeterProvider }  = require('@opentelemetry/metrics');

// Add your port and startServer to the Prometheus options
const options = {port: 9464, startServer: true};
const exporter = new PrometheusExporter(options);

// Register the exporter
const meter = new MeterProvider().getMeter('exporter-prometheus');
meter.addExporter(exporter);

// Now, start recording data
const counter = meter.createCounter('metric_name');
counter.add(10, meter.labels({ [key]: 'value' }));

// Record data using Instrument: It is recommended to keep a reference to the Bound Instrument instead of
// always calling `bind()` method for every operations.
const boundCounter = counter.bind(meter.labels({ [key]: 'value' }));
boundCounter.add(10);

// .. some other work

// Create and record Gauge
const gauge = meter.createGauge('metric_name1');
gauge.set(10, meter.labels({ [key1]: 'value1' }));
```

## Viewing your metrics

With the above you should now be able to navigate to the Prometheus UI at: http://localhost:9464/metrics

## Useful links
- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- To learn more about Prometheus, visit: https://prometheus.io/
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us on [gitter][gitter-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[gitter-image]: https://badges.gitter.im/open-telemetry/opentelemetry-js.svg
[gitter-url]: https://gitter.im/open-telemetry/opentelemetry-node?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/master/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-exporter-prometheus
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-exporter-prometheus
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-exporter-prometheus
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-exporter-prometheus&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/exporter-prometheus
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fexporter-prometheus.svg
