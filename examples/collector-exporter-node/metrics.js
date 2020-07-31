'use strict';

const { CollectorMetricExporter } = require('@opentelemetry/exporter-collector');
const { MeterProvider } = require('@opentelemetry/metrics');

const metricExporter = new CollectorMetricExporter({
  serviceName: 'basic-metric-service',
  // logger: new ConsoleLogger(LogLevel.DEBUG),
});

const meter = new MeterProvider({
  exporter: metricExporter,
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
  requestCounter.bind(labels).add(1);
  upDownCounter.bind(labels).add(Math.random() > 0.5 ? 1 : -1);
}, 1000);
