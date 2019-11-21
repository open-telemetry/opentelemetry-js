"use strict";

const { Meter } = require("@opentelemetry/metrics");
const { PrometheusExporter } = require("@opentelemetry/exporter-prometheus");

const meter = new Meter();

const exporter = new PrometheusExporter(
  {
    startServer: true
  },
  () => {
    console.log("prometheus scrape endpoint: http://localhost:9464/metrics");
  }
);

meter.addExporter(exporter);

// Monotonic counters and gauges can only be increased.
const monotonicCounter = meter.createCounter("monotonic_counter", {
  monotonic: true,
  labelKeys: ["pid"],
  description: "Example of a monotonic counter"
});
const monotonicGauge = meter.createCounter("monotonic_gauge", {
  monotonic: true,
  labelKeys: ["pid"],
  description: "Example of a monotonic gauge"
});

// Non-monotonic counters and gauges can be increased or decreased.

// This is commented out until non-monotonic counter export is fixed
// const nonmonotonicCounter = meter.createCounter("non_monotonic_counter", {
//   monotonic: false,
//   labelKeys: ["pid"],
//   description: "Example of a non-monotonic counter"
// });
const nonmonotonicGauge = meter.createCounter("non_monotonic_gauge", {
  monotonic: false,
  labelKeys: ["pid"],
  description: "Example of a non-monotonic gauge"
});

setInterval(() => {
  const labels = Meter.labels({ pid: process.pid });

  monotonicCounter.getHandle(labels).add(1);
  // nonmonotonicCounter.getHandle(labels).add(Math.random() > 0.5 ? 1 : -1);
  monotonicGauge.getHandle(labels).add(Math.random() * 10);
  nonmonotonicGauge
    .getHandle(labels)
    .add(Math.random() > 0.5 ? Math.random() * 10 : -Math.random() * 10);
}, 1000);
