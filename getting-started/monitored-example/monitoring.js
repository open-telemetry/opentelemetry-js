"use strict";

const { MeterProvider } = require('@opentelemetry/metrics');
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
  interval: 1000,
}).getMeter('example-monitored');

const requestCount = meter.createCounter("requests", {
  monotonic: true,
  labelKeys: ["route"],
  description: "Count all incoming requests"
});

const boundInstruments = new Map();

module.exports.countAllRequests = () => {
  return (req, res, next) => {
    if (!boundInstruments.has(req.path)) {
      const labelSet = meter.labels({ route: req.path });
      const boundCounter = requestCount.bind(labelSet);
      boundInstruments.set(req.path, boundCounter);
    }

    boundInstruments.get(req.path).add(1);
    next();
  };
};
