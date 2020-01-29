'use strict';

const opentelemetry = require('@opentelemetry/api');
const { NodeTracerRegistry } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');

const EXPORTER = process.env.EXPORTER || '';

module.exports = (serviceName) => {
  const registry = new NodeTracerRegistry({
    plugins: {
      pg: {
        enabled: true,
        /*
        if it can't find the module,
        put the absolute path since the packages are not published yet
        */
        path: '@opentelemetry/plugin-pg',
      },
      'pg-pool': {
        enabled: true,
        path: '@opentelemetry/plugin-pg-pool',
      },
      http: {
        enabled: true,
        path: '@opentelemetry/plugin-http',
      },
    },
  });

  let exporter;
  if (EXPORTER.toLowerCase().startsWith('z')) {
    exporter = new ZipkinExporter({
      serviceName,
    });
  } else {
    exporter = new JaegerExporter({
      serviceName,
      // The default flush interval is 5 seconds.
      flushInterval: 2000,
    });
  }

  registry.addSpanProcessor(new SimpleSpanProcessor(exporter));

  // Initialize the OpenTelemetry APIs to use the BasicTracer bindings
  opentelemetry.trace.initGlobalTracerRegistry(registry);

  return opentelemetry.trace.getTracer();
};
