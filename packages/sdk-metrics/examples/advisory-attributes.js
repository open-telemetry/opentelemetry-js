#!/usr/bin/env node

/*
 * This example demonstrates the new advisory attributes parameter for metrics instruments.
 * The attributes parameter acts as an allow-list for the instrument, filtering out 
 * all attribute keys that are not in the specified list.
 */

const { MeterProvider } = require('@opentelemetry/sdk-metrics');
const { ConsoleMetricExporter } = require('@opentelemetry/sdk-metrics');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');

// Create a meter provider with a console exporter
const meterProvider = new MeterProvider({
  readers: [
    new PeriodicExportingMetricReader({
      exporter: new ConsoleMetricExporter(),
      exportIntervalMillis: 1000,
    }),
  ],
});

const meter = meterProvider.getMeter('advisory-attributes-example');

// Create a counter with advisory attributes - only 'service' and 'version' keys will be kept
const requestCounter = meter.createCounter('http_requests_total', {
  description: 'Total number of HTTP requests',
  advice: {
    attributes: ['service', 'version'], // @experimental: Only these keys will be allowed
  },
});

// Create a histogram without advisory attributes - all keys will be kept
const responseTimeHistogram = meter.createHistogram('http_response_time', {
  description: 'HTTP response time in milliseconds',
});

// Record some measurements
console.log('Recording metrics with advisory attributes filtering...\n');

// This will only keep 'service' and 'version' attributes, filtering out 'method' and 'endpoint'
requestCounter.add(1, {
  service: 'api-gateway',
  version: '1.2.3',
  method: 'GET',      // This will be filtered out
  endpoint: '/users', // This will be filtered out
});

requestCounter.add(1, {
  service: 'user-service',
  version: '2.1.0',
  method: 'POST',       // This will be filtered out
  endpoint: '/auth',    // This will be filtered out
  region: 'us-west-2',  // This will be filtered out
});

// This will keep all attributes since no advisory attributes are specified
responseTimeHistogram.record(150, {
  service: 'api-gateway',
  method: 'GET',
  endpoint: '/users',
  status_code: '200',
});

responseTimeHistogram.record(89, {
  service: 'user-service',
  method: 'POST',
  endpoint: '/auth',
  status_code: '201',
  region: 'us-west-2',
});

console.log('Check the console output above to see the filtered attributes!');
console.log('The http_requests_total metric should only have service and version attributes.');
console.log('The http_response_time metric should have all attributes.');

// Keep the process running for a bit to see the output
setTimeout(() => {
  console.log('\nShutting down...');
  meterProvider.shutdown();
}, 2000);
