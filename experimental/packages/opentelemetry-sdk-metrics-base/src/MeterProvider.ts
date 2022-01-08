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

import * as api from '@opentelemetry/api';
import * as metrics from '@opentelemetry/api-metrics-wip';
import { Resource } from '@opentelemetry/resources';
import { Meter } from './Meter';
import { MetricReader } from './export/MetricReader';
import { MeterProviderSharedState } from './state/MeterProviderSharedState';
import { InstrumentSelector } from './view/InstrumentSelector';
import { MeterSelector } from './view/MeterSelector';
import { View } from './view/View';
import { MetricCollector } from './state/MetricCollector';

// https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#meterprovider

export type MeterProviderOptions = {
  resource?: Resource;
}

export class MeterProvider {
  private _sharedState: MeterProviderSharedState;
  private _shutdown = false;

  constructor(options?: MeterProviderOptions) {
    this._sharedState = new MeterProviderSharedState(options?.resource ?? Resource.empty());
  }

  getMeter(name: string, version = '', options: metrics.MeterOptions = {}): metrics.Meter {
    // https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#meter-creation
    if (this._shutdown) {
        api.diag.warn('A shutdown MeterProvider cannot provide a Meter')
        return metrics.NOOP_METER;
    }

    return new Meter(this._sharedState, { name, version, schemaUrl: options.schemaUrl });
  }

  addMetricReader(metricReader: MetricReader) {
    const collector = new MetricCollector(this._sharedState, metricReader);
    metricReader.setMetricProducer(collector);
    this._sharedState.metricCollectors.push(collector);
  }

  addView(view: View, instrumentSelector: InstrumentSelector, meterSelector: MeterSelector) {
    // https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#view
    this._sharedState.viewRegistry.addView(view, instrumentSelector, meterSelector);
  }

  /**
   * Flush all buffered data and shut down the MeterProvider and all registered
   * MetricReaders.
   * Returns a promise which is resolved when all flushes are complete.
   *
   * TODO: return errors to caller somehow?
   */
  async shutdown(): Promise<void> {
    // https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#shutdown

    if (this._shutdown) {
      api.diag.warn('shutdown may only be called once per MeterProvider');
      return;
    }

    // TODO add a timeout - spec leaves it up the the SDK if this is configurable
    this._shutdown = true;

    for (const collector of this._sharedState.metricCollectors) {
      try {
        await collector.shutdown();
      } catch (e) {
        // Log all Errors.
        if (e instanceof Error) {
          api.diag.error(`Error shutting down: ${e.message}`)
        }
      }
    }
  }

  /**
   * Notifies all registered MetricReaders to flush any buffered data.
   * Returns a promise which is resolved when all flushes are complete.
   *
   * TODO: return errors to caller somehow?
   */
  async forceFlush(): Promise<void> {
    // https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#forceflush

    // TODO add a timeout - spec leaves it up the the SDK if this is configurable

    // do not flush after shutdown
    if (this._shutdown) {
      api.diag.warn('invalid attempt to force flush after shutdown')
      return;
    }

    for (const collector of this._sharedState.metricCollectors) {
      try {
        await collector.forceFlush();
      } catch (e) {
        // Log all Errors.
        if (e instanceof Error) {
          api.diag.error(`Error flushing: ${e.message}`)
        }
      }
    }
  }
}
