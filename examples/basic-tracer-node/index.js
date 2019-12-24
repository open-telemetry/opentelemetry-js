const opentelemetry = require('@opentelemetry/core');
const { BasicTracer, SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');
const { StackdriverTraceExporter } = require('@opentelemetry/exporter-stackdriver-trace');
const { CollectorExporter } = require('@opentelemetry/exporter-collector');

const options = {
  serviceName: 'basic-service',
  logger: new opentelemetry.ConsoleLogger(),
};

// Initialize an exporter depending on how we were started
let exporter;

const EXPORTER = process.env.EXPORTER || '';
if (EXPORTER.toLowerCase().startsWith('z')) {
  exporter = new ZipkinExporter(options);
} else if (EXPORTER.toLowerCase().startsWith('j')) {
  exporter = new JaegerExporter(options);
} else if (EXPORTER.toLowerCase().startsWith('s')) {
  exporter = new StackdriverTraceExporter(Object.assign({}, options, {
    keyFile: './service_account_key.json',
    projectId: require('./service_account_key.json').project_id
  }));
} else {
  exporter = new CollectorExporter(options);
}

const tracer = new BasicTracer();

// Configure span processor to send spans to the provided exporter
tracer.addSpanProcessor(new SimpleSpanProcessor(exporter));

// Initialize the OpenTelemetry APIs to use the BasicTracer bindings
opentelemetry.initGlobalTracer(tracer);

// Create a span. A span must be closed.
const span = opentelemetry.getTracer().startSpan('main');
for (let i = 0; i < 10; i++) {
  doWork(span, i);
}
// Be sure to end the span.
span.end();

// flush and close the connection.
exporter.shutdown();

function doWork(parent, index) {
  // Start another span. In this example, the main method already started a
  // span, so that'll be the parent span, and this will be a child span.
  const span = opentelemetry.getTracer().startSpan('doWork', {
    parent: parent
  });

  const countTo = Math.random() * 40000000;

  // simulate some random work.
  for (let i = 0; i <= Math.floor(countTo); i++) { }

  // Set attributes to the span.
  span.setAttribute('index', index);
  span.setAttribute('count to', countTo);
  span.setAttribute('invald', { object: 'not allowed' })

  // Annotate our span to capture metadata about our operation
  span.addEvent('invoking doWork').end();
}
