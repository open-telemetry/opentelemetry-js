'use strict';

const opentelemetry = require('@opentelemetry/api');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { NodeTracerProvider } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');

const EXPORTER = process.env.EXPORTER || '';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

module.exports = (serviceName) => {
  let exporter;
  const provider = new NodeTracerProvider();
  registerInstrumentations({
    tracerProvider: provider,
    // when boostraping with lerna for testing purposes
    // instrumentations: [
    //   {
    //     plugins: {
    //       https: {
    //         enabled: true,
    //         path: `${__dirname}/../../packages/opentelemetry-plugin-https/build/src`
    //       }
    //     }
    //   }
    // ],
  });

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

  return opentelemetry.trace.getTracer('https-example');
};
