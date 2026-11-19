/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

// Every package with platform-specific implementations, loaded through its CJS build.
const PACKAGES = [
  '@opentelemetry/core',
  '@opentelemetry/exporter-logs-otlp-http',
  '@opentelemetry/exporter-logs-otlp-proto',
  '@opentelemetry/exporter-metrics-otlp-http',
  '@opentelemetry/exporter-metrics-otlp-proto',
  '@opentelemetry/exporter-trace-otlp-http',
  '@opentelemetry/exporter-trace-otlp-proto',
  '@opentelemetry/exporter-zipkin',
  '@opentelemetry/instrumentation',
  '@opentelemetry/resources',
  '@opentelemetry/sdk-logs',
  '@opentelemetry/sdk-trace',
];

function detectPlatform() {
  process.env.OTEL_BUNDLER_TEST = 'set';
  const { getStringFromEnv } = require('@opentelemetry/core');
  const { hostDetector } = require('@opentelemetry/resources');
  const readsEnv = getStringFromEnv('OTEL_BUNDLER_TEST') === 'set';
  const detectsHost = Object.keys(hostDetector.detect().attributes).length > 0;
  return { readsEnv, detectsHost };
}

module.exports = { PACKAGES, detectPlatform };
