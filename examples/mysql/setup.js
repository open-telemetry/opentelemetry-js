'use strict';

const opentelemetry = require('@opentelemetry/core');
const { NodeTracerProvider } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');

function setupTracerAndExporters(service) {
  const provider = new NodeTracerProvider({
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

  provider.addSpanProcessor(new SimpleSpanProcessor(new ZipkinExporter({
    serviceName: service,
  })));
  provider.addSpanProcessor(new SimpleSpanProcessor(new JaegerExporter({
    serviceName: service,
  })));

  // Initialize the OpenTelemetry APIs to use the BasicTracerProvider bindings
  opentelemetry.initGlobalTracerProvider(provider);
}

exports.setupTracerAndExporters = setupTracerAndExporters;
