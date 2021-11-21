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
  abstract process(incoming: Attributes, context: Context): Attributes;

  static Noop() {
    return NOOP;
  }
}

export class NoopAttributesProcessor extends AttributesProcessor {
  process(incoming: Attributes, _context: Context) {
    return incoming;
  }
}

const NOOP = new NoopAttributesProcessor;
