'use strict';

const { DiagConsoleLogger, DiagLogLevel, diag } = require('@opentelemetry/api');
const { MeterProvider } = require('@opentelemetry/sdk-metrics-base');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');

// Optional and only needed to see the internal diagnostic logging (during development)
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const { endpoint, port } = PrometheusExporter.DEFAULT_OPTIONS;

const exporter = new PrometheusExporter({}, () => {
  console.log(
    `prometheus scrape endpoint: http://localhost:${port}${endpoint}`,
  );
});

// Creates MeterProvider and installs the exporter as a MetricReader
const meterProvider = new MeterProvider();
meterProvider.addMetricReader(exporter);
const meter = meterProvider.getMeter('example-prometheus');

// Creates metric instruments
const requestCounter = meter.createCounter('requests', {
  description: 'Example of a Counter',
});

const upDownCounter = meter.createUpDownCounter('test_up_down_counter', {
  description: 'Example of a UpDownCounter',
});

const attributes = { pid: process.pid, environment: 'staging' };

// Record metrics
setInterval(() => {
  requestCounter.add(1, attributes);
  upDownCounter.add(Math.random() > 0.5 ? 1 : -1, attributes);
}, 1000);
