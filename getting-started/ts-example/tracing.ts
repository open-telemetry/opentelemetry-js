import * as opentelemetry from "@opentelemetry/api";
import { NodeTracerProvider } from "@opentelemetry/node";
import { SimpleSpanProcessor } from "@opentelemetry/tracing";
import { ZipkinExporter } from "@opentelemetry/exporter-zipkin";

const provider: NodeTracerProvider = new NodeTracerProvider({
  logLevel: opentelemetry.LogLevel.ERROR
});

opentelemetry.trace.setGlobalTracerProvider(provider);

provider.addSpanProcessor(
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
