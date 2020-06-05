'use strict';

const { MeterProvider } = require('@opentelemetry/metrics');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');

const exporter = new PrometheusExporter(
  {
    startServer: true,
  },
  () => {
    console.log(
      `prometheus scrape endpoint: http://localhost:${PrometheusExporter.DEFAULT_OPTIONS.port}${PrometheusExporter.DEFAULT_OPTIONS.endpoint}`,
    );
  },
);

const meter = new MeterProvider({
  exporter,
  interval: 1000,
}).getMeter('example-prometheus');

// Monotonic counters can only be increased.
const monotonicCounter = meter.createCounter('monotonic_counter', {
  monotonic: true,
  labelKeys: ['pid'],
  description: 'Example of a monotonic counter',
});

// Non-monotonic counters can be increased or decreased.
const nonMonotonicCounter = meter.createCounter('non_monotonic_counter', {
  monotonic: false,
  labelKeys: ['pid'],
  description: 'Example of a non-monotonic counter',
});

const labels = { pid: process.pid };

setInterval(() => {
  monotonicCounter.bind(labels).add(1);
  nonMonotonicCounter.bind(labels).add(Math.random() > 0.5 ? 1 : -1);
}, 1000);
