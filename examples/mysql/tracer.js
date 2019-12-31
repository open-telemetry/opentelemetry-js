'use strict';

const opentelemetry = require('@opentelemetry/core');
const { NodeTracer } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');


module.exports = (service) => {
  const tracer = new NodeTracer({
    plugins: {
      mysql: {
        enabled: true,
        path: '@opentelemetry/plugin-mysql',
      },
      http: {
        enabled: true,
        path: '@opentelemetry/plugin-http',
      },
    },
  });

  tracer.addSpanProcessor(new SimpleSpanProcessor(new ZipkinExporter({
    serviceName: service,
  })));
  tracer.addSpanProcessor(new SimpleSpanProcessor(new JaegerExporter({
    serviceName: service,
  })));

  // Initialize the OpenTelemetry APIs to use the BasicTracer bindings
  opentelemetry.initGlobalTracer(tracer);

  return opentelemetry.getTracer();
};
