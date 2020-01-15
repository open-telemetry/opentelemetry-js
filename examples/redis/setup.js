'use strict';

const opentelemetry = require('@opentelemetry/core');
const { NodeTracerProvider } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');
const EXPORTER = process.env.EXPORTER || '';

function setupTracerAndExporters(service) {
  const provider = new NodeTracerProvider();

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

  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

  // Initialize the OpenTelemetry APIs to use the BasicTracerProvider bindings
  opentelemetry.initGlobalTracerProvider(provider);
}

exports.setupTracerAndExporters = setupTracerAndExporters;
