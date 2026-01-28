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
import type {
  IAnyValue,
  IInstrumentationScope,
  IKeyValue,
  Resource,
} from './internal-types';
import { Attributes } from '@opentelemetry/api';
import { InstrumentationScope } from '@opentelemetry/core';
import { Resource as ISdkResource } from '@opentelemetry/resources';

export function createResource(resource: ISdkResource): Resource {
  const result: Resource = {
    attributes: toAttributes(resource.attributes),
    droppedAttributesCount: 0,
  };

  const schemaUrl = resource.schemaUrl;
  if (schemaUrl && schemaUrl !== '') result.schemaUrl = schemaUrl;

  return result;
}

export function createInstrumentationScope(
  scope: InstrumentationScope
): IInstrumentationScope {
  return {
    name: scope.name,
    version: scope.version,
  };
}

export function toAttributes(attributes: Attributes): IKeyValue[] {
  return Object.keys(attributes).map(key => toKeyValue(key, attributes[key]));
}

export function toKeyValue(key: string, value: unknown): IKeyValue {
  return {
    key: key,
    value: toAnyValue(value),
  };
}

export function toAnyValue(value: unknown): IAnyValue {
  const t = typeof value;
  if (t === 'string') return { stringValue: value as string };
  if (t === 'number') {
    if (!Number.isInteger(value)) return { doubleValue: value as number };
    return { intValue: value as number };
  }
  if (t === 'boolean') return { boolValue: value as boolean };
  if (value instanceof Uint8Array) return { bytesValue: value };
  if (Array.isArray(value)) {
    const values: IAnyValue[] = new Array(value.length);
    for (let i = 0; i < value.length; i++) {
      values[i] = toAnyValue(value[i]);
    }
    return { arrayValue: { values } };
  }
  if (t === 'object' && value != null) {
    const keys = Object.keys(value);
    const values: IKeyValue[] = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
      values[i] = {
        key: keys[i],
        value: toAnyValue((value as Record<string, unknown>)[keys[i]]),
      };
    }
    return { kvlistValue: { values } };
  }

  return {};
}
