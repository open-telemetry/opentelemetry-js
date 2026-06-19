/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Create SDK components from parsed declarative config.
 * https://opentelemetry.io/docs/specs/otel/configuration/sdk/#create
 */

import type {
  AttributeLimitsConfigModel,
  SpanLimitsConfigModel,
} from '@opentelemetry/configuration';
import type { SpanLimits } from '@opentelemetry/sdk-trace';

export function createSpanLimitsFromConfig(
  limits?: SpanLimitsConfigModel,
  attribute_limits?: AttributeLimitsConfigModel
): SpanLimits | undefined {
  if (!limits && !attribute_limits) {
    return undefined;
  }
  return {
    attributeValueLengthLimit:
      limits?.attribute_value_length_limit ??
      attribute_limits?.attribute_value_length_limit ??
      undefined,
    attributeCountLimit:
      limits?.attribute_count_limit ??
      attribute_limits?.attribute_count_limit ??
      undefined,
    eventCountLimit: limits?.event_count_limit ?? undefined,
    linkCountLimit: limits?.link_count_limit ?? undefined,
    attributePerEventCountLimit:
      limits?.event_attribute_count_limit ?? undefined,
    attributePerLinkCountLimit: limits?.link_attribute_count_limit ?? undefined,
  };
}
