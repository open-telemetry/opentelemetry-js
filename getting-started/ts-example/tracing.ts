import * as opentelemetry from "@opentelemetry/core";
import { NodeTracer } from "@opentelemetry/node";

import { SimpleSpanProcessor } from "@opentelemetry/tracing";
import { ZipkinExporter } from "@opentelemetry/exporter-zipkin";

const tracer: NodeTracer = new NodeTracer({
  logLevel: opentelemetry.LogLevel.ERROR
});

opentelemetry.initGlobalTracer(tracer);

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
