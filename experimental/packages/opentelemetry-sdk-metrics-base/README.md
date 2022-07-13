# OpenTelemetry Metrics SDK

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

OpenTelemetry metrics module contains the foundation for all metrics SDKs of [opentelemetry-js](https://github.com/open-telemetry/opentelemetry-js).

Used standalone, this module provides methods for manual instrumentation of code, offering full control over recording metrics for client-side JavaScript (browser) and Node.js.

It does **not** provide automated instrumentation of known libraries or host environment metrics out-of-the-box.

## Installation

```bash
npm install --save @opentelemetry/api-metrics
npm install --save @opentelemetry/sdk-metrics-base
```

## Usage

The basic setup of the SDK can be seen as followings:

```js
const opentelemetry = require('@opentelemetry/api-metrics');
const { MeterProvider } = require('@opentelemetry/sdk-metrics-base');

// To create an instrument, you first need to initialize the Meter provider.
// NOTE: The default OpenTelemetry meter provider does not record any metric instruments.
//       Registering a working meter provider allows the API methods to record instruments.
opentelemetry.setGlobalMeterProvider(new MeterProvider());

// To record a metric event, we used the global singleton meter to create an instrument.
const counter = opentelemetry.getMeter('default').createCounter('foo');

// record a metric event.
counter.add(1, { attributeKey: 'attribute-value' });
```

In conditions, we may need to setup an async instrument to observe costly events:

```js
// Creating an async instrument, similar to synchronous instruments
const observableCounter = opentelemetry.getMeter('default')
  .createObservableCounter('observable-counter');

// Register a single-instrument callback to the async instrument.
observableCounter.addCallback(async (observableResult) => {
  // ... do async stuff
  observableResult.observe(1, { attributeKey: 'attribute-value' });
});

// Register a multi-instrument callback and associate it with a set of async instruments.
opentelemetry.getMeter('default')
  .addBatchObservableCallback(batchObservableCallback, [ observableCounter ]);
async function batchObservableCallback(batchObservableResult) {
  // ... do async stuff
  batchObservableResult.observe(observableCounter, 1, { attributeKey: 'attribute-value' });
}
```

Views can be registered when instantiating a `MeterProvider`:

```js
const meterProvider = new MeterProvider({
  views: [
    // override the bucket boundaries on `my.histogram` to [0, 50, 100]
    new View({ aggregation: new ExplicitBucketHistogramAggregation([0, 50, 100]), instrumentName: 'my.histogram'}),
    // rename 'my.counter' to 'my.renamed.counter'
    new View({ name: 'my.renamed.counter', instrumentName: 'my.counter'})
  ]
})
```

## Example

See [examples/prometheus](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/examples/prometheus) for an end-to-end example, including exporting metrics.

## Useful links

- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more about OpenTelemetry JavaScript: <https://github.com/open-telemetry/opentelemetry-js>
- For help or feedback on this project, join us in [GitHub Discussions][discussions-url]

## License

Apache 2.0 - See [LICENSE][license-url] for more information.

[discussions-url]: https://github.com/open-telemetry/opentelemetry-js/discussions
[license-url]: https://github.com/open-telemetry/opentelemetry-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@opentelemetry/sdk-metrics-base
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fmetrics.svg
