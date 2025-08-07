'use strict';

const { metrics } = require('@opentelemetry/api');

// Metrics SDK and exporter were registered globally in ./opentelemetry-metrics.js, so you can access it via `metrics`
// from `@opentelemetry/api` - in your application code outside of setup, you should never refer to any
// `@opentelemetry/sdk-metrics` types.
// Note: getting a meter may be an expensive operation - so you should create it once, and then hold on to it for the
// lifetime of your process. You should avoid getting new meters on hot-paths.
const meter = metrics.getMeter('example-exporter-collector');

const counter = meter.createCounter('test_counter', {
  description: 'Example of a Counter',
});

const upDownCounter = meter.createUpDownCounter('test_up_down_counter', {
  description: 'Example of a UpDownCounter',
});

const histogram = meter.createHistogram('test_histogram', {
  description: 'Example of a Histogram',
});

const exponentialHistogram = meter.createHistogram('test_exponential_histogram', {
  description: 'Example of an ExponentialHistogram',
});

const attributes = { pid: process.pid, environment: 'staging' };

setInterval(() => {
  counter.add(1, attributes);
  upDownCounter.add(Math.random() > 0.5 ? 1 : -1, attributes);
  histogram.record(Math.random(), attributes);
  exponentialHistogram.record(Math.random(), attributes);
}, 1000);
