'use strict';

const { DiagConsoleLogger, DiagLogLevel, diag } = require('@opentelemetry/api');
const { MeterProvider } = require('@opentelemetry/sdk-metrics');
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
const meterProvider = new MeterProvider({
  readers: [exporter],
});
const meter = meterProvider.getMeter('example-prometheus');

// Creates metric instruments
const requestCounter = meter.createCounter('requests', {
  description: 'Example of a Counter',
});

const upDownCounter = meter.createUpDownCounter('test_up_down_counter', {
  description: 'Example of a UpDownCounter',
});

const attributes = { pid: process.pid, environment: 'staging' };

let counter = 0;
const observableCounter = meter.createObservableCounter('observable_requests', {
  description: 'Example of an ObservableCounter',
});
observableCounter.addCallback(observableResult => {
  observableResult.observe(counter, attributes);
});

const randomMetricPromise = async () =>
  new Promise(resolve =>
    setTimeout(resolve(Math.floor(Math.random() * 100)), 50)
  );

const observableGauge = meter.createObservableGauge(
  'observable_gauge_requests',
  {
    description: 'Example of an ObservableGauge',
  }
);
// Callbacks are run when metrics are scraped
observableGauge.addCallback(async observableResult => {
  const value = await randomMetricPromise();
  observableResult.observe(value, attributes);
});

// Record metrics
setInterval(() => {
  counter++;
  requestCounter.add(1, attributes);
  upDownCounter.add(Math.random() > 0.5 ? 1 : -1, attributes);
}, 1000);
