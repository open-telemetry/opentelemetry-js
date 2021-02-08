'use strict';

const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { NodeTracerProvider } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');
const { TracerShim } = require('@opentelemetry/shim-opentracing');

function shim(serviceName) {
  const provider = new NodeTracerProvider();
  registerInstrumentations({
    tracerProvider: provider,
    // // when boostraping with lerna for testing purposes
    // instrumentations: [
    //   {
    //     plugins: {
    //       'opentracing': {
    //         enabled: true,
    //         path: `${__dirname}/../../packages/opentelemetry-shim-opentracing/build/src`
    //       }
    //     }
    //   }
    // ],
  });

  provider.addSpanProcessor(new SimpleSpanProcessor(getExporter(serviceName)));
  // Initialize the OpenTelemetry APIs to use the NodeTracerProvider bindings
  provider.register();

  return new TracerShim(provider.getTracer('opentracing-shim'));
}

function getExporter(serviceName) {
  const type = process.env.EXPORTER.toLowerCase() || 'jaeger';

  if (type.startsWith('z')) {
    return new ZipkinExporter({ serviceName });
  }

  return new JaegerExporter({ serviceName, flushInterval: 100 });
}

exports.shim = shim;
