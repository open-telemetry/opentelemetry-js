'use strict';

const { ConsoleLogger, LogLevel } = require('@opentelemetry/core');
const { CollectorMetricExporter } = require('@opentelemetry/exporter-collector');
// const { CollectorMetricExporter } = require('@opentelemetry/exporter-collector-grpc');
// const { CollectorMetricExporter } = require('@opentelemetry/exporter-collector-proto');
const { MeterProvider } = require('@opentelemetry/metrics');

const metricExporter = new CollectorMetricExporter({
  serviceName: 'basic-metric-service',
  // url: 'http://localhost:55681/v1/metrics',
  logger: new ConsoleLogger(LogLevel.DEBUG),
});

const meter = new MeterProvider({
  exporter: metricExporter,
  interval: 1000,
}).getMeter('example-exporter-collector');

const requestCounter = meter.createCounter('requests', {
  description: 'Example of a Counter',
});

const upDownCounter = meter.createUpDownCounter('test_up_down_counter', {
  description: 'Example of a UpDownCounter',
});

const labels = { pid: process.pid, environment: 'staging' };

setInterval(() => {
  requestCounter.bind(labels).add(1);
  upDownCounter.bind(labels).add(Math.random() > 0.5 ? 1 : -1);
}, 1000);
