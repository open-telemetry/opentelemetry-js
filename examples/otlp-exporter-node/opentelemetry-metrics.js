'use strict';

const { DiagConsoleLogger, DiagLogLevel, diag, metrics } = require('@opentelemetry/api');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
// const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-grpc');
// const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-proto');
// const { ConsoleMetricExporter } = require('@opentelemetry/sdk-metrics');
const {
  MeterProvider,
  PeriodicExportingMetricReader,
  AggregationType,
} = require('@opentelemetry/sdk-metrics');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');

// Optional: set up diagnostics logging, this can help in troubleshooting during development.
// - It is recommended to turn this off in production as the DiagConsoleLogger writes to stdout.
// - If writing to stdout is acceptable to you, it is recommended to change the log level to WARNING or ERROR.
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

// Create an OTLP exporter. Not specifying a `url` in the constructor options will have it export to `localhost`
// and the OTLP port (4318 for HTTP, 4317 for gRPC). You can set additional headers via the constructor options.
const metricExporter = new OTLPMetricExporter();

// Create an instance of the SDK MeterProvider - this is only directly used during SDK setup, it will be registered with
// the API at the end.
const meterProvider = new MeterProvider({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'basic-metric-service',
  }),
  // With views, you can change the telemetry exported by your app. In this example, you can re-aggregate a Histogram
  // named `test_exponential_histogram` as an Exponential Histogram. You can also drop metrics based on their Meter name,
  // re-name specific metrics, and allow-list or block-list certain attributes.
  //
  // Please see the documentation of the `ViewOptions` type for details on how to change metrics streams.
  views: [{
    aggregation: { type: AggregationType.EXPONENTIAL_HISTOGRAM },
    // Note, the instrumentName is the same as the name that has been passed for
    // the Meter#createHistogram function for exponentialHistogram.
    instrumentName: 'test_exponential_histogram',
  }],
  readers: [
    new PeriodicExportingMetricReader({
      exporter: metricExporter,
      // exporter: new ConsoleMetricExporter(),
      exportIntervalMillis: 1000,
    }),
  ],
});

// Set up shutdown behavior as OTel JS does NOT automatically shut down and flush data.
// By setting this up, you can ensure that previously written data is flushed before the process exits.
// By not setting this up, you risk data-loss on shutdown - especially on short-lived processes.

// Gracefully shutdown Trace SDK if a SIGTERM is received
process.on('SIGTERM', () => meterProvider.shutdown());
// Gracefully shutdown Trace SDK if Node.js is exiting normally
process.once('beforeExit', () => meterProvider.shutdown());

// Register the MeterProvider as the global MeterProvider - this is what makes the MeterProvider available via
// `metrics.getMeterProvider()` or `metrics.getMeter()`
// From here on out, you should never have to refer to the SDK MeterProvider again.
metrics.setGlobalMeterProvider(meterProvider);

