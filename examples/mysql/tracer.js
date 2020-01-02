'use strict';

const opentelemetry = require('@opentelemetry/core');
const { NodeTracer } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');


module.exports = (serviceName) => {
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
    serviceName,
  })));
  tracer.addSpanProcessor(new SimpleSpanProcessor(new JaegerExporter({
    serviceName,
  })));

  // Initialize the OpenTelemetry APIs to use the BasicTracer bindings
  opentelemetry.initGlobalTracer(tracer);

  return opentelemetry.getTracer();
};
