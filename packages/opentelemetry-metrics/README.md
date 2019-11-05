# OpenTelemetry Metrics SDK
[![Gitter chat][gitter-image]][gitter-url]
[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

`Metric` instruments are the entry point for application and framework developers to instrument their code using `counters`, `gauges`, and `measures`.

## Installation

```bash
npm install --save @opentelemetry/metrics
```

## Usage

### Counter
Choose this kind of metric when the value is a quantity, the sum is of primary interest, and the event count and value distribution are not of primary interest. Counters are defined as `Monotonic = true` by default, meaning that positive values are expected.

```js
const { Meter } = require('@opentelemetry/metrics');

// Initialize the Meter to capture measurements in various ways.
const meter = new Meter();

const counter = meter.createCounter('metric_name');

// Create a Handle associated with specified label values.
const handle = counter.getHandle(['value1']);
handle.add(10);

// @todo: add exporter
```

### Gauge
Gauge metrics express a pre-calculated value. Generally, this kind of metric should be used when the metric cannot be expressed as a sum or because the measurement interval is arbitrary. Use this kind of metric when the measurement is not a quantity, and the sum and event count are not of interest. Gauges are defined as `Monotonic = false` by default, meaning that new values are permitted to make positive or negative changes to the gauge. There is no restriction on the sign of the input for gauges.

```js
const { Meter } = require('@opentelemetry/metrics');

// Initialize the Meter to capture measurements in various ways.
const meter = new Meter();

const gauge = meter.createGauge('metric_name');

// Create a Handle associated with specified label values.
const handle = gauge.getHandle(['value1']);
handle.set(10); // Set to 10

// @todo: add exporter
```

### Measure
***Work in progress***

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
[dependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/status.svg?path=packages/opentelemetry-metrics
[dependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-metrics
[devDependencies-image]: https://david-dm.org/open-telemetry/opentelemetry-js/dev-status.svg?path=packages/opentelemetry-metrics
[devDependencies-url]: https://david-dm.org/open-telemetry/opentelemetry-js?path=packages%2Fopentelemetry-metrics&type=dev
[npm-url]: https://www.npmjs.com/package/@opentelemetry/metrics
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fmetrics.svg