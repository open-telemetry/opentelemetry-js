/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Counter, Meter } from '@opentelemetry/api';
import { METRIC_OTEL_SDK_LOG_CREATED } from './semconv';

/**
 * Generates `otel.sdk.log.*` metrics.
 * https://opentelemetry.io/docs/specs/semconv/otel/sdk-metrics/#log-metrics
 */
export class LoggerMetrics {
  private readonly createdLogs: Counter;

  constructor(meter: Meter) {
    this.createdLogs = meter.createCounter(METRIC_OTEL_SDK_LOG_CREATED, {
      unit: '{log_record}',
      description: 'The number of logs submitted to enabled SDK Loggers.',
    });
  }

  emitLog() {
    this.createdLogs.add(1);
  }
}
