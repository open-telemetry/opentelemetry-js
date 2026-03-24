const { diag, DiagConsoleLogger } = require('@opentelemetry/api');
const { logs } = require('@opentelemetry/api-logs');
const { InstrumentationBase } = require('@opentelemetry/instrumentation');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const {
  LoggerProvider,
  SimpleLogRecordProcessor,
} = require('@opentelemetry/sdk-logs');
const { W3CTraceContextPropagator } = require('@opentelemetry/core');
const {
  OTLPMetricExporter,
} = require('@opentelemetry/exporter-metrics-otlp-http');
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-http');
const { B3Propagator } = require('@opentelemetry/propagator-b3');
const { defaultServiceName } = require('@opentelemetry/resources');
const { MeterProvider } = require('@opentelemetry/sdk-metrics');
const { BasicTracerProvider } = require('@opentelemetry/sdk-trace-base');

diag.setLogger({
  logger: new DiagConsoleLogger(),
  options: {
    logLevel: 'info',
  },
});

logs.setGlobalLoggerProvider(
  new LoggerProvider({
    processors: [new SimpleLogRecordProcessor(new OTLPLogExporter())],
  })
);

const logger = logs.getLogger('bundle-test-webpack');
logger.emit({
  body: defaultServiceName(),
  eventName: 'custom.event',
});

class TestInstrumentation extends InstrumentationBase {
  init() {
    return [];
  }
}

new TestInstrumentation('test', '0.0.0');
new BasicTracerProvider();
new MeterProvider();
new OTLPTraceExporter();
new OTLPMetricExporter();
new W3CTraceContextPropagator();
new B3Propagator();
