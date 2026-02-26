/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  MetricAdvice,
  MetricOptions,
  ValueType,
  diag,
} from '@opentelemetry/api';
import { View } from './view/View';
import { equalsCaseInsensitive } from './utils';
import { InstrumentType, MetricDescriptor } from './export/MetricData';

/**
 * An internal interface describing the instrument.
 *
 * This is intentionally distinguished from the public MetricDescriptor (a.k.a. InstrumentDescriptor)
 * which may not contains internal fields like metric advice.
 */
export interface InstrumentDescriptor extends MetricDescriptor {
  /**
   * For internal use; exporter should avoid depending on the type of the
   * instrument as their resulting aggregator can be re-mapped with views.
   */
  readonly type: InstrumentType;

  /**
   * See {@link MetricAdvice}
   *
   * @experimental
   */
  readonly advice: MetricAdvice;
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
    advice: options?.advice ?? {},
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
    advice: instrument.advice,
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
  return NAME_REGEXP.test(name);
}
