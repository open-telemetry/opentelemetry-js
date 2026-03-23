import { logs } from '@opentelemetry/api-logs';
import { diag, DiagConsoleLogger } from '@opentelemetry/api';
import { InstrumentationBase } from '@opentelemetry/instrumentation';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import {
  LoggerProvider,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import { defaultServiceName } from '@opentelemetry/resources';

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

export function middleware(request) {
  const serviceName = defaultServiceName();
  const logger = logs.getLogger('bundle-test-nextjs-edge');
  logger.emit({ body: 'test-event-body', eventName: 'custom.event' });
  new TestInstrumentation('test', '0.0.0');
  return Response.next();
}

export const config = {
  matcher: '/api/:path*',
};
