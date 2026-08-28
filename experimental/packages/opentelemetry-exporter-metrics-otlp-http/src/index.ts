/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export { createOtlpHttpMetricExporter, OTLPMetricExporter } from './platform';
export { AggregationTemporalityPreference } from './OTLPMetricExporterOptions';
export type { OTLPMetricExporterOptions } from './OTLPMetricExporterOptions';
export {
  CumulativeTemporalitySelector,
  DeltaTemporalitySelector,
  LowMemoryTemporalitySelector,
  OTLPMetricExporterBase,
} from './OTLPMetricExporterBase';
