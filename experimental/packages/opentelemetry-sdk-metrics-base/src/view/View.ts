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

import { Aggregation } from './Aggregation';
import { AttributesProcessor } from './AttributesProcessor';

// https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#view

export interface ViewStreamConfig {
  /**
   * the name of the resulting metric to generate, or null if the same as the instrument.
   */
  name?: string;
  /**
   * the name of the resulting metric to generate, or null if the same as the instrument.
   */
  description?: string;
  /**
   * the aggregation used for this view.
   */
  aggregation?: Aggregation;
  /**
   * processor of attributes before performing aggregation.
   */
  attributesProcessor?: AttributesProcessor;
}

/**
 * A View provides the flexibility to customize the metrics that are output by
 * the SDK. For example, the view can
 * - customize which Instruments are to be processed/ignored.
 * - customize the aggregation.
 * - customize which attribute(s) are to be reported as metrics dimension(s).
 * - add additional dimension(s) from the {@link Context}.
 */
export class View {
  readonly name?: string;
  readonly description?: string;
  readonly aggregation: Aggregation;
  readonly attributesProcessor: AttributesProcessor;

  /**
   * Construct a metric view
   *
   * @param config how the result metric streams were configured
   */
  constructor(config?: ViewStreamConfig) {
    this.name = config?.name;
    this.description = config?.description;
    this.aggregation = config?.aggregation ?? Aggregation.Default();
    this.attributesProcessor = config?.attributesProcessor ?? AttributesProcessor.Noop();
  }
}
