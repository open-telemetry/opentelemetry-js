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

import { MetricProducer } from '@opentelemetry/sdk-metrics';

/**
 * Configuration interface for prometheus exporter
 */
export interface ExporterConfig {
  /**
   * App prefix for metrics, if needed
   *
   * @default ''
   * */
  prefix?: string;

  /**
   * Append timestamp to metrics
   * @default true
   */
  appendTimestamp?: boolean;

  /**
   * Endpoint the metrics should be exposed at with preceding slash
   * @default '/metrics'
   */
  endpoint?: string;

  /**
   * @default undefined (all interfaces)
   */
  host?: string;

  /**
   * Port number for Prometheus exporter server
   *
   * Default registered port is 9464:
   * https://github.com/prometheus/prometheus/wiki/Default-port-allocations
   * @default 9464
   */
  port?: number;

  /**
   * Prevent the Prometheus exporter server from starting
   * @default false
   */
  preventServerStart?: boolean;

  /**
   * **Note, this option is experimental**. Additional MetricProducers to use as a source of
   * aggregated metric data in addition to the SDK's metric data. The resource returned by
   * these MetricProducers is ignored; the SDK's resource will be used instead.
   * @experimental
   */
  metricProducers?: MetricProducer[];

  /**
   * Regex pattern for defining which resource attributes will be applied
   * as constant labels to the metrics.
   * e.g. 'telemetry_.+' for all attributes starting with 'telemetry'.
   * @default undefined (no resource attributes are applied)
   */
  withResourceConstantLabels?: RegExp;

  /**
   * If true, the target_info metric is not included in scraped metrics.
   * @default false (target_info metric is included)
   */
  withoutTargetInfo?: boolean;
}
