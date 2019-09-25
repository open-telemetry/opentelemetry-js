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
        serviceName: service,
    }
    const tracer = new NodeTracer();
    
    if (EXPORTER.toLowerCase().startsWith('z')) {
      exporter = new ZipkinExporter(options);
    } else {
      exporter = new JaegerExporter(options);
    }

    tracer.addSpanProcessor(new SimpleSpanProcessor(exporter));
    
    // Initialize the OpenTelemetry APIs to use the BasicTracer bindings
    opentelemetry.initGlobalTracer(tracer);
}

exports.setupTracerAndExporters = setupTracerAndExporters;
