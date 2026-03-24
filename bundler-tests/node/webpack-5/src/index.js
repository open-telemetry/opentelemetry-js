const { diag, DiagConsoleLogger } = require('@opentelemetry/api');
const { logs } = require('@opentelemetry/api-logs');
const { InstrumentationBase } = require('@opentelemetry/instrumentation');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const {
  LoggerProvider,
  SimpleLogRecordProcessor,
} = require('@opentelemetry/sdk-logs');
const { defaultServiceName } = require('@opentelemetry/resources');

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
