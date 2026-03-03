/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, HrTime, Attributes } from '@opentelemetry/api';
import { WritableMetricStorage } from './WritableMetricStorage';

/**
 * Internal interface.
 */
export class MultiMetricStorage implements WritableMetricStorage {
  private readonly _backingStorages: WritableMetricStorage[];
  constructor(backingStorages: WritableMetricStorage[]) {
    this._backingStorages = backingStorages;
  }

  record(
    value: number,
    attributes: Attributes,
    context: Context,
    recordTime: HrTime
  ) {
    this._backingStorages.forEach(it => {
      it.record(value, attributes, context, recordTime);
    });
  }
}
