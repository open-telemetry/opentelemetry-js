/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
