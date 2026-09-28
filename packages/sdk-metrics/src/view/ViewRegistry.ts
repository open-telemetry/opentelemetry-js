/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { InstrumentationScope } from '@opentelemetry/core';
import type { InstrumentDescriptor } from '../InstrumentDescriptor';
import type { InstrumentSelector } from './InstrumentSelector';
import type { MeterSelector } from './MeterSelector';
import type { View } from './View';

export class ViewRegistry {
  private _registeredViews: View[] = [];

  addView(view: View) {
    this._registeredViews.push(view);
  }

  findViews(
    instrument: InstrumentDescriptor,
    meter: InstrumentationScope
  ): View[] {
    const views = this._registeredViews.filter(registeredView => {
      return (
        this._matchInstrument(registeredView.instrumentSelector, instrument) &&
        this._matchMeter(registeredView.meterSelector, meter)
      );
    });

    return views;
  }

  private _matchInstrument(
    selector: InstrumentSelector,
    instrument: InstrumentDescriptor
  ): boolean {
    return (
      (selector.getType() === undefined ||
        instrument.type === selector.getType()) &&
      selector.getNameFilter().match(instrument.name) &&
      selector.getUnitFilter().match(instrument.unit)
    );
  }

  private _matchMeter(
    selector: MeterSelector,
    meter: InstrumentationScope
  ): boolean {
    return (
      selector.getNameFilter().match(meter.name) &&
      (meter.version === undefined ||
        selector.getVersionFilter().match(meter.version)) &&
      (meter.schemaUrl === undefined ||
        selector.getSchemaUrlFilter().match(meter.schemaUrl))
    );
  }
}
