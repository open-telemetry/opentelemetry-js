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

import { PatternPredicate } from './Predicate';
import { AttributesProcessor, FilteringAttributesProcessor } from './AttributesProcessor';
import { InstrumentSelector } from './InstrumentSelector';
import { MeterSelector } from './MeterSelector';
import { SelectorOptions, ViewOptions } from '../MeterProvider';
import { Aggregation } from './Aggregation';

export class UserView {
  readonly name?: string;
  readonly description?: string;
  readonly aggregation: Aggregation;
  readonly attributesProcessor: AttributesProcessor;
  readonly instrumentSelector: InstrumentSelector;
  readonly meterSelector: MeterSelector;

  constructor(viewOptions: ViewOptions, selectorOptions?: SelectorOptions) {
    // TODO: spec says that: If no criteria is provided, the SDK SHOULD treat it as an error. This is regarding to selectorOptions, not viewOptions.
    /*if (isViewOptionsEmpty(viewOptions)) {
      throw new Error('Cannot create view with no view arguments supplied');
    }*/

    // the SDK SHOULD NOT allow Views with a specified name to be declared with instrument selectors that
    // may select more than one instrument (e.g. wild card instrument name) in the same Meter.
    if (viewOptions.name != null &&
      (selectorOptions?.instrument?.name == null ||
        PatternPredicate.hasWildcard(selectorOptions.instrument.name))) {
      throw new Error('Views with a specified name must be declared with an instrument selector that selects at most one instrument per meter.');
    }

    // Create AttributesProcessor if attributeKeys are defined set.
    if (viewOptions.attributeKeys != null) {
      this.attributesProcessor = new FilteringAttributesProcessor(viewOptions.attributeKeys);
    } else {
      this.attributesProcessor = AttributesProcessor.Noop();
    }

    this.name = viewOptions.name;
    this.description = viewOptions.description;
    this.aggregation = viewOptions.aggregation ?? Aggregation.Default();
    this.instrumentSelector = new InstrumentSelector(selectorOptions?.instrument);
    this.meterSelector = new MeterSelector(selectorOptions?.meter);
  }
}
