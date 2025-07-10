'use strict';

const opentelemetry = require('@opentelemetry/sdk-node');
const { metrics } = require('@opentelemetry/api');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');
const { 
  ConsoleMetricExporter, 
  PeriodicExportingMetricReader 
} = require('@opentelemetry/sdk-metrics');

// Test backward compatibility with the old metricReader option
const oldMetricReader = new PeriodicExportingMetricReader({
  exporter: new ConsoleMetricExporter(),
  exportIntervalMillis: 1000,
  exportTimeoutMillis: 500,
});

const sdk = new opentelemetry.NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'backward-compatibility-test',
  }),
  traceExporter: new ConsoleSpanExporter(),
  // This should still work but show a deprecation warning
  metricReader: oldMetricReader,
});

console.log('Testing backward compatibility with metricReader option...');
sdk.start();

// Create a simple metric to verify it works
const meter = metrics.getMeter('test-meter');
const counter = meter.createCounter('test_counter');
counter.add(1);

console.log('Backward compatibility test completed successfully!');
console.log('You should see a deprecation warning above.');

sdk.shutdown().then(() => {
  console.log('Test completed.');
  process.exit(0);
}); 