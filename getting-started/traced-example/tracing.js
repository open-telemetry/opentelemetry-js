"use strict";

const opentelemetry = require("@opentelemetry/core");
const { NodeTracerProvider } = require("@opentelemetry/node");

const { SimpleSpanProcessor } = require("@opentelemetry/tracing");
const { ZipkinExporter } = require("@opentelemetry/exporter-zipkin");

const tracerProvider = new NodeTracerProvider({ logLevel: opentelemetry.LogLevel.ERROR });
opentelemetry.initGlobalTracerProvider(tracerProvider);

tracer.addSpanProcessor(
  new SimpleSpanProcessor(
    new ZipkinExporter({
      serviceName: "getting-started"
      // If you are running your tracing backend on another host,
      // you can point to it using the `url` parameter of the
      // exporter config.
    })
  )
);

console.log("tracing initialized");
