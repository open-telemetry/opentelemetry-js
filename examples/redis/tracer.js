'use strict';

const opentelemetry = require('@opentelemetry/core');
const { NodeTracer } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');

const EXPORTER = process.env.EXPORTER || '';

const tracer = new NodeTracer();

const service = 'redis-server-service';
let exporter;
if (EXPORTER.toLowerCase().startsWith('z')) {
  exporter = new ZipkinExporter({
    serviceName: service,
  });
} else {
  exporter = new JaegerExporter({
    serviceName: service,
  });
}

tracer.addSpanProcessor(new SimpleSpanProcessor(exporter));

// Initialize the OpenTelemetry APIs to use the BasicTracer bindings
opentelemetry.initGlobalTracer(tracer);

module.exports = opentelemetry.getTracer();
