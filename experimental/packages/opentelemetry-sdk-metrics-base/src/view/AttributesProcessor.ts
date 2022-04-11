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

import { Context } from '@opentelemetry/api';
import { Attributes } from '@opentelemetry/api-metrics';

/**
 * The {@link AttributesProcessor} is responsible for customizing which
 * attribute(s) are to be reported as metrics dimension(s) and adding
 * additional dimension(s) from the {@link Context}.
 */
export abstract class AttributesProcessor {
  /**
   * Process the metric instrument attributes.
   *
   * @param incoming The metric instrument attributes.
   * @param context The active context when the instrument is synchronous.
   * `undefined` otherwise.
   */
  abstract process(incoming: Attributes, context?: Context): Attributes;

  static Noop() {
    return NOOP;
  }
}

export class NoopAttributesProcessor extends AttributesProcessor {
  process(incoming: Attributes, _context?: Context) {
    return incoming;
  }
}

/**
 * {@link AttributesProcessor} that filters by allowed attribute names and drops any names that are not in the
 * allow list.
 */
export class FilteringAttributesProcessor extends AttributesProcessor {
  constructor(private _allowedAttributeNames: string[]) {
    super();
  }

  process(incoming: Attributes, _context: Context): Attributes {
    const filteredAttributes: Attributes = {};
    Object.keys(incoming)
      .filter(attributeName => this._allowedAttributeNames.includes(attributeName))
      .forEach(attributeName => filteredAttributes[attributeName] = incoming[attributeName]);
    return filteredAttributes;
  }
}

const NOOP = new NoopAttributesProcessor;
