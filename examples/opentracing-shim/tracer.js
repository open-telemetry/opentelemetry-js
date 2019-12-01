const { NodeTracer } = require("@opentelemetry/node");
const { SimpleSpanProcessor } = require("@opentelemetry/tracing");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");
const { ZipkinExporter } = require("@opentelemetry/exporter-zipkin");
const { TracerShim } = require("@opentelemetry/shim-opentracing");

const opentracing = require("opentracing");

function init(serviceName) {
  let exporter;
  if (process.env.EXPORTER.toLowerCase().startsWith("z")) {
    exporter = new ZipkinExporter({ serviceName });
  } else {
    exporter = new JaegerExporter({ serviceName, flushInterval: 100 });
  }

  const tracer = new NodeTracer();

  tracer.addSpanProcessor(new SimpleSpanProcessor(exporter));

  opentracing.initGlobalTracer(new TracerShim(tracer));
}

exports.init = init;
