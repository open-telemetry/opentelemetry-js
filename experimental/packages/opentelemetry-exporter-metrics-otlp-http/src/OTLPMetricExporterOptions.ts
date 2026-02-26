/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { OTLPExporterConfigBase } from '@opentelemetry/otlp-exporter-base';
import {
  AggregationTemporality,
  AggregationSelector,
} from '@opentelemetry/sdk-metrics';

export interface OTLPMetricExporterOptions extends OTLPExporterConfigBase {
  temporalityPreference?:
    | AggregationTemporalityPreference
    | AggregationTemporality;
  aggregationPreference?: AggregationSelector;
}

export enum AggregationTemporalityPreference {
  DELTA,
  CUMULATIVE,
  LOWMEMORY,
}
