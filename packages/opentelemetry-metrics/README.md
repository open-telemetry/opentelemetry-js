# OpenTelemetry Metrics SDK

[![Gitter chat][gitter-image]][gitter-url]
[![NPM Published Version][npm-img]][npm-url]
[![dependencies][dependencies-image]][dependencies-url]
[![devDependencies][devDependencies-image]][devDependencies-url]
[![Apache License][license-image]][license-image]

OpenTelemetry metrics allow a user to collect data and export it to a metrics backend like [Prometheus](https://prometheus.io/).

## Installation

```bash
npm install --save @opentelemetry/metrics
```

## Usage

### Counter

Choose this kind of metric when the value is a quantity, the sum is of primary interest, and the event count and value distribution are not of primary interest. Counters are defined as `Monotonic = true` by default, meaning that positive values are expected.

```js
const { MeterProvider } = require('@opentelemetry/metrics');

// Initialize the Meter to capture measurements in various ways.
const meter = new MeterProvider().getMeter('your-meter-name');

const counter = meter.createCounter('metric_name', {
  description: 'Example of a counter'
});

const labels = { pid: process.pid };

// Create a BoundInstrument associated with specified label values.
const boundCounter = counter.bind(labels);
boundCounter.add(10);

```

### Observable

Choose this kind of metric when only last value is important without worry about aggregation

```js
const { MeterProvider, MetricObservable } = require('@opentelemetry/metrics');

// Initialize the Meter to capture measurements in various ways.
const meter = new MeterProvider().getMeter('your-meter-name');

const observer = meter.createObserver('metric_name', {
  description: 'Example of a observer'
});

function getCpuUsage() {
  return Math.random();
}

const metricObservable = new MetricObservable();

observer.setCallback((observerResult) => {
  // synchronous callback
  observerResult.observe(getCpuUsage, { pid: process.pid, core: '1' });
  // asynchronous callback
  observerResult.observe(metricObservable, { pid: process.pid, core: '2' });
});

// simulate asynchronous operation
setInterval(()=> {
  metricObservable.next(getCpuUsage());
}, 2000)

```

See [examples/prometheus](https://github.com/open-telemetry/opentelemetry-js/tree/master/examples/prometheus) for a short example.

### Value Recorder

`ValueRecorder` is a non-additive synchronous instrument useful for recording any non-additive number, positive or negative.
Values captured by `ValueRecorder.record(value)` are treated as individual events belonging to a distribution that is being summarized.
`ValueRecorder` should be chosen either when capturing measurements that do not contribute meaningfully to a sum, or when capturing numbers that are additive in nature, but where the distribution of individual increments is considered interesting.

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
