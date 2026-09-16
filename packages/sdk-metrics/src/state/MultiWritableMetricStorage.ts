/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Context, Attributes } from '@opentelemetry/api';
import { context as contextApi } from '@opentelemetry/api';
import type { WritableMetricStorage } from './WritableMetricStorage';

/**
 * Internal interface.
 */
export class MultiMetricStorage implements WritableMetricStorage {
  private readonly _backingStorages: WritableMetricStorage[];
  readonly hasAttributeProcessor: boolean;

  constructor(backingStorages: WritableMetricStorage[]) {
    this._backingStorages = backingStorages;
    this.hasAttributeProcessor = backingStorages.some(
      s => s.hasAttributeProcessor
    );
  }

  record(
    value: number,
    attributes: Attributes,
    context: Context | undefined,
    recordTime: number
  ) {
    if (this.hasAttributeProcessor && context === undefined) {
      context = contextApi.active();
    }
    const storages = this._backingStorages;
    for (let i = 0; i < storages.length; i++) {
      storages[i].record(value, attributes, context, recordTime);
    }
  }
}
