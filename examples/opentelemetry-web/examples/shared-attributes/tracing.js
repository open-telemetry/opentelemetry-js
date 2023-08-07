const { ConsoleSpanExporter, SimpleSpanProcessor } = require( '@opentelemetry/sdk-trace-base');
const { WebTracerProvider } = require( '@opentelemetry/sdk-trace-web');
const { FetchInstrumentation } = require( '@opentelemetry/instrumentation-fetch');
const { ZoneContextManager } = require( '@opentelemetry/context-zone');
const { B3Propagator } = require( '@opentelemetry/propagator-b3');
const { registerInstrumentations } = require( '@opentelemetry/instrumentation');
const { 
  GlobalAttributesSpanProcessor,
  ContextAttributesSpanProcessor
} = require('@opentelemetry/shared-attributes');

const provider = new WebTracerProvider();

// Note: For production consider using the "BatchSpanProcessor" to reduce the number of requests
// to your exporter. Using the SimpleSpanProcessor here as it sends the spans immediately to the
// exporter without delay
provider.addSpanProcessor(new GlobalAttributesSpanProcessor());
provider.addSpanProcessor(new ContextAttributesSpanProcessor());
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register({
  contextManager: new ZoneContextManager(),
  propagator: new B3Propagator(),
});

registerInstrumentations({
  instrumentations: [
    new FetchInstrumentation({
      ignoreUrls: [/localhost:8090\/sockjs-node/],
      propagateTraceHeaderCorsUrls: [
        'https://cors-test.appspot.com/test',
        'https://httpbin.org/get',
      ],
      clearTimingResources: true,
    }),
  ],
});
