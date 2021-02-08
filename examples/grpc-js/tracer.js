'use strict';

const opentelemetry = require('@opentelemetry/api');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { NodeTracerProvider } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');

const EXPORTER = process.env.EXPORTER || '';

module.exports = (serviceName) => {
  const provider = new NodeTracerProvider();
  registerInstrumentations({
    instrumentations: [
      {
        plugins: {
          '@grpc/grpc-js': {
            enabled: true,
            path: '@opentelemetry/plugin-grpc-js',
            // // when boostraping with lerna for testing purposes
            // path: `${__dirname}/../../packages/opentelemetry-plugin-grpc-js/build/src`
          },
          // // when boostraping with lerna for testing purposes
          // 'http': {
          //   enabled: true,
          //   path: `${__dirname}/../../packages/opentelemetry-plugin-http/build/src`
          // },
        },
      },
    ],
    tracerProvider: provider,
  });

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

  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

  // Initialize the OpenTelemetry APIs to use the NodeTracerProvider bindings
  provider.register();

  return opentelemetry.trace.getTracer('grpc-js-example');
};
