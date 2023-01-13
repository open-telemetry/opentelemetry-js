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
import {
  AttributesProcessor,
  FilteringAttributesProcessor,
} from './AttributesProcessor';
import { InstrumentSelector } from './InstrumentSelector';
import { MeterSelector } from './MeterSelector';
import { Aggregation } from './Aggregation';
import { InstrumentType } from '../InstrumentDescriptor';

export type ViewOptions = {
  /**
   *  Alters the metric stream:
   *  This will be used as the name of the metrics stream.
   *  If not provided, the original Instrument name will be used.
   */
  name?: string;
  /**
   * Alters the metric stream:
   * This will be used as the description of the metrics stream.
   * If not provided, the original Instrument description will be used by default.
   *
   * @example <caption>changes the description of all selected instruments to 'sample description'</caption>
   * description: 'sample description'
   */
  description?: string;
  /**
   * Alters the metric stream:
   * If provided, the attributes that are not in the list will be ignored.
   * If not provided, all attribute keys will be used by default.
   *
   * @example <caption>drops all attributes with top-level keys except for 'myAttr' and 'myOtherAttr'</caption>
   * attributeKeys: ['myAttr', 'myOtherAttr']
   * @example <caption>drops all attributes</caption>
   * attributeKeys: []
   */
  attributeKeys?: string[];
  /**
   * Alters the metric stream:
   * Alters the {@link Aggregation} of the metric stream.
   *
   * @example <caption>changes the aggregation of the selected instrument(s) to ExplicitBucketHistogramAggregation</caption>
   * aggregation: new ExplicitBucketHistogramAggregation([1, 10, 100])
   * @example <caption>changes the aggregation of the selected instrument(s) to LastValueAggregation</caption>
   * aggregation: new LastValueAggregation()
   */
  aggregation?: Aggregation;
  /**
   * Instrument selection criteria:
   * The original type of the Instrument(s).
   *
   * @example <caption>selects all counters</caption>
   * instrumentType: InstrumentType.COUNTER
   * @example <caption>selects all histograms</caption>
   * instrumentType: InstrumentType.HISTOGRAM
   */
  instrumentType?: InstrumentType;
  /**
   * Instrument selection criteria:
   * Original name of the Instrument(s) with wildcard support.
   *
   * @example <caption>select all instruments</caption>
   * instrumentName: '*'
   * @example <caption>select all instruments starting with 'my.instruments.'</caption>
   * instrumentName: 'my.instruments.*'
   * @example <caption>select all instruments named 'my.instrument.requests' exactly</caption>
   * instrumentName: 'my.instruments.requests'
   */
  instrumentName?: string;
  /**
   * Instrument selection criteria:
   * The name of the Meter. No wildcard support, name must match the meter exactly.
   *
   * @example <caption>select all meters named 'example.component.app' exactly</caption>
   * meterName: 'example.component.app'
   */
  meterName?: string;
  /**
   * Instrument selection criteria:
   * The version of the Meter. No wildcard support, version must match exactly.
   *
   * @example
   * meterVersion: '1.0.1'
   */
  meterVersion?: string;
  /**
   * Instrument selection criteria:
   * The schema URL of the Meter. No wildcard support, schema URL must match exactly.
   *
   * @example <caption>Select all meters with schema URL 'https://example.com/schema' exactly.</caption>
   * meterSchemaUrl: 'https://example.com/schema'
   */
  meterSchemaUrl?: string;
};

function isSelectorNotProvided(options: ViewOptions): boolean {
  return (
    options.instrumentName == null &&
    options.instrumentType == null &&
    options.meterName == null &&
    options.meterVersion == null &&
    options.meterSchemaUrl == null
  );
}

/**
 * Can be passed to a {@link MeterProvider} to select instruments and alter their metric stream.
 */
export class View {
  readonly name?: string;
  readonly description?: string;
  readonly aggregation: Aggregation;
  readonly attributesProcessor: AttributesProcessor;
  readonly instrumentSelector: InstrumentSelector;
  readonly meterSelector: MeterSelector;

  /**
   * Create a new {@link View} instance.
   *
   * Parameters can be categorized as two types:
   *  Instrument selection criteria: Used to describe the instrument(s) this view will be applied to.
   *  Will be treated as additive (the Instrument has to meet all the provided criteria to be selected).
   *
   *  Metric stream altering: Alter the metric stream of instruments selected by instrument selection criteria.
   *
   * @param viewOptions {@link ViewOptions} for altering the metric stream and instrument selection.
   * @param viewOptions.name
   * Alters the metric stream:
   *  This will be used as the name of the metrics stream.
   *  If not provided, the original Instrument name will be used.
   * @param viewOptions.description
   * Alters the metric stream:
   *  This will be used as the description of the metrics stream.
   *  If not provided, the original Instrument description will be used by default.
   * @param viewOptions.attributeKeys
   * Alters the metric stream:
   *  If provided, the attributes that are not in the list will be ignored.
   *  If not provided, all attribute keys will be used by default.
   * @param viewOptions.aggregation
   * Alters the metric stream:
   *  Alters the {@link Aggregation} of the metric stream.
   * @param viewOptions.instrumentName
   * Instrument selection criteria:
   *  Original name of the Instrument(s) with wildcard support.
   * @param viewOptions.instrumentType
   * Instrument selection criteria:
   *  The original type of the Instrument(s).
   * @param viewOptions.meterName
   * Instrument selection criteria:
   *  The name of the Meter. No wildcard support, name must match the meter exactly.
   * @param viewOptions.meterVersion
   * Instrument selection criteria:
   *  The version of the Meter. No wildcard support, version must match exactly.
   * @param viewOptions.meterSchemaUrl
   * Instrument selection criteria:
   *  The schema URL of the Meter. No wildcard support, schema URL must match exactly.
   *
   * @example
   * // Create a view that changes the Instrument 'my.instrument' to use to an
   * // ExplicitBucketHistogramAggregation with the boundaries [20, 30, 40]
   * new View({
   *   aggregation: new ExplicitBucketHistogramAggregation([20, 30, 40]),
   *   instrumentName: 'my.instrument'
   * })
   */
  constructor(viewOptions: ViewOptions) {
    // If no criteria is provided, the SDK SHOULD treat it as an error.
    // It is recommended that the SDK implementations fail fast.
    if (isSelectorNotProvided(viewOptions)) {
      throw new Error('Cannot create view with no selector arguments supplied');
    }

    // the SDK SHOULD NOT allow Views with a specified name to be declared with instrument selectors that
    // may select more than one instrument (e.g. wild card instrument name) in the same Meter.
    if (
      viewOptions.name != null &&
      (viewOptions?.instrumentName == null ||
        PatternPredicate.hasWildcard(viewOptions.instrumentName))
    ) {
      throw new Error(
        'Views with a specified name must be declared with an instrument selector that selects at most one instrument per meter.'
      );
    }

    // Create AttributesProcessor if attributeKeys are defined set.
    if (viewOptions.attributeKeys != null) {
      this.attributesProcessor = new FilteringAttributesProcessor(
        viewOptions.attributeKeys
      );
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
      schemaUrl: viewOptions.meterSchemaUrl,
    });
  }
}
