"use strict";

const opentelemetry = require("@opentelemetry/core");
const { NodeTracerRegistry } = require("@opentelemetry/node");

const { SimpleSpanProcessor } = require("@opentelemetry/tracing");
const { ZipkinExporter } = require("@opentelemetry/exporter-zipkin");

const tracerRegistry = new NodeTracerRegistry({ logLevel: opentelemetry.LogLevel.ERROR });
opentelemetry.initGlobalTracerRegistry(tracerRegistry);

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
