/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { MetricProducer } from '@opentelemetry/sdk-metrics';

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
   * @default false
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
   * This option controls the translation of metric names from OpenTelemetry Naming
   * Conventions to Prometheus Naming conventions.
   * @default TranslationStrategy.UnderscoreEscapingWithSuffixes
   * @experimental
   */
  translationStrategy?: (typeof TranslationStrategy)[keyof typeof TranslationStrategy];

  /**
   * Regex pattern for defining which resource attributes will be applied
   * as constant labels to the metrics.
   * e.g. 'telemetry_.+' for all attributes starting with 'telemetry'.
   * @default undefined (no resource attributes are applied)
   */
  withResourceConstantLabels?: RegExp;

  /**
   * If true, scope labels are not included in scraped metrics.
   * @default false (scope labels are included)
   */
  withoutScopeInfo?: boolean;

  /**
   * If true, the target_info metric is not included in scraped metrics.
   * @default false (target_info metric is included)
   */
  withoutTargetInfo?: boolean;
}

export const TranslationStrategy = {
  /**
   * This fully escapes metric names for classic Prometheus metric name compatibility,
   * and includes appending type and unit suffixes. This is the default strategy.
   */
  UnderscoreEscapingWithSuffixes: 'UnderscoreEscapingWithSuffixes',
  /**
   * Metric names will continue to escape special characters to _, but suffixes
   * won’t be attached.
   */
  UnderscoreEscapingWithoutSuffixes: 'UnderscoreEscapingWithoutSuffixes',
  /**
   * Disables changing special characters to _. Special suffixes like units and
   * _total for counters will be attached.
   */
  NoUTF8EscapingWithSuffixes: 'NoUTF8EscapingWithSuffixes',
  /**
   * This strategy bypasses all metric and label name translation, passing them
   * through unaltered.
   */
  NoTranslation: 'NoTranslation',
} as const;
