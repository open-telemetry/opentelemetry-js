'use strict';

const opentelemetry = require('@opentelemetry/core');
const { NodeTracer } = require('@opentelemetry/node-sdk');
const { SimpleSpanProcessor } = require('@opentelemetry/basic-tracer');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');
const EXPORTER = process.env.EXPORTER || '';

function setupTracerAndExporters(service) {
    const options = {
        serviceName: service,
    }
    // TODO: replace to tracer = new NodeTracer once #331 is merged and issue #332
    const tracer = new NodeTracer({
        plugins: {
            http: {
                enabled: true,
                // if it can't find the module, put the absolute path (depending your config, since packages are not published yet)
                path: '@opentelemetry/plugin-http',
                ignoreOutgoingUrls: [/spans/]
            }
        }
    });
    let exporter;
    if (EXPORTER.toLowerCase().startsWith('z')) {
      // need ignoreOutgoingUrls: [/spans/] to avoid infinity loops
      // TODO: manage this situation
      exporter = new ZipkinExporter(options);
    } else {
      // need to shutdown exporter in order to flush spans
      // TODO: with the current config we don't see spans in Jaeger UI
      // It should be resolved in a separate PR
      exporter = new JaegerExporter(options);
    }

    tracer.addSpanProcessor(new SimpleSpanProcessor(exporter));
    
    // Initialize the OpenTelemetry APIs to use the BasicTracer bindings
    opentelemetry.initGlobalTracer(tracer);
}

exports.setupTracerAndExporters = setupTracerAndExporters;
