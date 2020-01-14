'use strict';

const opentelemetry = require('@opentelemetry/core');
const { NodeTracerRegistry } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');

const EXPORTER = process.env.EXPORTER || '';

module.exports = (serviceName) => {
  const registry = new NodeTracerRegistry();

  let exporter;
  if (EXPORTER.toLowerCase().startsWith('z')) {
    exporter = new ZipkinExporter({
      serviceName,
    });
  } else {
    exporter = new JaegerExporter({
      serviceName,
    });
  }

  registry.addSpanProcessor(new SimpleSpanProcessor(exporter));

  // Initialize the OpenTelemetry APIs to use the BasicTracerRegistry bindings
  opentelemetry.initGlobalTracerRegistry(registry);

  return opentelemetry.getTracer();
};
