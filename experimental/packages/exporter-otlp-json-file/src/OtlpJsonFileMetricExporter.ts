/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { diag } from '@opentelemetry/api';
import type { ExportResult } from '@opentelemetry/core';
import { ExportResultCode } from '@opentelemetry/core';
import { JsonMetricsSerializer } from '@opentelemetry/otlp-transformer';
import type {
  AggregationOption,
  AggregationSelector,
  AggregationTemporality,
  AggregationTemporalitySelector,
  InstrumentType,
  PushMetricExporter,
  ResourceMetrics,
} from '@opentelemetry/sdk-metrics';
import { AggregationType } from '@opentelemetry/sdk-metrics';
import { OtlpJsonFileWriter } from './OtlpJsonFileWriter';
import type { OtlpJsonFileMetricExporterOptions } from './types';
import {
  AggregationTemporalityPreference,
  CumulativeTemporalitySelector,
  DeltaTemporalitySelector,
  LowMemoryTemporalitySelector,
} from './types';

const DEFAULT_AGGREGATION: AggregationOption = Object.freeze({
  type: AggregationType.DEFAULT,
});

function chooseTemporalitySelector(
  temporalityPreference?:
    | AggregationTemporalityPreference
    | AggregationTemporality
): AggregationTemporalitySelector {
  if (temporalityPreference != null) {
    if (temporalityPreference === AggregationTemporalityPreference.DELTA) {
      return DeltaTemporalitySelector;
    } else if (
      temporalityPreference === AggregationTemporalityPreference.LOWMEMORY
    ) {
      return LowMemoryTemporalitySelector;
    }
    return CumulativeTemporalitySelector;
  }

  return CumulativeTemporalitySelector;
}

function chooseAggregationSelector(
  config?: OtlpJsonFileMetricExporterOptions
): AggregationSelector {
  return config?.aggregationPreference ?? (() => DEFAULT_AGGREGATION);
}

/**
 * An OpenTelemetry metric exporter that writes OTLP-JSON formatted metrics
 * to standard output (process.stdout) or a configurable Writable stream as JSON Lines.
 */
export class OtlpJsonFileMetricExporter implements PushMetricExporter {
  private readonly _writer: OtlpJsonFileWriter;
  private readonly _aggregationTemporalitySelector: AggregationTemporalitySelector;
  private readonly _aggregationSelector: AggregationSelector;

  constructor(config?: OtlpJsonFileMetricExporterOptions) {
    this._writer = new OtlpJsonFileWriter(config);
    this._aggregationTemporalitySelector = chooseTemporalitySelector(
      config?.temporalityPreference
    );
    this._aggregationSelector = chooseAggregationSelector(config);
  }

  /**
   * Exports recorded ResourceMetrics.
   *
   * @param metrics The metrics to export
   * @param resultCallback Callback invoked when export completes
   */
  export(
    metrics: ResourceMetrics,
    resultCallback: (result: ExportResult) => void
  ): void {
    if (
      !metrics ||
      !metrics.scopeMetrics ||
      metrics.scopeMetrics.length === 0
    ) {
      resultCallback({ code: ExportResultCode.SUCCESS });
      return;
    }

    let serialized: Uint8Array | undefined;
    try {
      serialized = JsonMetricsSerializer.serializeRequest(metrics);
    } catch (err: unknown) {
      diag.error('Failed to serialize metrics request', err);
      resultCallback({
        code: ExportResultCode.FAILED,
        error: err instanceof Error ? err : new Error(String(err)),
      });
      return;
    }

    if (!serialized) {
      resultCallback({
        code: ExportResultCode.FAILED,
        error: new Error('Nothing to send'),
      });
      return;
    }

    this._writer.write(serialized, resultCallback);
  }

  /**
   * Selects the aggregation temporality for a given instrument type.
   */
  selectAggregationTemporality(
    instrumentType: InstrumentType
  ): AggregationTemporality {
    return this._aggregationTemporalitySelector(instrumentType);
  }

  /**
   * Selects the aggregation option for a given instrument type.
   */
  selectAggregation(instrumentType: InstrumentType): AggregationOption {
    return this._aggregationSelector(instrumentType);
  }

  /**
   * Shuts down the exporter, ensuring any pending writes are flushed.
   */
  shutdown(): Promise<void> {
    return this._writer.shutdown();
  }

  /**
   * Flushes all pending writes to the stream.
   */
  forceFlush(): Promise<void> {
    return this._writer.forceFlush();
  }
}
