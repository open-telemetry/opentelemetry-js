'use strict';

const { MeterProvider } = require('@opentelemetry/sdk-metrics-base');
const { DiagConsoleLogger, DiagLogLevel, diag } = require('@opentelemetry/api');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');

// Optional and only needed to see the internal diagnostic logging (during development)
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

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
  interval: 2000,
}).getMeter('example-meter');

meter.createObservableGauge('cpu_core_usage', {
  description: 'Example of a sync observable gauge with callback',
}, async (observableResult) => { // this callback is called once per each interval
  await new Promise((resolve) => {
    setTimeout(() => { resolve(); }, 50);
  });
  observableResult.observe(getRandomValue(), { core: '1' });
  observableResult.observe(getRandomValue(), { core: '2' });
});

function getRandomValue() {
  return Math.random();
}
