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
import { isDescriptorCompatibleWith } from '../InstrumentDescriptor';
import * as api from '@opentelemetry/api';
import { Maybe } from '../utils';
import { getConflictResolutionRecipe, getIncompatibilityDetails } from '../view/RegistrationConflicts';

/**
 * Internal class for storing {@link MetricStorage}
 */
export class MetricStorageRegistry {
  private readonly _metricStorageRegistry = new Map<string, MetricStorage[]>();

  static create(){
    return new MetricStorageRegistry();
  }

  getStorages(): MetricStorage[] {
    let storages: MetricStorage[] = [];
    for (const metricStorages of this._metricStorageRegistry.values()) {
      storages = storages.concat(metricStorages);
    }

    return storages;
  }

  register<T extends MetricStorage>(storage: T): Maybe<T> {
    const expectedDescriptor = storage.getInstrumentDescriptor();
    const existingStorages = this._metricStorageRegistry.get(expectedDescriptor.name);

    // Add storage if it does not exist.
    if (existingStorages === undefined) {
      this._metricStorageRegistry.set(expectedDescriptor.name, [storage]);
      return storage;
    }

    let compatibleStorage = null;

    for (const existingStorage of existingStorages) {
      const existingDescriptor = existingStorage.getInstrumentDescriptor();

      if (isDescriptorCompatibleWith(existingDescriptor, expectedDescriptor)) {
        // Use the longer description if it does not match.
        if (existingDescriptor.description !== expectedDescriptor.description) {
          if (expectedDescriptor.description.length > existingDescriptor.description.length) {
            existingStorage.updateDescription(expectedDescriptor.description);
          }

          api.diag.warn('A view or instrument with the name ',
            expectedDescriptor.name,
            ' has already been registered, but has a different description and is incompatible with another registered view.\n',
            'Details:\n',
            getIncompatibilityDetails(existingDescriptor, expectedDescriptor),
            'The longer description will be used.\nTo resolve the conflict:',
            getConflictResolutionRecipe(existingDescriptor, expectedDescriptor));
        }
        // Storage is fully compatible. There will never be more than one pre-existing fully compatible storage.
        compatibleStorage = existingStorage as T;
      } else {
        // The implementation SHOULD warn about duplicate instrument registration
        // conflicts after applying View configuration.
        api.diag.warn('A view or instrument with the name ',
          expectedDescriptor.name,
          ' has already been registered and is incompatible with another registered view.\n',
          'Details:\n',
          getIncompatibilityDetails(existingDescriptor, expectedDescriptor),
          'To resolve the conflict:\n',
          getConflictResolutionRecipe(existingDescriptor, expectedDescriptor));
      }
    }

    if (compatibleStorage != null) {
      return compatibleStorage;
    }

    // None of the storages were compatible, add the current one to the list.
    existingStorages.push(storage);
    return storage;
  }
}
