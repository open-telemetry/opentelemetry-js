/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { trace, metrics } from '@opentelemetry/api';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { startNodeSDK } from '@opentelemetry/sdk-node';

// `startNodeSDK()` reads OTEL_CONFIG_FILE (set in package.json's start script)
// and wires up trace, metric, and log pipelines from the YAML. No programmatic
// provider construction needed.
const sdk = startNodeSDK();

const tracer = trace.getTracer('example');
const meter = metrics.getMeter('example');
const logger = logs.getLogger('example');

const counter = meter.createCounter('example.requests', {
  description: 'Demo counter incremented per request',
});

async function main(): Promise<void> {
  await tracer.startActiveSpan('example.request', async span => {
    span.setAttribute('example.kind', 'demo');
    counter.add(1, { route: '/hello' });
    logger.emit({
      severityNumber: SeverityNumber.INFO,
      body: 'Handled example request',
      attributes: { route: '/hello' },
    });
    span.end();
  });

  await sdk.shutdown();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
