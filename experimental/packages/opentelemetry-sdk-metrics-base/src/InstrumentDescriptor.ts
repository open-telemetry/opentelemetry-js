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

import { MetricOptions, ValueType } from '@opentelemetry/api-metrics-wip';
import { InstrumentType } from './Instruments';
import { View } from './view/View';


export interface InstrumentDescriptor {
  readonly name: string;
  readonly description: string;
  readonly unit: string;
  readonly type: InstrumentType;
  readonly valueType: ValueType;
}

export function createInstrumentDescriptor(name: string, type: InstrumentType, options?: MetricOptions): InstrumentDescriptor {
  return {
    name,
    type,
    description: options?.description ?? '',
    unit: options?.unit ?? '1',
    valueType: options?.valueType ?? ValueType.DOUBLE,
  };
}

export function createInstrumentDescriptorWithView(view: View, instrument: InstrumentDescriptor): InstrumentDescriptor {
  return {
    name: view.name ?? instrument.name,
    description: view.description ?? instrument.description,
    type: instrument.type,
    unit: instrument.unit,
    valueType: instrument.valueType,
  };
}

export function isDescriptorCompatibleWith(descriptor: InstrumentDescriptor, otherDescriptor: InstrumentDescriptor) {
  return descriptor.name === otherDescriptor.name
    && descriptor.description === otherDescriptor.description
    && descriptor.unit === otherDescriptor.unit
    && descriptor.type === otherDescriptor.type
    && descriptor.valueType === otherDescriptor.valueType;
}

export function getDescriptorIncompatibilityDetails(existing: InstrumentDescriptor, otherDescriptor: InstrumentDescriptor) {
  let incompatibility = '';
  if (existing.description !== otherDescriptor.description) {
    incompatibility += `\n- Description '${existing.description}' does not match '${otherDescriptor.description}'`;
  }
  if (existing.unit !== otherDescriptor.unit) {
    incompatibility += `\n- Unit '${existing.unit}' does not match '${otherDescriptor.description}'`;
  }
  if (existing.type !== otherDescriptor.type) {
    incompatibility += `\n- Type '${existing.type}' does not match '${otherDescriptor.type}'`;
  }
  if (existing.valueType !== otherDescriptor.valueType) {
    incompatibility += `\n- Value Type '${existing.valueType}' does not match '${otherDescriptor.valueType}'`;
  }

  return incompatibility;
}

export function isDescriptorAsync(descriptor: InstrumentDescriptor) {
  return (descriptor.type === InstrumentType.OBSERVABLE_GAUGE ||
    descriptor.type === InstrumentType.OBSERVABLE_UP_DOWN_COUNTER ||
    descriptor.type === InstrumentType.OBSERVABLE_COUNTER);
}
