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
  InstrumentDescriptor,
  isDescriptorCompatibleWith,
} from '../InstrumentDescriptor';
import * as api from '@opentelemetry/api';
import {
  getConflictResolutionRecipe,
  getIncompatibilityDetails,
} from '../view/RegistrationConflicts';
import { MetricCollectorHandle } from './MetricCollector';

type StorageMap = Map<string, MetricStorage[]>;

/**
 * Internal class for storing {@link MetricStorage}
 */
export class MetricStorageRegistry {
  private readonly _sharedRegistry: StorageMap = new Map();
  private readonly _perCollectorRegistry = new Map<
    MetricCollectorHandle,
    StorageMap
  >();

  static create() {
    return new MetricStorageRegistry();
  }

  getStorages(collector: MetricCollectorHandle): MetricStorage[] {
    let storages: MetricStorage[] = [];
    for (const metricStorages of this._sharedRegistry.values()) {
      storages = storages.concat(metricStorages);
    }

    const perCollectorStorages = this._perCollectorRegistry.get(collector);
    if (perCollectorStorages != null) {
      for (const metricStorages of perCollectorStorages.values()) {
        storages = storages.concat(metricStorages);
      }
    }

    return storages;
  }

  register(storage: MetricStorage) {
    this._registerStorage(storage, this._sharedRegistry);
  }

  registerForCollector(
    collector: MetricCollectorHandle,
    storage: MetricStorage
  ) {
    let storageMap = this._perCollectorRegistry.get(collector);
    if (storageMap == null) {
      storageMap = new Map();
      this._perCollectorRegistry.set(collector, storageMap);
    }
    this._registerStorage(storage, storageMap);
  }

  findOrUpdateCompatibleStorage<T extends MetricStorage>(
    expectedDescriptor: InstrumentDescriptor
  ): T | null {
    const storages = this._sharedRegistry.get(expectedDescriptor.name);
    if (storages === undefined) {
      return null;
    }

    // If the descriptor is compatible, the type of their metric storage
    // (either SyncMetricStorage or AsyncMetricStorage) must be compatible.
    return this._findOrUpdateCompatibleStorage<T>(expectedDescriptor, storages);
  }

  findOrUpdateCompatibleCollectorStorage<T extends MetricStorage>(
    collector: MetricCollectorHandle,
    expectedDescriptor: InstrumentDescriptor
  ): T | null {
    const storageMap = this._perCollectorRegistry.get(collector);
    if (storageMap === undefined) {
      return null;
    }

    const storages = storageMap.get(expectedDescriptor.name);
    if (storages === undefined) {
      return null;
    }

    // If the descriptor is compatible, the type of their metric storage
    // (either SyncMetricStorage or AsyncMetricStorage) must be compatible.
    return this._findOrUpdateCompatibleStorage<T>(expectedDescriptor, storages);
  }

  private _registerStorage(storage: MetricStorage, storageMap: StorageMap) {
    const descriptor = storage.getInstrumentDescriptor();
    const storages = storageMap.get(descriptor.name);

    if (storages === undefined) {
      storageMap.set(descriptor.name, [storage]);
      return;
    }

    storages.push(storage);
  }

  private _findOrUpdateCompatibleStorage<T extends MetricStorage>(
    expectedDescriptor: InstrumentDescriptor,
    existingStorages: MetricStorage[]
  ): T | null {
    let compatibleStorage = null;

    for (const existingStorage of existingStorages) {
      const existingDescriptor = existingStorage.getInstrumentDescriptor();

      if (isDescriptorCompatibleWith(existingDescriptor, expectedDescriptor)) {
        // Use the longer description if it does not match.
        if (existingDescriptor.description !== expectedDescriptor.description) {
          if (
            expectedDescriptor.description.length >
            existingDescriptor.description.length
          ) {
            existingStorage.updateDescription(expectedDescriptor.description);
          }

          api.diag.warn(
            'A view or instrument with the name ',
            expectedDescriptor.name,
            ' has already been registered, but has a different description and is incompatible with another registered view.\n',
            'Details:\n',
            getIncompatibilityDetails(existingDescriptor, expectedDescriptor),
            'The longer description will be used.\nTo resolve the conflict:',
            getConflictResolutionRecipe(existingDescriptor, expectedDescriptor)
          );
        }
        // Storage is fully compatible. There will never be more than one pre-existing fully compatible storage.
        compatibleStorage = existingStorage as T;
      } else {
        // The implementation SHOULD warn about duplicate instrument registration
        // conflicts after applying View configuration.
        api.diag.warn(
          'A view or instrument with the name ',
          expectedDescriptor.name,
          ' has already been registered and is incompatible with another registered view.\n',
          'Details:\n',
          getIncompatibilityDetails(existingDescriptor, expectedDescriptor),
          'To resolve the conflict:\n',
          getConflictResolutionRecipe(existingDescriptor, expectedDescriptor)
        );
      }
    }

    return compatibleStorage;
  }
}
