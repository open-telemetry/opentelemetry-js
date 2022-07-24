const { ParentBasedSampler, TraceIdRatioBasedSampler } = require("@opentelemetry/core");
const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
//const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');
const { BatchSpanProcessor} = require("@opentelemetry/sdk-trace-base");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { trace } = require("@opentelemetry/api");
const {ZipkinExporter} = require("@opentelemetry/exporter-zipkin")
const {registerInstrumentations} = require('@opentelemetry/instrumentation')
//instrumentation
const { ExpressInstrumentation } = require("@opentelemetry/instrumentation-express");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");

//Exporter
module.exports = (serviceName) => {

    //const exporter = new ConsoleSpanExporter();
    const exporter = new ZipkinExporter({
        endpoint: "http://localhost:9411/api/v2/spans",
    });
    const provider = new NodeTracerProvider({
        resource: new Resource({
          [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        }),
        //sampler is used to make decisions on span sampling
        sampler: new ParentBasedSampler({
          root : new TraceIdRatioBasedSampler(1)
        })
    });

    //configure span processor to send spans to exporter
    provider.addSpanProcessor(new BatchSpanProcessor(exporter));
    provider.register();
    registerInstrumentations({
        instrumentations: [
        new HttpInstrumentation({
          requestHook : (span,request) => {
            span.setAttribute("Custom request hook attribute" , "request")
          },
        }),
        new ExpressInstrumentation(),
        ],
        tracerProvider: provider,
      });
      return trace.getTracer(serviceName);
}
