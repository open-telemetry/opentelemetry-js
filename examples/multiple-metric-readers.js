/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const process = require('process');
const opentelemetry = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');
const { 
  ConsoleMetricExporter, 
  PeriodicExportingMetricReader 
} = require('@opentelemetry/sdk-metrics');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');

// Create multiple metric readers
const consoleMetricReader = new PeriodicExportingMetricReader({
  exporter: new ConsoleMetricExporter(),
  exportIntervalMillis: 1000,
  exportTimeoutMillis: 500,
});

const prometheusMetricReader = new PrometheusExporter({
  port: 9464,
  endpoint: '/metrics',
});

// Configure the SDK with multiple metric readers
const sdk = new opentelemetry.NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'multiple-metric-readers-example',
  }),
  traceExporter: new ConsoleSpanExporter(),
  // Use the new metricReaders option (plural) instead of the deprecated metricReader (singular)
  metricReaders: [consoleMetricReader, prometheusMetricReader],
  instrumentations: [getNodeAutoInstrumentations()]
});

// Initialize the SDK and register with the OpenTelemetry API
sdk.start();

// Create a meter and some metrics
const meter = opentelemetry.metrics.getMeter('example-meter');
const counter = meter.createCounter('example_counter', {
  description: 'An example counter',
});

// Increment the counter every second
setInterval(() => {
  counter.add(1, { 'example.label': 'value' });
  console.log('Counter incremented');
}, 1000);

// Gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});

console.log('Multiple metric readers example started');
console.log('Metrics will be exported to console and Prometheus endpoint at http://localhost:9464/metrics'); 