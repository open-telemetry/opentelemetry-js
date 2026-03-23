import { logs } from '@opentelemetry/api-logs';
import { diag, DiagConsoleLogger } from '@opentelemetry/api';
import { InstrumentationBase } from '@opentelemetry/instrumentation';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import {
  LoggerProvider,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs';

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
  body: 'test-event-body',
  eventName: 'custom.event',
});

class TestInstrumentation extends InstrumentationBase {
  init() {
    return [];
  }
}

new TestInstrumentation('test', '0.0.0');
