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

// async callback - for operation that needs to wait for value
meter.createObservableGauge('cpu_core_usage', {
  description: 'Example of an async observable gauge with callback',
}, async (observableResult) => {
  const value = await getAsyncValue();
  observableResult.observe(value, { core: '1' });
  observableResult.observe(value, { core: '2' });
});

function getAsyncValue() {
  return new Promise((resolve) => {
    setTimeout(()=> {
      resolve(Math.random());
    }, 100);
  });
}

setInterval(function(){
  console.log("simulating an app being kept open")
}, 5000);
