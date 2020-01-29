'use strict';

const opentelemetry = require('@opentelemetry/core');
const { NodeTracerProvider } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

const tracerProvider = new NodeTracerProvider();

const exporter = new JaegerExporter({ serviceName: 'ioredis-example' });

tracerProvider.addSpanProcessor(new SimpleSpanProcessor(exporter));

// Initialize the OpenTelemetry APIs to use the BasicTracer bindings
opentelemetry.initGlobalTracerProvider(tracerProvider);

module.exports = opentelemetry.getTracer();
