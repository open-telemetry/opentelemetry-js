import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import { LoggerProvider, SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { diag, DiagConsoleLogger, DiagLogLevel, trace, metrics } from '@opentelemetry/api';
import { logs } from '@opentelemetry/api-logs';

// Enable diagnostic logging (optional)
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const collectorUrl = 'http://localhost:4318/v1';

// Set up trace exporter with SimpleSpanProcessor
const traceExporter = new OTLPTraceExporter({
    url: `${collectorUrl}/traces`,
});
const spanProcessors = [new SimpleSpanProcessor(traceExporter)];

// Set up metric exporter
const metricExporter = new OTLPMetricExporter({
    url: `${collectorUrl}/metrics`,
});
const metricReader = new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 1000,
});

// Set up log exporter
const logExporter = new OTLPLogExporter({
    url: `${collectorUrl}/logs`,
});
const loggerProvider = new LoggerProvider({
    processors: [new SimpleLogRecordProcessor(logExporter)],
});

// Set up OpenTelemetry SDK
const sdk = new NodeSDK({
    spanProcessors,
    metricReader,
    loggerProvider,
});

async function main() {
    await sdk.start();

    // Create a span
    const tracer = trace.getTracer('example-tracer');
    const span = tracer.startSpan('example-span');
    span.setAttribute('example-attribute', 'value');
    span.end();

    // Create a metric
    const meter = metrics.getMeter('example-meter');
    const counter = meter.createUpDownCounter('example_counter');
    counter.add(42, { foo: 'bar' });

    // Create a log
    const logger = logs.getLogger('example-logger');
    logger.emit({
        severityText: 'INFO',
        body: 'This is an example log message',
        attributes: { foo: 'bar' },
    });

    // flushes exporters and shuts down the SDK
    await sdk.shutdown();
}

main().catch((err) => {
    console.error('Error running example:', err);
    process.exit(1);
});
