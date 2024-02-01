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

import {
  PushMetricExporter,
  AggregationTemporality,
  ResourceMetrics,
  AggregationTemporalitySelector,
  InstrumentType,
} from '@opentelemetry/sdk-metrics';
import { AggregationTemporalityPreference } from '@opentelemetry/exporter-metrics-otlp-http';
import {
  DeltaTemporalitySelector,
  CumulativeTemporalitySelector,
  LowMemoryTemporalitySelector,
} from '@opentelemetry/otlp-metrics-exporter-base';
import { ExportResult } from '@opentelemetry/core';

import { LegacyConfig, createMetricsExporter } from '../platform';

/**
 * Legacy OTLPMetricExporter.
 *  - This method of constructing an exporter will continue to be supported in 1.0 of this
 * package, but no new features will be added.
 *  - This method of constructing the exporter will be dropped with 2.0.
 *
 * Please use {@link createMetricsExporter} instead.
 */
export class OTLPMetricExporter implements PushMetricExporter {
  private _exporter: PushMetricExporter;

  constructor(config?: LegacyConfig) {
    let selector: AggregationTemporalitySelector | undefined;
    if (
      config?.temporalityPreference ===
        AggregationTemporalityPreference.DELTA ||
      config?.temporalityPreference === AggregationTemporality.DELTA
    ) {
      selector = DeltaTemporalitySelector;
    } else if (
      config?.temporalityPreference ===
        AggregationTemporalityPreference.CUMULATIVE ||
      config?.temporalityPreference === AggregationTemporality.CUMULATIVE
    ) {
      selector = CumulativeTemporalitySelector;
    } else if (
      config?.temporalityPreference ===
      AggregationTemporalityPreference.LOWMEMORY
    ) {
      selector = LowMemoryTemporalitySelector;
    }

    // populate keepAlive for use with new settings
    if (config?.keepAlive != null) {
      if (config.httpAgentOptions != null) {
        if (config.httpAgentOptions.keepAlive == null) {
          // specific setting is not set, populate with non-specific setting.
          config.httpAgentOptions.keepAlive = config.keepAlive;
        }
        // do nothing, use specific setting otherwise
      } else {
        // populate specific option if AgentOptions does not exist.
        config.httpAgentOptions = {
          keepAlive: config.keepAlive,
        };
      }
    }

    this._exporter = createMetricsExporter({
      url: config?.url,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore headers will be the correct format
      headers: config?.headers,
      compression: config?.compression,
      concurrencyLimit: config?.concurrencyLimit,
      timeoutMillis: config?.timeoutMillis,
      temporalitySelector: selector,
      agentOptions: config?.httpAgentOptions,
    });
  }

  selectAggregationTemporality(
    instrumentType: InstrumentType
  ): AggregationTemporality {
    return this._exporter.selectAggregationTemporality!(instrumentType);
  }

  export(
    metrics: ResourceMetrics,
    resultCallback: (result: ExportResult) => void
  ): void {
    this._exporter.export(metrics, resultCallback);
  }
  forceFlush(): Promise<void> {
    return this._exporter.forceFlush();
  }
  shutdown(): Promise<void> {
    return this._exporter.shutdown();
  }
}
