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
import { Aggregation } from './Aggregation';
import { InstrumentType } from '../InstrumentDescriptor';

export type ViewOptions = {
  // View
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

  // Instrument
  /**
   * The type of the Instrument(s).
   */
  instrumentType?: InstrumentType,
  /**
   * Name of the Instrument(s) with wildcard support.
   */
  instrumentName?: string,

  // Meter
  /**
   * The name of the Meter.
   */
  meterName?: string;
  /**
   * The version of the Meter.
   */
  meterVersion?: string;
  /**
   * The schema URL of the Meter.
   */
  meterSchemaUrl?: string;
};

export class View {
  readonly name?: string;
  readonly description?: string;
  readonly aggregation: Aggregation;
  readonly attributesProcessor: AttributesProcessor;
  readonly instrumentSelector: InstrumentSelector;
  readonly meterSelector: MeterSelector;

  constructor(viewOptions: ViewOptions) {
    // TODO: spec says that: If no criteria is provided, the SDK SHOULD treat it as an error. This is regarding to selectorOptions, not viewOptions.
    /*if (isViewOptionsEmpty(viewOptions)) {
      throw new Error('Cannot create view with no view arguments supplied');
    }*/

    // the SDK SHOULD NOT allow Views with a specified name to be declared with instrument selectors that
    // may select more than one instrument (e.g. wild card instrument name) in the same Meter.
    if (viewOptions.name != null &&
      (viewOptions?.instrumentName == null ||
        PatternPredicate.hasWildcard(viewOptions.instrumentName))) {
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
    this.instrumentSelector = new InstrumentSelector({
      name: viewOptions.instrumentName,
      type: viewOptions.instrumentType,
    });
    this.meterSelector = new MeterSelector({
      name: viewOptions.meterName,
      version: viewOptions.meterVersion,
      schemaUrl: viewOptions.meterSchemaUrl
    });
  }
}
