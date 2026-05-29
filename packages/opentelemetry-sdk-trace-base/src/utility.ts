/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { TracerConfig } from './types';
import { getNumberFromEnv } from '@opentelemetry/core';

export const DEFAULT_ATTRIBUTE_COUNT_LIMIT = 128;
export const DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT = Infinity;

/**
 * When general limits are provided and model specific limits are not,
 * configures the model specific limits by using the values from the general ones.
 * @param userConfig User provided tracer configuration
 */
export function reconfigureLimits(userConfig: TracerConfig): TracerConfig {
  const spanLimits = Object.assign({}, userConfig.spanLimits);

  /**
   * Reassign span attribute count limit to use first non null value defined by user or use default value
   */
  spanLimits.attributeCountLimit =
    userConfig.spanLimits?.attributeCountLimit ??
    userConfig.generalLimits?.attributeCountLimit ??
    getNumberFromEnv('OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT') ??
    getNumberFromEnv('OTEL_ATTRIBUTE_COUNT_LIMIT') ??
    DEFAULT_ATTRIBUTE_COUNT_LIMIT;

  /**
   * Reassign span attribute value length limit to use first non null value defined by user or use default value
   */
  spanLimits.attributeValueLengthLimit =
    userConfig.spanLimits?.attributeValueLengthLimit ??
    userConfig.generalLimits?.attributeValueLengthLimit ??
    getNumberFromEnv('OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT') ??
    getNumberFromEnv('OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT') ??
    DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT;

  return Object.assign({}, userConfig, { spanLimits });
}
