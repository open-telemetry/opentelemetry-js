"use strict";

const { NodeTracer } = require("@opentelemetry/node");
const { SimpleSpanProcessor } = require("@opentelemetry/tracing");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");
const { ZipkinExporter } = require("@opentelemetry/exporter-zipkin");
const { TracerShim } = require("@opentelemetry/shim-opentracing");

function shim(serviceName) {
  const tracer = new NodeTracer();

  tracer.addSpanProcessor(new SimpleSpanProcessor(getExporter(serviceName)));

  return new TracerShim(tracer);
}

function getExporter(serviceName) {
  const type = process.env.EXPORTER.toLowerCase() || "jaeger";

  if (type.startsWith("z")) {
    return new ZipkinExporter({ serviceName });
  }

  return new JaegerExporter({ serviceName, flushInterval: 100 });
}

exports.shim = shim;
