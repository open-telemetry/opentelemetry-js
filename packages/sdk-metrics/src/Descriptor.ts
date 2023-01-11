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

import { MetricOptions, ValueType } from '@opentelemetry/api';
import { View } from './view/View';

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
export interface Descriptor {
  readonly name: string;
  readonly description: string;
  readonly unit: string;
  readonly valueType: ValueType;
}

/**
 * An interface describing the instrument.
 * @deprecated Please use {@link Descriptor} instead.
 */
export interface InstrumentDescriptor extends Descriptor {
  /**
   * The original instrument's type.
   * @deprecated Any necessary information about a metric's properties is available in the data point.
   */
  readonly type: InstrumentType;
}

/**
 * An interface describing an actual instrument or virtual instrument (created by views).
 * Only intended for internal use. For exporting descriptor data, use {@link Descriptor} instead.
 */
export interface MetricDescriptor extends Descriptor {
  /**
   * The original instrument's type.
   */
  readonly type: InstrumentType;
}

export function toExternal(descriptor: MetricDescriptor): InstrumentDescriptor {
  return {
    name: descriptor.name,
    description: descriptor.description,
    unit: descriptor.unit,
    type: descriptor.type,
    valueType: descriptor.valueType,
  };
}

export function createDescriptor(
  name: string,
  type: InstrumentType,
  options?: MetricOptions
): MetricDescriptor {
  return {
    name,
    type: type,
    description: options?.description ?? '',
    unit: options?.unit ?? '',
    valueType: options?.valueType ?? ValueType.DOUBLE,
  };
}

export function createDescriptorWithView(
  view: View,
  instrument: MetricDescriptor
): MetricDescriptor {
  return {
    name: view.name ?? instrument.name,
    description: view.description ?? instrument.description,
    type: instrument.type,
    unit: instrument.unit,
    valueType: instrument.valueType,
  };
}

export function isDescriptorCompatibleWith(
  descriptor: MetricDescriptor,
  otherDescriptor: MetricDescriptor
) {
  return (
    descriptor.name === otherDescriptor.name &&
    descriptor.unit === otherDescriptor.unit &&
    descriptor.type === otherDescriptor.type &&
    descriptor.valueType === otherDescriptor.valueType
  );
}
