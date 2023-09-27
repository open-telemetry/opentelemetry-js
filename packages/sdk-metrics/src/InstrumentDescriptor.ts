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

import { MetricOptions, ValueType, diag } from '@opentelemetry/api';
import { View } from './view/View';
import { equalsCaseInsensitive } from './utils';

/**
 * Supported types of metric instruments.
 */
export enum InstrumentType {
  COUNTER = 'COUNTER',
  HISTOGRAM = 'HISTOGRAM',
  UP_DOWN_COUNTER = 'UP_DOWN_COUNTER',
  OBSERVABLE_COUNTER = 'OBSERVABLE_COUNTER',
  OBSERVABLE_GAUGE = 'OBSERVABLE_GAUGE',
  OBSERVABLE_UP_DOWN_COUNTER = 'OBSERVABLE_UP_DOWN_COUNTER',
}

/**
 * An interface describing the instrument.
 */
export interface InstrumentDescriptor {
  readonly name: string;
  readonly description: string;
  readonly unit: string;
  readonly type: InstrumentType;
  readonly valueType: ValueType;
}

export function createInstrumentDescriptor(
  name: string,
  type: InstrumentType,
  options?: MetricOptions
): InstrumentDescriptor {
  if (!isValidName(name)) {
    diag.warn(
      `Invalid metric name: "${name}". The metric name should be a ASCII string with a length no greater than 255 characters.`
    );
  }
  return {
    name,
    type,
    description: options?.description ?? '',
    unit: options?.unit ?? '',
    valueType: options?.valueType ?? ValueType.DOUBLE,
  };
}

export function createInstrumentDescriptorWithView(
  view: View,
  instrument: InstrumentDescriptor
): InstrumentDescriptor {
  return {
    name: view.name ?? instrument.name,
    description: view.description ?? instrument.description,
    type: instrument.type,
    unit: instrument.unit,
    valueType: instrument.valueType,
  };
}

export function isDescriptorCompatibleWith(
  descriptor: InstrumentDescriptor,
  otherDescriptor: InstrumentDescriptor
) {
  // Names are case-insensitive strings.
  return (
    equalsCaseInsensitive(descriptor.name, otherDescriptor.name) &&
    descriptor.unit === otherDescriptor.unit &&
    descriptor.type === otherDescriptor.type &&
    descriptor.valueType === otherDescriptor.valueType
  );
}

// ASCII string with a length no greater than 255 characters.
// NB: the first character counted separately from the rest.
const NAME_REGEXP = /^[a-z][a-z0-9_.\-/]{0,254}$/i;
export function isValidName(name: string): boolean {
  return name.match(NAME_REGEXP) != null;
}
