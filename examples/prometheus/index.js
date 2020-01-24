'use strict';

const { MeterRegistry } = require('@opentelemetry/metrics');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');

const meter = new MeterRegistry().getMeter('example-prometheus');

const exporter = new PrometheusExporter(
  {
    startServer: true,
  },
  () => {
    console.log('prometheus scrape endpoint: http://localhost:9464/metrics');
  },
);

meter.addExporter(exporter);

// Monotonic counters and gauges can only be increased.
const monotonicCounter = meter.createCounter('monotonic_counter', {
  monotonic: true,
  labelKeys: ['pid'],
  description: 'Example of a monotonic counter',
});
const monotonicGauge = meter.createGauge('monotonic_gauge', {
  monotonic: true,
  labelKeys: ['pid'],
  description: 'Example of a monotonic gauge',
});

// Non-monotonic counters and gauges can be increased or decreased.
const nonMonotonicCounter = meter.createCounter('non_monotonic_counter', {
  monotonic: false,
  labelKeys: ['pid'],
  description: 'Example of a non-monotonic counter',
});
const nonMonotonicGauge = meter.createGauge('non_monotonic_gauge', {
  monotonic: false,
  labelKeys: ['pid'],
  description: 'Example of a non-monotonic gauge',
});

let currentMonotonicGaugeValue = 0;
setInterval(() => {
  const labels = meter.labels({ pid: process.pid });

  currentMonotonicGaugeValue += Math.random();

  monotonicCounter.bind(labels).add(1);
  nonMonotonicCounter.bind(labels).add(Math.random() > 0.5 ? 1 : -1);
  monotonicGauge.bind(labels).set(currentMonotonicGaugeValue);
  nonMonotonicGauge
    .bind(labels)
    .set(Math.random() > 0.5 ? Math.random() * 10 : -Math.random() * 10);
}, 1000);
