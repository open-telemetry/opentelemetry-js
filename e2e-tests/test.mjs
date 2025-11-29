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
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import {
  diag,
  DiagConsoleLogger,
  DiagLogLevel,
  trace,
  metrics,
} from '@opentelemetry/api';
import { logs } from '@opentelemetry/api-logs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Enable diagnostic logging
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.VERBOSE);

const collectorUrl = 'http://localhost:4318/v1';

/**
 * Scenario: Collector becomes available after initial failures
 *
 * We assume that collector is down when test starts
 *
 * This test verifies that:
 * 1. When the collector is unavailable, exports fail with retryable errors
 * 2. Telemetry can created while collector is down
 * 3. Batch processors buffer the data and retry with exponential backoff
 * 4. When collector starts, retries succeed
 * 5. All telemetry is successfully exported
 *
 */
async function testCollectorRecovery() {
  console.log('[Step 1] Setting up OpenTelemetry SDK...');

  const traceExporter = new OTLPTraceExporter({
    url: `${collectorUrl}/traces`,
  });

  const metricExporter = new OTLPMetricExporter({
    url: `${collectorUrl}/metrics`,
  });

  const logExporter = new OTLPLogExporter({
    url: `${collectorUrl}/logs`,
  });

  const sdk = new NodeSDK({
    spanProcessors: [
      new BatchSpanProcessor(traceExporter, {
        scheduledDelayMillis: 1000,
        exportTimeoutMillis: 30000,
      }),
    ],
    metricReader: new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 30000,
      exportTimeoutMillis: 30000,
    }),
    logRecordProcessors: [
      new BatchLogRecordProcessor(logExporter, {
        scheduledDelayMillis: 1000,
        exportTimeoutMillis: 30000,
      }),
    ],
  });

  sdk.start();
  console.log('✓ SDK started\n');

  const tracer = trace.getTracer('retry-test-tracer');
  const meter = metrics.getMeter('retry-test-meter');
  const logger = logs.getLogger('retry-test-logger');

  console.log('[Step 2] Creating telemetry while collector is DOWN...');

  const span1 = tracer.startSpan('span-before-collector-start');
  span1.setAttribute('status', 'created-while-down');
  span1.setAttribute('attempt', 1);
  span1.end();

  const counter = meter.createCounter('test_counter');
  counter.add(10, { status: 'created-while-down' });

  logger.emit({
    severityText: 'INFO',
    body: 'log-before-collector-start',
    attributes: { status: 'created-while-down' },
  });

  console.log('✓ Created 1 span, 1 metric, 1 log\n');

  console.log('[Step 3] Waiting 2 seconds for first export attempt to fail...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log(
    '✓ First export attempt should have failed, retries should be happening\n'
  );

  console.log(
    '[Step 4] Starting OpenTelemetry Collector (during retry attempts)...'
  );
  await execAsync('npm run run-collector');

  // Wait for collector to be ready (within retry window)
  console.log('Waiting for collector to become ready (2s)...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log('✓ Collector should be ready, retries should now succeed\n');

  // Step 5: Create more telemetry after collector is up
  console.log('[Step 5] Creating telemetry while collector is UP...');

  const span2 = tracer.startSpan('span-after-collector-start');
  span2.setAttribute('status', 'created-while-up');
  span2.setAttribute('attempt', 2);
  span2.end();

  counter.add(20, { status: 'created-while-up' });

  logger.emit({
    severityText: 'INFO',
    body: 'log-after-collector-start',
    attributes: { status: 'created-while-up' },
  });

  // Step 6: Wait for exports to complete
  console.log('[Step 6] Waiting 5 seconds for exports to complete...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  console.log('✓ Export window completed\n');

  // Step 7: Shutdown SDK
  console.log('[Step 7] Shutting down SDK...');
  await sdk.shutdown();
  console.log('✓ SDK shutdown complete\n');
}

async function main() {
  try {
    await testCollectorRecovery();
    process.exit(0);
  } catch (error) {
    console.error('\n✗ SCENARIO FAILED:', error);
    process.exit(1);
  }
}

main();
