'use strict';

const opentelemetry = require('@opentelemetry/core');
const { NodeTracer } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');

const EXPORTER = process.env.EXPORTER || '';

const tracerRegistry = new NodeTracerRegistry();

let exporter;
if (EXPORTER.toLowerCase().startsWith('z')) {
  exporter = new ZipkinExporter({
    serviceName: 'ioredis-example',
  });
} else {
  exporter = new JaegerExporter({
    serviceName: 'ioredis-example',
  });
}

tracer.addSpanProcessor(new SimpleSpanProcessor(exporter));

// Initialize the OpenTelemetry APIs to use the BasicTracer bindings
opentelemetry.initGlobalTracerRegistry(tracerRegistry);

module.exports = opentelemetry.getTracer();
