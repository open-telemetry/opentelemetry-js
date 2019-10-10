'use strict';

const opentelemetry = require('@opentelemetry/core');
const { NodeTracerFactory } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');
const EXPORTER = process.env.EXPORTER || '';

function setupTracerAndExporters(service) {
  const factory = new NodeTracerFactory({
    plugins: {
      grpc: {
        enabled: true,
        // if it can't find the module, put the absolute path since the packages are not published yet
        path: '@opentelemetry/plugin-grpc'
      }
    }
  });
  const tracer = factory.getTracer();

  let exporter;
  if (EXPORTER.toLowerCase().startsWith('z')) {
    exporter = new ZipkinExporter({
      serviceName: service,
    });
  } else {
    exporter = new JaegerExporter({
      serviceName: service,
      // The default flush interval is 5 seconds.
      flushInterval: 2000
    });
  }

  tracer.addSpanProcessor(new SimpleSpanProcessor(exporter));

  // Initialize the OpenTelemetry APIs to use the BasicTracerFactory bindings
  opentelemetry.initGlobalTracerFactory(factory);
}

exports.setupTracerAndExporters = setupTracerAndExporters;
