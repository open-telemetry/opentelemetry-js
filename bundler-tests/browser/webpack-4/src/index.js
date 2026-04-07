import { DiagConsoleLogger, diag } from '@opentelemetry/api';
import { logs } from '@opentelemetry/api-logs';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { InstrumentationBase } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { browserDetector } from '@opentelemetry/opentelemetry-browser-detector';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { defaultServiceName } from '@opentelemetry/resources';
import {
  LoggerProvider,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { BasicTracerProvider } from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';

diag.setLogger(new DiagConsoleLogger());

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
new WebTracerProvider();
new FetchInstrumentation();
new XMLHttpRequestInstrumentation();
void browserDetector;
