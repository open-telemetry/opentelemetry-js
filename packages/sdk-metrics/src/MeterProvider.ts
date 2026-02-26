/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  diag,
  MeterProvider as IMeterProvider,
  Meter as IMeter,
  MeterOptions,
  createNoopMeter,
} from '@opentelemetry/api';
import { defaultResource, Resource } from '@opentelemetry/resources';
import { IMetricReader } from './export/MetricReader';
import { MeterProviderSharedState } from './state/MeterProviderSharedState';
import { MetricCollector } from './state/MetricCollector';
import { ForceFlushOptions, ShutdownOptions } from './types';
import { View, ViewOptions } from './view/View';

/**
 * MeterProviderOptions provides an interface for configuring a MeterProvider.
 */
export interface MeterProviderOptions {
  /** Resource associated with metric telemetry  */
  resource?: Resource;
  views?: ViewOptions[];
  readers?: IMetricReader[];
}

/**
 * This class implements the {@link MeterProvider} interface.
 */
export class MeterProvider implements IMeterProvider {
  private _sharedState: MeterProviderSharedState;
  private _shutdown = false;

  constructor(options?: MeterProviderOptions) {
    this._sharedState = new MeterProviderSharedState(
      options?.resource ?? defaultResource()
    );
    if (options?.views != null && options.views.length > 0) {
      for (const viewOption of options.views) {
        this._sharedState.viewRegistry.addView(new View(viewOption));
      }
    }

    if (options?.readers != null && options.readers.length > 0) {
      for (const metricReader of options.readers) {
        const collector = new MetricCollector(this._sharedState, metricReader);
        metricReader.setMetricProducer(collector);
        this._sharedState.metricCollectors.push(collector);
      }
    }
  }

  /**
   * Get a meter with the configuration of the MeterProvider.
   */
  getMeter(name: string, version = '', options: MeterOptions = {}): IMeter {
    // https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#meter-creation
    if (this._shutdown) {
      diag.warn('A shutdown MeterProvider cannot provide a Meter');
      return createNoopMeter();
    }

    return this._sharedState.getMeterSharedState({
      name,
      version,
      schemaUrl: options.schemaUrl,
    }).meter;
  }

  /**
   * Shut down the MeterProvider and all registered
   * MetricReaders.
   *
   * Returns a promise which is resolved when all flushes are complete.
   */
  async shutdown(options?: ShutdownOptions): Promise<void> {
    if (this._shutdown) {
      diag.warn('shutdown may only be called once per MeterProvider');
      return;
    }

    this._shutdown = true;

    await Promise.all(
      this._sharedState.metricCollectors.map(collector => {
        return collector.shutdown(options);
      })
    );
  }

  /**
   * Notifies all registered MetricReaders to flush any buffered data.
   *
   * Returns a promise which is resolved when all flushes are complete.
   */
  async forceFlush(options?: ForceFlushOptions): Promise<void> {
    // do not flush after shutdown
    if (this._shutdown) {
      diag.warn('invalid attempt to force flush after MeterProvider shutdown');
      return;
    }

    await Promise.all(
      this._sharedState.metricCollectors.map(collector => {
        return collector.forceFlush(options);
      })
    );
  }
}
