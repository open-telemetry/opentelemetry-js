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

import { MetricAttributes } from '@opentelemetry/api-metrics';
import { hashAttributes } from '../utils';

export interface Hash<ValueType, HashCodeType> {
  (value: ValueType): HashCodeType;
}

export class HashMap<KeyType, ValueType, HashCodeType> {
  private _valueMap = new Map<HashCodeType, ValueType>();
  private _keyMap = new Map<HashCodeType, KeyType>();

  constructor(private _hash: Hash<KeyType, HashCodeType>) {}

  get(key: KeyType, hashCode?: HashCodeType) {
    hashCode ??= this._hash(key);
    return this._valueMap.get(hashCode);
  }

  getOrDefault(key: KeyType, defaultFactory: () => ValueType) {
    const hash = this._hash(key);
    if (this._valueMap.has(hash)) {
      return this._valueMap.get(hash);
    }
    const val = defaultFactory();
    if (!this._keyMap.has(hash)) {
      this._keyMap.set(hash, key);
    }
    this._valueMap.set(hash, val);
    return val;
  }

  set(key: KeyType, value: ValueType, hashCode?: HashCodeType) {
    hashCode ??= this._hash(key);
    if (!this._keyMap.has(hashCode)) {
      this._keyMap.set(hashCode, key);
    }
    this._valueMap.set(hashCode, value);
  }

  has(key: KeyType, hashCode?: HashCodeType) {
    hashCode ??= this._hash(key);
    return this._valueMap.has(hashCode);
  }

  *keys(): IterableIterator<[KeyType, HashCodeType]> {
    const keyIterator = this._keyMap.entries();
    let next = keyIterator.next();
    while (next.done !== true) {
      yield [ next.value[1], next.value[0]];
      next = keyIterator.next();
    }
  }

  *entries(): IterableIterator<[KeyType, ValueType, HashCodeType]> {
    const valueIterator = this._valueMap.entries();
    let next = valueIterator.next();
    while (next.done !== true) {
      // next.value[0] here can not be undefined
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      yield [ this._keyMap.get(next.value[0])!, next.value[1], next.value[0]];
      next = valueIterator.next();
    }
  }

  get size() {
    return this._valueMap.size;
  }
}

export class AttributeHashMap<ValueType> extends HashMap<MetricAttributes, ValueType, string> {
  constructor() {
    super(hashAttributes);
  }
}
