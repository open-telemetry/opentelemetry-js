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

import { InstrumentationLibrary } from '@opentelemetry/core';
import { InstrumentDescriptor } from '../InstrumentDescriptor';
import { InstrumentSelector } from './InstrumentSelector';
import { MeterSelector } from './MeterSelector';
import { View } from './View';

interface RegisteredView {
  instrumentSelector: InstrumentSelector;
  meterSelector: MeterSelector;
  view: View;
}

export class ViewRegistry {
  private static DEFAULT_VIEW = new View();
  private _registeredViews: RegisteredView[] = [];

  addView(view: View, instrumentSelector: InstrumentSelector = new InstrumentSelector(), meterSelector: MeterSelector = new MeterSelector()) {
    this._registeredViews.push({
      instrumentSelector,
      meterSelector,
      view,
    });
  }

  findViews(instrument: InstrumentDescriptor, meter: InstrumentationLibrary): View[] {
    const views = this._registeredViews
      .filter(registeredView => {
        return this._matchInstrument(registeredView.instrumentSelector, instrument) &&
          this._matchMeter(registeredView.meterSelector, meter);
      })
      .map(it => it.view);

    if (views.length === 0) {
      return [ViewRegistry.DEFAULT_VIEW];
    }
    return views;
  }

  private _matchInstrument(selector: InstrumentSelector, instrument: InstrumentDescriptor): boolean {
    return (selector.getType() === undefined || instrument.type === selector.getType()) &&
      selector.getNameFilter().match(instrument.name);
  }

  private _matchMeter(selector: MeterSelector, meter: InstrumentationLibrary): boolean {
    return selector.getNameFilter().match(meter.name) &&
      (meter.version === undefined || selector.getVersionFilter().match(meter.version)) &&
      (meter.schemaUrl === undefined || selector.getSchemaUrlFilter().match(meter.schemaUrl));
  }
}
