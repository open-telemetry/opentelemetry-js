const { DiagConsoleLogger, DiagLogLevel, diag, metrics } = require('@opentelemetry/api');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { MeterProvider, PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');

// Optional and only needed to see the internal diagnostic logging (during development)
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

let interval;
let meter;

function stopMetrics() {
  console.log('STOPPING METRICS');
  clearInterval(interval);
  metrics.getMeterProvider().shutdown()
    .then(() => metrics.disable());
}

function startMetrics() {
  console.log('STARTING METRICS');

  const meterProvider = new MeterProvider({
    readers: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter(),
        exportIntervalMillis: 1000
      }),
    ],
  });
  metrics.setGlobalMeterProvider(meterProvider);

  meter = meterProvider.getMeter('example-exporter-collector')

  const requestCounter = meter.createCounter('requests', {
    description: 'Example of a Counter',
  });

  const upDownCounter = meter.createUpDownCounter('test_up_down_counter', {
    description: 'Example of a UpDownCounter',
  });

  const attributes = { environment: 'staging' };

  interval = setInterval(() => {
    requestCounter.add(1, attributes);
    upDownCounter.add(Math.random() > 0.5 ? 1 : -1, attributes);
  }, 1000);
}

const addClickEvents = () => {
  const startBtn = document.getElementById('startBtn');

  const stopBtn = document.getElementById('stopBtn');
  startBtn.addEventListener('click', startMetrics);
  stopBtn.addEventListener('click', stopMetrics);
};

window.addEventListener('load', addClickEvents);
