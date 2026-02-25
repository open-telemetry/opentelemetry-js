/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  diag,
  ObservableResult,
  Attributes,
  ValueType,
  BatchObservableResult,
  Observable,
} from '@opentelemetry/api';
import { AttributeHashMap } from './state/HashMap';
import { isObservableInstrument, ObservableInstrument } from './Instruments';

/**
 * The class implements {@link ObservableResult} interface.
 */
export class ObservableResultImpl implements ObservableResult {
  /**
   * @internal
   */
  _buffer = new AttributeHashMap<number>();
  private _instrumentName: string;
  private _valueType: ValueType;

  constructor(instrumentName: string, valueType: ValueType) {
    this._instrumentName = instrumentName;
    this._valueType = valueType;
  }

  /**
   * Observe a measurement of the value associated with the given attributes.
   */
  observe(value: number, attributes: Attributes = {}): void {
    if (typeof value !== 'number') {
      diag.warn(
        `non-number value provided to metric ${this._instrumentName}: ${value}`
      );
      return;
    }
    if (this._valueType === ValueType.INT && !Number.isInteger(value)) {
      diag.warn(
        `INT value type cannot accept a floating-point value for ${this._instrumentName}, ignoring the fractional digits.`
      );
      value = Math.trunc(value);
      // ignore non-finite values.
      if (!Number.isInteger(value)) {
        return;
      }
    }
    this._buffer.set(attributes, value);
  }
}

/**
 * The class implements {@link BatchObservableCallback} interface.
 */
export class BatchObservableResultImpl implements BatchObservableResult {
  /**
   * @internal
   */
  _buffer: Map<ObservableInstrument, AttributeHashMap<number>> = new Map();

  /**
   * Observe a measurement of the value associated with the given attributes.
   */
  observe(
    metric: Observable,
    value: number,
    attributes: Attributes = {}
  ): void {
    if (!isObservableInstrument(metric)) {
      return;
    }
    let map = this._buffer.get(metric);
    if (map == null) {
      map = new AttributeHashMap();
      this._buffer.set(metric, map);
    }
    if (typeof value !== 'number') {
      diag.warn(
        `non-number value provided to metric ${metric._descriptor.name}: ${value}`
      );
      return;
    }
    if (
      metric._descriptor.valueType === ValueType.INT &&
      !Number.isInteger(value)
    ) {
      diag.warn(
        `INT value type cannot accept a floating-point value for ${metric._descriptor.name}, ignoring the fractional digits.`
      );
      value = Math.trunc(value);
      // ignore non-finite values.
      if (!Number.isInteger(value)) {
        return;
      }
    }
    map.set(attributes, value);
  }
}
