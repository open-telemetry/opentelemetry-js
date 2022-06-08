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

/** Properties of an InstrumentationScope. */
export interface IInstrumentationScope {
  /** InstrumentationScope name */
  name: string

  /** InstrumentationScope version */
  version?: string;
}

/** Properties of a KeyValue. */
export interface IKeyValue {
  /** KeyValue key */
  key: string;

  /** KeyValue value */
  value: IAnyValue;
}

/** Properties of an AnyValue. */
export interface IAnyValue {
  /** AnyValue stringValue */
  stringValue?: (string | null);

  /** AnyValue boolValue */
  boolValue?: (boolean | null);

  /** AnyValue intValue */
  intValue?: (number | null);

  /** AnyValue doubleValue */
  doubleValue?: (number | null);

  /** AnyValue arrayValue */
  arrayValue?: IArrayValue;

  /** AnyValue kvlistValue */
  kvlistValue?: IKeyValueList;

  /** AnyValue bytesValue */
  bytesValue?: Uint8Array;
}

/** Properties of an ArrayValue. */
export interface IArrayValue {
  /** ArrayValue values */
  values: IAnyValue[];
}

/** Properties of a KeyValueList. */
export interface IKeyValueList {
  /** KeyValueList values */
  values: IKeyValue[];
}
