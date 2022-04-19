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
import * as metrics from '@opentelemetry/api-metrics';
import { Resource } from '@opentelemetry/resources';
import { MetricReader } from './export/MetricReader';
import { MeterProviderSharedState } from './state/MeterProviderSharedState';
import { InstrumentSelector } from './view/InstrumentSelector';
import { MeterSelector } from './view/MeterSelector';
import { View } from './view/View';
import { MetricCollector } from './state/MetricCollector';
import { Aggregation } from './view/Aggregation';
import { FilteringAttributesProcessor } from './view/AttributesProcessor';
import { InstrumentType } from './InstrumentDescriptor';
import { PatternPredicate } from './view/Predicate';
import { ForceFlushOptions, ShutdownOptions } from './types';

/**
 * MeterProviderOptions provides an interface for configuring a MeterProvider.
 */
export interface MeterProviderOptions {
  /** Resource associated with metric telemetry  */
  resource?: Resource;
}

export type ViewOptions = {
  /**
   *  If not provided, the Instrument name will be used by default. This will be used as the name of the metrics stream.
   */
  name?: string,
  /**
   * If not provided, the Instrument description will be used by default.
   */
  description?: string,
  /**
   * If provided, the attributes that are not in the list will be ignored.
   * If not provided, all the attribute keys will be used by default.
   */
  attributeKeys?: string[],
  /**
   * The {@link Aggregation} aggregation to be used.
   */
  aggregation?: Aggregation,

  // TODO: Add ExemplarReservoir
};

export type SelectorOptions = {
  instrument?: {
    /**
     * The type of the Instrument(s).
     */
    type?: InstrumentType,
    /**
     * Name of the Instrument(s) with wildcard support.
     */
    name?: string,
  }
  meter?: {
    /**
     * The name of the Meter.
     */
    name?: string;
    /**
     * The version of the Meter.
     */
    version?: string;
    /**
     * The schema URL of the Meter.
     */
    schemaUrl?: string;
  }
};

function isViewOptionsEmpty(options: ViewOptions): boolean {
  return (options.name == null &&
    options.aggregation == null &&
    options.attributeKeys == null &&
    options.description == null);
}

/**
 * This class implements the {@link metrics.MeterProvider} interface.
 */
export class MeterProvider implements metrics.MeterProvider {
  private _sharedState: MeterProviderSharedState;
  private _shutdown = false;

  constructor(options?: MeterProviderOptions) {
    this._sharedState = new MeterProviderSharedState(options?.resource ?? Resource.empty());
  }

  /**
   * Get a meter with the configuration of the MeterProvider.
   */
  getMeter(name: string, version = '', options: metrics.MeterOptions = {}): metrics.Meter {
    // https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#meter-creation
    if (this._shutdown) {
      api.diag.warn('A shutdown MeterProvider cannot provide a Meter');
      return metrics.NOOP_METER;
    }

    return this._sharedState
      .getMeterSharedState({ name, version, schemaUrl: options.schemaUrl })
      .meter;
  }

  /**
   * Register a {@link MetricReader} to the meter provider. After the
   * registration, the MetricReader can start metrics collection.
   *
   * @param metricReader the metric reader to be registered.
   */
  addMetricReader(metricReader: MetricReader) {
    const collector = new MetricCollector(this._sharedState, metricReader);
    metricReader.setMetricProducer(collector);
    this._sharedState.metricCollectors.push(collector);
  }

  addView(options: ViewOptions, selectorOptions?: SelectorOptions) {
    if (isViewOptionsEmpty(options)) {
      throw new Error('Cannot create view with no view arguments supplied');
    }

    // the SDK SHOULD NOT allow Views with a specified name to be declared with instrument selectors that
    // may select more than one instrument (e.g. wild card instrument name) in the same Meter.
    if (options.name != null &&
      (selectorOptions?.instrument?.name == null ||
        PatternPredicate.hasWildcard(selectorOptions.instrument.name))) {
      throw new Error('Views with a specified name must be declared with an instrument selector that selects at most one instrument per meter.');
    }

    // Create AttributesProcessor if attributeKeys are defined set.
    let attributesProcessor = undefined;
    if (options.attributeKeys != null) {
      attributesProcessor = new FilteringAttributesProcessor(options.attributeKeys);
    }

    const view = new View({
      name: options.name,
      description: options.description,
      aggregation: options.aggregation,
      attributesProcessor: attributesProcessor
    });
    const instrument = new InstrumentSelector(selectorOptions?.instrument);
    const meter = new MeterSelector(selectorOptions?.meter);

    this._sharedState.viewRegistry.addView(view, instrument, meter);
  }

  /**
   * Flush all buffered data and shut down the MeterProvider and all registered
   * MetricReaders.
   *
   * Returns a promise which is resolved when all flushes are complete.
   */
  async shutdown(options?: ShutdownOptions): Promise<void> {
    if (this._shutdown) {
      api.diag.warn('shutdown may only be called once per MeterProvider');
      return;
    }

    this._shutdown = true;

    await Promise.all(this._sharedState.metricCollectors.map(collector => {
      return collector.shutdown(options);
    }));
  }

  /**
   * Notifies all registered MetricReaders to flush any buffered data.
   *
   * Returns a promise which is resolved when all flushes are complete.
   */
  async forceFlush(options?: ForceFlushOptions): Promise<void> {
    // do not flush after shutdown
    if (this._shutdown) {
      api.diag.warn('invalid attempt to force flush after MeterProvider shutdown');
      return;
    }

    await Promise.all(this._sharedState.metricCollectors.map(collector => {
      return collector.forceFlush(options);
    }));
  }
}
