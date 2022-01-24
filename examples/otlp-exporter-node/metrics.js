'use strict';

const { DiagConsoleLogger, DiagLogLevel, diag } = require('@opentelemetry/api');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
// const { OTLPMetricExporter } = require('@opentelemetry/exporter-otlp-grpc');
// const { OTLPMetricExporter } = require('@opentelemetry/exporter-otlp-proto');
const { MeterProvider } = require('@opentelemetry/sdk-metrics-base');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

// Optional and only needed to see the internal diagnostic logging (during development)
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const metricExporter = new OTLPMetricExporter({
  url: 'http://localhost:4318/v1/metrics',
});

const meter = new MeterProvider({
  exporter: metricExporter,
  interval: 1000,
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'basic-metric-service',
  }),
}).getMeter('example-exporter-collector');

const requestCounter = meter.createCounter('requests', {
  description: 'Example of a Counter',
});

const upDownCounter = meter.createUpDownCounter('test_up_down_counter', {
  description: 'Example of a UpDownCounter',
});

const histogram = meter.createHistogram('test_histogram', {
  description: 'Example of a Histogram',
});

const labels = { pid: process.pid, environment: 'staging' };

setInterval(() => {
  requestCounter.add(1, labels);
  upDownCounter.add(Math.random() > 0.5 ? 1 : -1, labels);
  histogram.record(Math.random(), labels);
}, 1000);
