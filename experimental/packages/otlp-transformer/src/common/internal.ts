/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
import type { Encoder } from './utils';

export function createResource(
  resource: ISdkResource,
  encoder: Encoder
): Resource {
  const result: Resource = {
    attributes: toAttributes(resource.attributes, encoder),
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

export function toAttributes(
  attributes: Attributes,
  encoder: Encoder
): IKeyValue[] {
  return Object.keys(attributes).map(key =>
    toKeyValue(key, attributes[key], encoder)
  );
}

export function toKeyValue(
  key: string,
  value: unknown,
  encoder: Encoder
): IKeyValue {
  return {
    key: key,
    value: toAnyValue(value, encoder),
  };
}

export function toAnyValue(value: unknown, encoder: Encoder): IAnyValue {
  const t = typeof value;
  if (t === 'string') return { stringValue: value as string };
  if (t === 'number') {
    if (!Number.isInteger(value)) return { doubleValue: value as number };
    return { intValue: value as number };
  }
  if (t === 'boolean') return { boolValue: value as boolean };
  if (value instanceof Uint8Array)
    return { bytesValue: encoder.encodeUint8Array(value) };
  if (Array.isArray(value)) {
    const values: IAnyValue[] = new Array(value.length);
    for (let i = 0; i < value.length; i++) {
      values[i] = toAnyValue(value[i], encoder);
    }
    return { arrayValue: { values } };
  }
  if (t === 'object' && value != null) {
    const keys = Object.keys(value);
    const values: IKeyValue[] = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
      values[i] = {
        key: keys[i],
        value: toAnyValue((value as Record<string, unknown>)[keys[i]], encoder),
      };
    }
    return { kvlistValue: { values } };
  }

  return {};
}
