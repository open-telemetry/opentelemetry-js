/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export { OTLPMetricExporter } from '#platform';
// Re-exported for backward compatibility. `AggregationTemporalityPreference` now
// lives in `@opentelemetry/sdk-metrics` so that exporters which do not depend on
// OTLP -- notably `ConsoleMetricExporter` -- can share it.
// See https://github.com/open-telemetry/opentelemetry-js/issues/6957
export { AggregationTemporalityPreference } from '@opentelemetry/sdk-metrics';
export type { OTLPMetricExporterOptions } from './OTLPMetricExporterOptions';
export {
  CumulativeTemporalitySelector,
  DeltaTemporalitySelector,
  LowMemoryTemporalitySelector,
  OTLPMetricExporterBase,
} from './OTLPMetricExporterBase';
