'use strict';

const { MeterProvider, MetricObservable } = require('@opentelemetry/metrics');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');

const exporter = new PrometheusExporter(
  {
    startServer: true,
  },
  () => {
    console.log('prometheus scrape endpoint: http://localhost:9464/metrics');
  },
);

const meter = new MeterProvider({
  exporter,
  interval: 2000,
}).getMeter('example-observer');

const otelCpuUsage = meter.createObserver('metric_observer', {
  monotonic: false,
  labelKeys: ['pid', 'core'],
  description: 'Example of a observer',
});

function getCpuUsage() {
  return Math.random();
}

const observable = new MetricObservable();

setInterval(() => {
  observable.next(getCpuUsage());
}, 5000);

otelCpuUsage.setCallback((observerResult) => {
  observerResult.observe(getCpuUsage, { pid: process.pid, core: '1' });
  observerResult.observe(getCpuUsage, { pid: process.pid, core: '2' });
  observerResult.observe(getCpuUsage, { pid: process.pid, core: '3' });
  observerResult.observe(getCpuUsage, { pid: process.pid, core: '4' });
  observerResult.observe(observable, { pid: process.pid, core: '5' });
});
