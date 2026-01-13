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
'use strict';

import {
  ExperimentalOtlpFileExporter,
  OtlpGrpcExporter,
  OtlpHttpExporter,
} from './commonModel';

export function initializeDefaultTracerProviderConfiguration(): TracerProvider {
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
}

export interface ParentBasedSampler {
  /**
   * Configure root sampler.
   * If omitted or null, always_on is used.
   */
  root: Sampler;

  /**
   * Configure remote_parent_sampled sampler.
   * If omitted or null, always_on is used.
   */
  remote_parent_sampled: Sampler;

  /**
   * Configure remote_parent_not_sampled sampler.
   * If omitted or null, always_off is used.
   */
  remote_parent_not_sampled: Sampler;

  /**
   * Configure local_parent_sampled sampler.
   * If omitted or null, always_on is used.
   */
  local_parent_sampled: Sampler;

  /**
   * Configure local_parent_not_sampled sampler.
   * If omitted or null, always_off is used.
   */
  local_parent_not_sampled: Sampler;
}

export interface TraceIdRatioBasedSampler {
  /**
   * Configure trace_id_ratio.
   */
  ratio: number;
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

export interface ZipkinSpanExporter {
  /**
   * Configure endpoint.
   * If omitted or null, http://localhost:9411/api/v2/spans is used.
   */
  endpoint?: string;

  /**
   * Configure max time (in milliseconds) to wait for each export.
   * Value must be non-negative. A value of 0 indicates indefinite.
   * If omitted or null, 10000 is used.
   */
  timeout?: number;
}

export interface SimpleSpanProcessor {
  /**
   * Configure exporter.
   */
  exporter: SpanExporter;
}
