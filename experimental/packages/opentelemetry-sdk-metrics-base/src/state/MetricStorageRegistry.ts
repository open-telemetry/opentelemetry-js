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

import { MetricStorage } from './MetricStorage';
import {
  getDescriptorIncompatibilityDetails, isDescriptorAsync,
  isDescriptorCompatibleWith
} from '../InstrumentDescriptor';
import * as api from '@opentelemetry/api';
import { Maybe } from '../utils';

/**
 * Internal class for storing @{LinkMetricStorage}
 */
export class MetricStorageRegistry {
  private readonly _metricStorageRegistry = new Map<string, MetricStorage>();

  getStorages(): IterableIterator<MetricStorage> {
    return this._metricStorageRegistry.values();
  }

  register<T extends MetricStorage>(storage: T): Maybe<T> {
    const expectedDescriptor = storage.getInstrumentDescriptor();

    // create and register a new one if it does not exist yet.
    if (!this._metricStorageRegistry.has(expectedDescriptor.name)) {
      this._metricStorageRegistry.set(expectedDescriptor.name, storage);
      return storage;
    }

    // We already checked for existence with has()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const existingStorage = this._metricStorageRegistry.get(expectedDescriptor.name)!;
    const existingDescriptor = existingStorage.getInstrumentDescriptor();

    // Return storage if it is compatible.
    if (isDescriptorCompatibleWith(existingDescriptor, expectedDescriptor)) {
      // Is compatible, but views for async instruments cannot be registered twice.
      if (isDescriptorAsync(existingDescriptor)) {
        api.diag.warn(`A view for an async instrument with the name '${expectedDescriptor.name}' has already been registered.`);
        return undefined;
      }

      return (existingStorage as T);
    }

    // Throw an error if it is not compatible.
    throw new Error('A view or instrument with the name'
      + expectedDescriptor.name
      + 'has already been registered and is incompatible with another registered view.\n'
      + 'Details:\n'
      + getDescriptorIncompatibilityDetails(existingDescriptor, expectedDescriptor));
  }
}
