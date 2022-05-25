# OpenTelemetry Metrics SDK

[![NPM Published Version][npm-img]][npm-url]
[![Apache License][license-image]][license-image]

OpenTelemetry metrics allow a user to collect data and export it to a metrics backend like [Prometheus](https://prometheus.io/).

## Work In Progress

The OpenTelemetry SDK in this directory is undergoing drastic changes. If you need to use metrics, we recommend you use [version `0.27.0`](https://github.com/open-telemetry/opentelemetry-js/tree/experimental/v0.27.0/experimental/packages/opentelemetry-sdk-metrics-base).

## Installation

```bash
npm install --save "@opentelemetry/sdk-metrics-base@~0.27.0"
```

## Usage

Please see the [version `0.27.0` README](https://github.com/open-telemetry/opentelemetry-js/tree/experimental/v0.27.0/experimental/packages/opentelemetry-sdk-metrics-base#usage).

TODO: Add usage information for updated SDK

## Installation of the Latest experimental version

```bash
npm install --save @opentelemetry/sdk-metrics-base
```

## Usage of the Latest experimental version

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

  // This is been dropped since the observable is not associated with the callback at registration.
  batchObservableResult.observe(otherObservable, 2);
}
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
[npm-url]: https://www.npmjs.com/package/@opentelemetry/sdk-metrics-base
[npm-img]: https://badge.fury.io/js/%40opentelemetry%2Fmetrics.svg
