'use strict';

const opentelemetry = require('@opentelemetry/core');
const { NodeTracerRegistry } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');

function setupTracerAndExporters(service) {
  const registry = new NodeTracerRegistry({
    plugins: {
      mysql: {
        enabled: true,
        path: "@opentelemetry/plugin-mysql"
      },
      http: {
        enabled: true,
        path: "@opentelemetry/plugin-http"
      }
    }
  });

  registry.addSpanProcessor(new SimpleSpanProcessor(new ZipkinExporter({
    serviceName: service,
  })));
  registry.addSpanProcessor(new SimpleSpanProcessor(new JaegerExporter({
    serviceName: service,
  })));

  // Initialize the OpenTelemetry APIs to use the BasicTracerRegistry bindings
  opentelemetry.initGlobalTracerRegistry(registry);
}

exports.setupTracerAndExporters = setupTracerAndExporters;
