/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { getNumberFromEnv } from '@opentelemetry/core';
import type { BufferConfig, SpanExporter } from '@opentelemetry/sdk-trace';
import { BatchSpanProcessor as BatchSpanProcessNoEnvConfig } from '@opentelemetry/sdk-trace';

/**
 * A BatchSpanProcessor that applies `OTEL_*` environment variable fallbacks per
 * https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/
 */
export class BatchSpanProcessor extends BatchSpanProcessNoEnvConfig {
  constructor(exporter: SpanExporter, config?: BufferConfig) {
    if (!config) {
      config = {};
    }
    const envFallbacks: [keyof BufferConfig, string][] = [
      ['maxExportBatchSize', 'OTEL_BSP_MAX_EXPORT_BATCH_SIZE'],
      ['maxQueueSize', 'OTEL_BSP_MAX_QUEUE_SIZE'],
      ['scheduledDelayMillis', 'OTEL_BSP_SCHEDULE_DELAY'],
      ['exportTimeoutMillis', 'OTEL_BSP_EXPORT_TIMEOUT'],
    ];
    for (const [configName, envName] of envFallbacks) {
      if (config[configName] === undefined) {
        const envFallback = getNumberFromEnv(envName);
        if (envFallback !== undefined) {
          config[configName] = envFallback;
        }
      }
    }

    super(exporter, config);
  }
}
