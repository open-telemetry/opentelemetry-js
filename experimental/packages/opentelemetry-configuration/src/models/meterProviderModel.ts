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

export interface MeterProvider {
  /**
   * Configure metric readers.
   */
  readers: MetricReader[];

  /**
   * Configure views.
   * Each view has a selector which determines the instrument(s) it applies to,
   * and a configuration for the resulting stream(s).
   */
  view?: View;

  /**
   * Configure the exemplar filter.
   * Values include: trace_based, always_on, always_off.
   * If omitted or null, trace_based is used.
   */
  exemplar_filter?: ExemplarFilter;
}

export enum ExemplarFilter {
  always_on,
  always_off,
  trace_based,
}

export interface PeriodicMetricReader {
  /**
   * Configure delay interval (in milliseconds) between start of two consecutive exports.
   * Value must be non-negative.
   * If omitted or null, 60000 is used.
   */
  interval?: number;

  /**
   * Configure maximum allowed time (in milliseconds) to export data.
   * Value must be non-negative. A value of 0 indicates no limit (infinity).
   * If omitted or null, 30000 is used.
   */
  timeout?: number;

  /**
   * Configure exporter.
   */
  exporter: PushMetricExporter;

  /**
   * Configure metric producers.
   */
  producers?: MetricProducer[];

  /**
   * Configure cardinality limits.
   */
  cardinality_limits?: CardinalityLimits;
}

export interface PullMetricReader {
  /**
   * Configure exporter.
   */
  exporter: PullMetricExporter;

  /**
   * Configure metric producers.
   */
  producers: MetricProducer[];

  /**
   * Configure cardinality limits.
   */
  cardinality_limits: CardinalityLimits;
}

export interface CardinalityLimits {
  /**
   * Configure default cardinality limit for all instrument types.
   * Instrument-specific cardinality limits take priority.
   * If omitted or null, 2000 is used.
   */
  default?: number;

  /**
   * Configure default cardinality limit for counter instruments.
   * If omitted or null, the value from .default is used.
   */
  counter?: number;

  /**
   * Configure default cardinality limit for gauge instruments.
   * If omitted or null, the value from .default is used.
   */
  gauge?: number;

  /**
   * Configure default cardinality limit for histogram instruments.
   * If omitted or null, the value from .default is used.
   */
  histogram?: number;

  /**
   * Configure default cardinality limit for observable_counter instruments.
   * If omitted or null, the value from .default is used.
   */
  observable_counter?: number;

  /**
   * Configure default cardinality limit for observable_gauge instruments.
   * If omitted or null, the value from .default is used.
   */
  observable_gauge?: number;

  /**
   * Configure default cardinality limit for observable_up_down_counter instruments.
   * If omitted or null, the value from .default is used.
   */
  observable_up_down_counter?: number;

  /**
   * Configure default cardinality limit for up_down_counter instruments.
   * If omitted or null, the value from .default is used.
   */
  up_down_counter?: number;
}

export interface PushMetricExporter {
  /**
   * Configure exporter to be OTLP with HTTP transport.
   */
  otlp_http?: OtlpHttpMetricExporter;

  /**
   * Configure exporter to be OTLP with gRPC transport.
   */
  otlp_grpc?: OtlpGrpcMetricExporter;

  /**
   * Configure exporter to be OTLP with file transport.
   * This type is in development and subject to breaking changes in minor versions.
   */
  'otlp_file/development': OtlpFileMetricExporter;

  /**
   * Configure exporter to be console.
   */
  console: object;
}

export interface MetricReader {

}
