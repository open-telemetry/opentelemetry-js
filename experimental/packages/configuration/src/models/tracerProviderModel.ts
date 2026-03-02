/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

import {
  ExperimentalOtlpFileExporter,
  OtlpGrpcExporter,
  OtlpHttpExporter,
} from './commonModel';

export function initializeDefaultTracerProviderConfiguration(): Required<TracerProvider> {
  return {
    processors: [],
    limits: {
      attribute_count_limit: 128,
      event_count_limit: 128,
      link_count_limit: 128,
      event_attribute_count_limit: 128,
      link_attribute_count_limit: 128,
    },
    sampler: {
      parent_based: {
        root: { always_on: undefined },
        remote_parent_sampled: { always_on: undefined },
        remote_parent_not_sampled: { always_off: undefined },
        local_parent_sampled: { always_on: undefined },
        local_parent_not_sampled: { always_off: undefined },
      },
    },
  };
}

export interface TracerProvider {
  /**
   * Configure span processors.
   */
  processors: SpanProcessor[];

  /**
   * Configure span limits. See also attribute_limits.
   */
  limits?: SpanLimits;

  /**
   * Configure the sampler.
   * If omitted, parent based sampler with a root of always_on is used.
   */
  sampler?: Sampler;
}

export interface BatchSpanProcessor {
  /**
   * Configure delay interval (in milliseconds) between two consecutive exports.
   * Value must be non-negative.
   * If omitted or null, 5000 is used for traces and 1000 for logs.
   */
  schedule_delay?: number;

  /**
   * Configure maximum allowed time (in milliseconds) to export data.
   * Value must be non-negative. A value of 0 indicates no limit (infinity).
   * If omitted or null, 30000 is used.
   */
  export_timeout?: number;

  /**
   * Configure maximum queue size. Value must be positive.
   * If omitted or null, 2048 is used.
   */
  max_queue_size?: number;

  /**
   * Configure maximum batch size. Value must be positive.
   * If omitted or null, 512 is used.
   */
  max_export_batch_size?: number;

  /**
   * Configure exporter.
   */
  exporter: SpanExporter;
}

export interface Sampler {
  /**
   * Configure sampler to be parent_based.
   */
  parent_based?: ParentBasedSampler;

  /**
   * Configure sampler to be always_off.
   */
  always_off?: object;

  /**
   * Configure sampler to be always_on.
   */
  always_on?: object;

  /***
   * Configure sampler to be trace_id_ratio_based.
   */
  trace_id_ratio_based?: TraceIdRatioBasedSampler;

  /**
   * Configure sampler to be probability/development.
   */
  'probability/development'?: ExperimentalProbabilitySampler;

  /**
   * Configure sampler to be composite/development.
   */
  'composite/development'?: ExperimentalComposableSampler;
}

export interface ParentBasedSampler {
  /**
   * Configure root sampler.
   * If omitted or null, always_on is used.
   */
  root?: Sampler;

  /**
   * Configure remote_parent_sampled sampler.
   * If omitted or null, always_on is used.
   */
  remote_parent_sampled?: Sampler;

  /**
   * Configure remote_parent_not_sampled sampler.
   * If omitted or null, always_off is used.
   */
  remote_parent_not_sampled?: Sampler;

  /**
   * Configure local_parent_sampled sampler.
   * If omitted or null, always_on is used.
   */
  local_parent_sampled?: Sampler;

  /**
   * Configure local_parent_not_sampled sampler.
   * If omitted or null, always_off is used.
   */
  local_parent_not_sampled?: Sampler;
}

export interface TraceIdRatioBasedSampler {
  /**
   * Configure trace_id_ratio.
   * If omitted or null, 1.0 is used.
   */
  ratio?: number;
}

export interface ExperimentalProbabilitySampler {
  /**
   * Configure probability ratio.
   * If omitted or null, 1.0 is used.
   */
  ratio?: number;
}

export interface ExperimentalComposableSampler {
  /**
   * Configure composable sampler to be always_off.
   */
  always_off?: object;

  /**
   * Configure composable sampler to be always_on.
   */
  always_on?: object;

  /**
   * Configure composable sampler to be parent_threshold.
   */
  parent_threshold?: ExperimentalComposableParentThresholdSampler;

  /**
   * Configure composable sampler to be probability.
   */
  probability?: ExperimentalComposableProbabilitySampler;

  /**
   * Configure composable sampler to be rule_based.
   */
  rule_based?: ExperimentalComposableRuleBasedSampler;
}

export interface ExperimentalComposableParentThresholdSampler {
  /**
   * Sampler to use when there is no parent.
   */
  root: ExperimentalComposableSampler;
}

export interface ExperimentalComposableProbabilitySampler {
  /**
   * Configure probability ratio.
   * If omitted or null, 1.0 is used.
   */
  ratio?: number;
}

export interface ExperimentalComposableRuleBasedSampler {
  /**
   * The rules for the sampler, matched in order.
   */
  rules?: ExperimentalComposableRuleBasedSamplerRule[];
}

export interface ExperimentalComposableRuleBasedSamplerRule {
  /**
   * Values to match against a single attribute.
   */
  attribute_values?: {
    key: string;
    values: string[];
  };
  /**
   * Patterns to match against a single attribute.
   */
  attribute_patterns?: {
    key: string;
    included?: string[];
    excluded?: string[];
  };
  /**
   * The span kinds to match.
   */
  span_kinds?: string[];
  /**
   * The parent span types to match.
   */
  parent?: string[];
  /**
   * The sampler to use for matching spans.
   */
  sampler: ExperimentalComposableSampler;
}

export interface SimpleSpanProcessor {
  /**
   * Configure exporter.
   */
  exporter: SpanExporter;
}

export interface SpanExporter {
  /**
   * Configure exporter to be OTLP with HTTP transport.
   */
  otlp_http?: OtlpHttpExporter;

  /**
   * Configure exporter to be OTLP with gRPC transport.
   */
  otlp_grpc?: OtlpGrpcExporter;

  /**
   * Configure exporter to be OTLP with file transport.
   * This type is in development and subject to breaking changes in minor versions.
   */
  'otlp_file/development'?: ExperimentalOtlpFileExporter;

  /**
   * Configure exporter to be console.
   */
  console?: object;
}

export interface SpanLimits {
  /**
   * Configure max attribute value size. Overrides .attribute_limits.attribute_value_length_limit.
   * Value must be non-negative.
   * If omitted or null, there is no limit.
   */
  attribute_value_length_limit?: number;

  /**
   * Configure max attribute count. Overrides .attribute_limits.attribute_count_limit.
   * Value must be non-negative.
   * If omitted or null, 128 is used.
   */
  attribute_count_limit?: number;

  /**
   * Configure max span event count.
   * Value must be non-negative.
   * If omitted or null, 128 is used.
   */
  event_count_limit?: number;

  /**
   * Configure max span link count.
   * Value must be non-negative.
   * If omitted or null, 128 is used.
   */
  link_count_limit?: number;

  /**
   * Configure max attributes per span event.
   * Value must be non-negative.
   * If omitted or null, 128 is used.
   */
  event_attribute_count_limit?: number;

  /**
   * Configure max attributes per span link.
   * Value must be non-negative.
   * If omitted or null, 128 is used.
   */
  link_attribute_count_limit?: number;
}

export interface SpanProcessor {
  /**
   * Configure a batch span processor.
   */
  batch?: BatchSpanProcessor;

  /**
   * Configure a simple span processor.
   */
  simple?: SimpleSpanProcessor;
}
