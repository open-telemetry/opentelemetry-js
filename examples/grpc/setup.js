'use strict';

const opentelemetry = require('@opentelemetry/core');
const { NodeTracer } = require('@opentelemetry/node-sdk');
const { SimpleSpanProcessor } = require('@opentelemetry/basic-tracer');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');
const EXPORTER = process.env.EXPORTER || '';

function setupTracerAndExporters(service) {
  let exporter;
  const options = {
    serviceName: service
  };
  const tracer = new NodeTracer({
    plugins: {
      grpc: {
        enabled: true,
        // if it can't find the module, put the absolute path since the packages are not published yet
        path: '@opentelemetry/plugin-grpc'
      }
    }
  });
  if (EXPORTER.toLowerCase().startsWith('z')) {
    // need ignoreOutgoingUrls: [/spans/] to avoid infinity loops
    // TODO: manage this situation
    const zipkinExporter = new ZipkinExporter(options);
    exporter = new SimpleSpanProcessor(zipkinExporter);
  } else {
    // need to shutdown exporter in order to flush spans
    // TODO: check once PR #301 is merged
    const jaegerExporter = new JaegerExporter(options);
    exporter = new SimpleSpanProcessor(jaegerExporter);
  }

  tracer.addSpanProcessor(exporter);

  // Initialize the OpenTelemetry APIs to use the BasicTracer bindings
  opentelemetry.initGlobalTracer(tracer);
}

exports.setupTracerAndExporters = setupTracerAndExporters;
