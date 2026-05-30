/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { merge } from '@opentelemetry/core';
import { loadDefaultConfig } from './config';
import type { TracerConfig } from './types-shim';
import { reconfigureLimits } from './utility';
import { TracerProvider } from '@opentelemetry/sdk-trace';

/**
 * A TracerProvider implementation that reads configuration defaults from
 * OTEL_* environment variables per
 * https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/
 */
export class BasicTracerProvider extends TracerProvider {
  constructor(config: TracerConfig = {}) {
    const mergedConfig = merge(
      {},
      loadDefaultConfig(),
      reconfigureLimits(config)
    );
    delete mergedConfig.generalLimits;
    super(mergedConfig);
  }
}
