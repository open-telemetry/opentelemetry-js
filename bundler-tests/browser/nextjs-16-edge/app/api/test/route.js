import { logs } from '@opentelemetry/api-logs';
import { diag, DiagConsoleLogger } from '@opentelemetry/api';
import { InstrumentationBase } from '@opentelemetry/instrumentation';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import {
  LoggerProvider,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import { defaultServiceName } from '@opentelemetry/resources';

export const runtime = 'edge';

diag.setLogger(new DiagConsoleLogger());

logs.setGlobalLoggerProvider(
  new LoggerProvider({
    processors: [new SimpleLogRecordProcessor(new OTLPLogExporter())],
  })
);

class TestInstrumentation extends InstrumentationBase {
  init() {
    return [];
  }
}

export function GET(request) {
  const serviceName = defaultServiceName();
  const logger = logs.getLogger('bundle-test-nextjs-edge');
  logger.emit({ body: 'test-event-body', eventName: 'custom.event' });
  new TestInstrumentation('test', '0.0.0');
  return new Response(JSON.stringify({ serviceName }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
