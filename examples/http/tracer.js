'use strict';

const opentelemetry = require('@opentelemetry/api');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');

const EXPORTER = process.env.EXPORTER || '';

module.exports = (serviceName) => {
  const useZipkin = EXPORTER.toLowerCase().startsWith('z');
  const exporter = useZipkin ? new ZipkinExporter() : new JaegerExporter();
  const provider = new NodeTracerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
    }),
    spanProcessors: [new SimpleSpanProcessor(exporter)]
  });

  // Initialize the OpenTelemetry APIs to use the NodeTracerProvider bindings
  provider.register();

  registerInstrumentations({
    // // when boostraping with lerna for testing purposes
    instrumentations: [
      new HttpInstrumentation(),
    ],
  });

  return opentelemetry.trace.getTracer('http-example');
};
