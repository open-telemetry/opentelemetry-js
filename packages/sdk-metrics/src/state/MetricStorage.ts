/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HrTime } from '@opentelemetry/api';
import { MetricData } from '../export/MetricData';
import { Maybe } from '../utils';
import { MetricCollectorHandle } from './MetricCollector';
import {
  createInstrumentDescriptor,
  InstrumentDescriptor,
} from '../InstrumentDescriptor';

/**
 * Internal interface.
 *
 * Represents a storage from which we can collect metrics.
 */
export abstract class MetricStorage {
  protected _instrumentDescriptor: InstrumentDescriptor;
  constructor(instrumentDescriptor: InstrumentDescriptor) {
    this._instrumentDescriptor = instrumentDescriptor;
  }

  /**
   * Collects the metrics from this storage.
   *
   * Note: This is a stateful operation and may reset any interval-related
   * state for the MetricCollector.
   */
  abstract collect(
    collector: MetricCollectorHandle,
    collectionTime: HrTime
  ): Maybe<MetricData>;

  getInstrumentDescriptor(): Readonly<InstrumentDescriptor> {
    return this._instrumentDescriptor;
  }

  updateDescription(description: string): void {
    this._instrumentDescriptor = createInstrumentDescriptor(
      this._instrumentDescriptor.name,
      this._instrumentDescriptor.type,
      {
        description: description,
        valueType: this._instrumentDescriptor.valueType,
        unit: this._instrumentDescriptor.unit,
        advice: this._instrumentDescriptor.advice,
      }
    );
  }
}
