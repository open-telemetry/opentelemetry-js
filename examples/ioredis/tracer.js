'use strict';

const opentelemetry = require('@opentelemetry/core');
const { NodeTracerRegistry } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

const tracerRegistry = new NodeTracerRegistry();

const exporter = new JaegerExporter({ serviceName: 'ioredis-example' });

tracerRegistry.addSpanProcessor(new SimpleSpanProcessor(exporter));

// Initialize the OpenTelemetry APIs to use the BasicTracer bindings
opentelemetry.initGlobalTracerRegistry(tracerRegistry);

module.exports = opentelemetry.getTracer();
