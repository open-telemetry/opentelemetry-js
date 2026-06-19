/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Create SDK components from environment variable settings.
 * https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/
 */

import { diag } from '@opentelemetry/api';
import { getNumberFromEnv, getStringFromEnv } from '@opentelemetry/core';
import type {
  Sampler,
  SpanExporter,
  SpanLimits,
} from '@opentelemetry/sdk-trace';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace';
import {
  AlwaysOffSampler,
  AlwaysOnSampler,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace';
import { getNonNegativeNumberFromEnv } from './utils';

const DEFAULT_RATIO = 1;

export function createSamplerFromEnv(): Sampler | undefined {
  const samplerName = getStringFromEnv('OTEL_TRACES_SAMPLER');
  if (samplerName === undefined) {
    return undefined;
  }
  switch (samplerName) {
    case 'always_on':
      return new AlwaysOnSampler();
    case 'always_off':
      return new AlwaysOffSampler();
    case 'parentbased_always_on':
      return new ParentBasedSampler({
        root: new AlwaysOnSampler(),
      });
    case 'parentbased_always_off':
      return new ParentBasedSampler({
        root: new AlwaysOffSampler(),
      });
    case 'traceidratio':
      return new TraceIdRatioBasedSampler(getSamplerRatioFromEnv());
    case 'parentbased_traceidratio':
      return new ParentBasedSampler({
        root: new TraceIdRatioBasedSampler(getSamplerRatioFromEnv()),
      });
    default:
      diag.error(
        `unknown OTEL_TRACES_SAMPLER value "${samplerName}", using default`
      );
      return undefined;
  }
}

function getSamplerRatioFromEnv(): number | undefined {
  const ratio = getNumberFromEnv('OTEL_TRACES_SAMPLER_ARG');
  if (ratio == null) {
    diag.error(
      `OTEL_TRACES_SAMPLER_ARG is blank, defaulting to ${DEFAULT_RATIO}.`
    );
    return DEFAULT_RATIO;
  }

  if (ratio < 0 || ratio > 1) {
    diag.error(
      `OTEL_TRACES_SAMPLER_ARG=${ratio} was given, but it is out of range ([0..1]), defaulting to ${DEFAULT_RATIO}.`
    );
    return DEFAULT_RATIO;
  }

  return ratio;
}

export function createSpanLimitsFromEnv(): SpanLimits | undefined {
  return {
    attributeCountLimit:
      getNumberFromEnv('OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT') ??
      getNumberFromEnv('OTEL_ATTRIBUTE_COUNT_LIMIT'),
    attributeValueLengthLimit:
      getNumberFromEnv('OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT') ??
      getNumberFromEnv('OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT'),
    eventCountLimit: getNumberFromEnv('OTEL_SPAN_EVENT_COUNT_LIMIT'),
    linkCountLimit: getNumberFromEnv('OTEL_SPAN_LINK_COUNT_LIMIT'),
    attributePerEventCountLimit: getNumberFromEnv(
      'OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT'
    ),
    attributePerLinkCountLimit: getNumberFromEnv(
      'OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT'
    ),
  };
}

export function createBatchSpanProcessorFromEnv(
  exporter: SpanExporter
): BatchSpanProcessor {
  return new BatchSpanProcessor({
    exporter,
    maxQueueSize: getNonNegativeNumberFromEnv('OTEL_BSP_MAX_QUEUE_SIZE'),
    scheduledDelayMillis: getNonNegativeNumberFromEnv(
      'OTEL_BSP_SCHEDULE_DELAY'
    ),
    exportTimeoutMillis: getNonNegativeNumberFromEnv('OTEL_BSP_EXPORT_TIMEOUT'),
    maxExportBatchSize: getNonNegativeNumberFromEnv(
      'OTEL_BSP_MAX_EXPORT_BATCH_SIZE'
    ),
  });
}
