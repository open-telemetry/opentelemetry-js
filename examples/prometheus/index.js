'use strict';

const { MeterProvider } = require('@opentelemetry/sdk-metrics-base');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');

const { endpoint, port } = PrometheusExporter.DEFAULT_OPTIONS;

const exporter = new PrometheusExporter({}, () => {
  console.log(
    `prometheus scrape endpoint: http://localhost:${port}${endpoint}`,
  );
});

const meter = new MeterProvider({
  exporter,
  interval: 1000,
}).getMeter('example-prometheus');

const requestCounter = meter.createCounter('requests', {
  description: 'Example of a Counter',
});

const upDownCounter = meter.createUpDownCounter('test_up_down_counter', {
  description: 'Example of a UpDownCounter',
});

const labels = { pid: process.pid, environment: 'staging' };

setInterval(() => {
  requestCounter.add(1, labels);
  upDownCounter.add(Math.random() > 0.5 ? 1 : -1, labels);
}, 1000);
