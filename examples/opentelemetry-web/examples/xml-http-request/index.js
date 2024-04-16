const { context, trace, TraceFlags, TextMapPropagator } = require('@opentelemetry/api');
const { ConsoleSpanExporter, SimpleSpanProcessor } = require( '@opentelemetry/sdk-trace-base');
const { WebTracerProvider } = require( '@opentelemetry/sdk-trace-web');
const { XMLHttpRequestInstrumentation } = require( '@opentelemetry/instrumentation-xml-http-request');
const { ZoneContextManager } = require( '@opentelemetry/context-zone');
const { OTLPTraceExporter } = require( '@opentelemetry/exporter-trace-otlp-http');
const { B3Propagator } = require( '@opentelemetry/propagator-b3');
const { registerInstrumentations } = require( '@opentelemetry/instrumentation');


const TRACEPARENT_PLACEHOLDER = '__TRACEPARENT__';
class MyContextPropagator extends TextMapPropagator {

  constructor() {
    super();
    this._w3cPropagator = new W3CTraceContextPropagator();
  }

  buildTraceparent (spanContext) {
    const VERSION = '00';

    const traceParent = `${VERSION}-${spanContext.traceId}-${
      spanContext.spanId
    }-0${Number(spanContext.traceFlags || TraceFlags.NONE).toString(16)}`;
    return traceParent;
  }

  inject(context, carrier, setter) {
    const spanContext = trace.getSpanContext(context);
    if (!spanContext)
      return;

    if (typeof carrier.body === 'string' && carrier.hasOwnProperty('body')) {
      if (args[0].includes(TRACEPARENT_PLACEHOLDER)) {
        const traceParent = this.buildTraceparent(spanContext);
        carrier.body = carrier.body.replaceAll(TRACEPARENT_PLACEHOLDER, traceParent);
      }
    } else {
      // use the default W3CTraceContextPropagator
      this._w3cPropagator.inject(context, carrier, setter);
    }
  }

  extract(context, carrier, getter) {
    // Implement the extract function if needed
  }

  fields() {
    // Define the fields that this propagator supports
    return [];
  }

  toString() {
    // Provide a string representation of this propagator
    return 'SFPropagator';
  }
}



const providerWithZone = new WebTracerProvider();

// Note: For production consider using the "BatchSpanProcessor" to reduce the number of requests
// to your exporter. Using the SimpleSpanProcessor here as it sends the spans immediately to the
// exporter without delay
providerWithZone.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
providerWithZone.addSpanProcessor(new SimpleSpanProcessor(new OTLPTraceExporter()));

providerWithZone.register({
  contextManager: new ZoneContextManager(),
  propagator: new MyContextPropagator(),
});

registerInstrumentations({
  instrumentations: [
    new XMLHttpRequestInstrumentation({
      ignoreUrls: [/localhost:8090\/sockjs-node/],
      propagateTraceHeaderCorsUrls: [
        'https://httpbin.org/get',
      ],
    }),
  ],
});

const webTracerWithZone = providerWithZone.getTracer('example-tracer-web');

const getData = (url) => new Promise((resolve, reject) => {
  const req = new XMLHttpRequest();
  req.open('GET', url, true);
  req.setRequestHeader('Content-Type', 'application/json');
  req.setRequestHeader('Accept', 'application/json');
  req.onload = () => {
    resolve();
  };
  req.onerror = () => {
    reject();
  };
  req.send();
});

// example of keeping track of context between async operations
const prepareClickEvent = () => {
  const url1 = 'https://httpbin.org/get';

  const element = document.getElementById('button1');

  const onClick = () => {
    for (let i = 0, j = 5; i < j; i += 1) {
      const span1 = webTracerWithZone.startSpan(`files-series-info-${i}`);
      context.with(trace.setSpan(context.active(), span1), () => {
        getData(url1).then((_data) => {
          trace.getSpan(context.active()).addEvent('fetching-span1-completed');
          span1.end();
        }, () => {
          trace.getSpan(context.active()).addEvent('fetching-error');
          span1.end();
        });
      });
    }
  };
  element.addEventListener('click', onClick);
};

window.addEventListener('load', prepareClickEvent);
