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
  EntityRef,
  IAnyValue,
  IInstrumentationScope,
  IKeyValue,
  Resource,
} from './internal-types';
import { Attributes } from '@opentelemetry/api';
import { InstrumentationScope } from '@opentelemetry/core';
import {
  Resource as ISdkResource,
  Entity as ISdkEntity,
} from '@opentelemetry/resources';

export function createResource(resource: ISdkResource): Resource {
  const result: Resource = {
    attributes: toAttributes(resource.attributes),
    droppedAttributesCount: 0,
    entityRefs: toEntityRefs(resource.entities),
  };

  const schemaUrl = resource.schemaUrl;
  if (schemaUrl && schemaUrl !== '') result.schemaUrl = schemaUrl;

  return result;
}

export function toEntityRefs(entityRefs: ISdkEntity[]): EntityRef[] {
  return entityRefs.map(ref => ({
    schemaUrl: ref.schemaUrl,
    type: ref.type,
    idKeys: Object.keys(ref.identifier),
    descriptionKeys: Object.keys(ref.attributes),
  }));
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
  if (Array.isArray(value))
    return { arrayValue: { values: value.map(toAnyValue) } };
  if (t === 'object' && value != null)
    return {
      kvlistValue: {
        values: Object.entries(value as object).map(([k, v]) =>
          toKeyValue(k, v)
        ),
      },
    };

  return {};
}
