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

import { Attributes, diag } from '@opentelemetry/api';
import { SDK_INFO } from '@opentelemetry/core';
import {
  ATTR_SERVICE_NAME,
  ATTR_TELEMETRY_SDK_LANGUAGE,
  ATTR_TELEMETRY_SDK_NAME,
  ATTR_TELEMETRY_SDK_VERSION,
} from '@opentelemetry/semantic-conventions';
import { Resource } from './Resource';
import { defaultServiceName } from './default-service-name';
import {
  DetectedResource,
  DetectedResourceAttributes,
  EntityRef,
  RawResourceAttribute,
  ResourceOptions,
} from './types';
import { isPromiseLike } from './utils';
import { EntityImpl, mergeEntities } from './entity-impl';
import { Entity } from '@opentelemetry/api';

class ResourceImpl implements Resource {
  private _rawAttributes: RawResourceAttribute[];
  private _asyncAttributesPending = false;
  private _schemaUrl?: string;

  private _memoizedAttributes?: Attributes;

  private _entities: Entity[];
  private _entityRefs: EntityRef[];

  static FromAttributeList(
    attributes: RawResourceAttribute[],
    options?: ResourceOptions
  ): Resource {
    const res = new ResourceImpl([], [], options);
    res._rawAttributes = guardedRawAttributes(attributes);
    res._asyncAttributesPending =
      attributes.filter(([_, val]) => isPromiseLike(val)).length > 0;
    return res;
  }

  constructor(
    /**
     * A dictionary of attributes with string keys and values that provide
     * information about the entity as numbers, strings or booleans
     * TODO: Consider to add check/validation on attributes.
     */
    attributes: RawResourceAttribute[],
    entities: Entity[],
    options?: ResourceOptions
  ) {
    this._rawAttributes = attributes.map(([k, v]) => {
      if (isPromiseLike(v)) {
        // side-effect
        this._asyncAttributesPending = true;
      }
      return [k, v];
    });

    this._entities = entities;
    this._entityRefs = this._entities.map(entity => {
      if (entity.asyncAttributesPending) {
        this._asyncAttributesPending = true;
      }

      return {
        type: entity.type,
        identifyingAttributeKeys: Object.keys(entity.identifier),
        descriptiveAttributeKeys: entity.attributes
          ? Object.keys(entity.attributes)
          : [],
      };
    });

    this._rawAttributes = guardedRawAttributes(this._rawAttributes);
    this._schemaUrl = validateSchemaUrl(options?.schemaUrl);
  }

  addEntity(entity: Entity): Resource {
    const newEntities = [...this._entities, entity];
    return new ResourceImpl(this._rawAttributes, newEntities, {
      schemaUrl: this._schemaUrl,
    });
  }

  public get asyncAttributesPending(): boolean {
    return (
      this._asyncAttributesPending ||
      this._entities.reduce<boolean>(
        (p, c) => p || c.asyncAttributesPending,
        false
      )
    );
  }

  public async waitForAsyncAttributes(): Promise<void> {
    if (!this.asyncAttributesPending) {
      return;
    }

    for (let i = 0; i < this._rawAttributes.length; i++) {
      const [k, v] = this._rawAttributes[i];
      this._rawAttributes[i] = [k, isPromiseLike(v) ? await v : v];
    }

    for (const e of this._entities) {
      await e.waitForAsyncAttributes();
    }

    this._asyncAttributesPending = false;
  }

  public get attributes(): Attributes {
    if (this.asyncAttributesPending) {
      diag.error(
        'Accessing resource attributes before async attributes settled'
      );
    }

    if (this._memoizedAttributes) {
      return this._memoizedAttributes;
    }

    const attrs: Attributes = {};

    for (const e of this._entities) {
      for (const [k, v] of Object.entries(e.identifier)) {
        if (v != null) {
          attrs[k] = v;
        }
      }
      if (e.attributes) {
        for (const [k, v] of Object.entries(e.attributes)) {
          attrs[k] ??= v;
        }
      }
    }

    for (const [k, v] of this._rawAttributes) {
      if (isPromiseLike(v)) {
        diag.debug(`Unsettled resource attribute ${k} skipped`);
        continue;
      }
      if (v != null) {
        attrs[k] ??= v;
      }
    }

    // only memoize output if all attributes are settled
    if (!this._asyncAttributesPending) {
      this._memoizedAttributes = attrs;
    }

    return attrs;
  }

  public get entityRefs(): EntityRef[] {
    return this._entityRefs;
  }

  public get entities(): Entity[] {
    return this._entities;
  }

  public getRawAttributes(): RawResourceAttribute[] {
    return this._rawAttributes;
  }

  public get schemaUrl(): string | undefined {
    return this._schemaUrl;
  }

  public merge(resource: Resource | null): Resource {
    if (resource == null) return this;

    // Order is important
    // Spec states incoming attributes override existing attributes
    const attrs = [...resource.getRawAttributes(), ...this.getRawAttributes()];

    // TODO order opposite?
    const entities = mergeEntities(...this._entities, ...resource.entities);

    const mergedSchemaUrl = mergeSchemaUrl(this, resource);
    const mergedOptions: ResourceOptions | undefined = mergedSchemaUrl
      ? { schemaUrl: mergedSchemaUrl }
      : undefined;

    return new ResourceImpl(attrs, entities, mergedOptions);
  }
}

export function resourceFromAttributes(
  attributes: DetectedResourceAttributes,
  options?: ResourceOptions
): Resource {
  return ResourceImpl.FromAttributeList(Object.entries(attributes), options);
}

export function resourceFromDetectedResource(
  detectedResource: DetectedResource,
  options?: ResourceOptions
): Resource {
  const entities = (detectedResource.entities ?? []).map(
    e => new EntityImpl(e)
  );
  const rawAttributes = Object.entries(detectedResource.attributes ?? {});
  return new ResourceImpl(rawAttributes, entities, options);
}

export function emptyResource(): Resource {
  return resourceFromAttributes({});
}

export function defaultResource(): Resource {
  return resourceFromAttributes({
    [ATTR_SERVICE_NAME]: defaultServiceName(),
    [ATTR_TELEMETRY_SDK_LANGUAGE]: SDK_INFO[ATTR_TELEMETRY_SDK_LANGUAGE],
    [ATTR_TELEMETRY_SDK_NAME]: SDK_INFO[ATTR_TELEMETRY_SDK_NAME],
    [ATTR_TELEMETRY_SDK_VERSION]: SDK_INFO[ATTR_TELEMETRY_SDK_VERSION],
  });
}

function guardedRawAttributes(
  attributes: RawResourceAttribute[]
): RawResourceAttribute[] {
  return attributes.map(([k, v]) => {
    if (isPromiseLike(v)) {
      return [
        k,
        v.catch(err => {
          diag.debug(
            'promise rejection for resource attribute: %s - %s',
            k,
            err
          );
          return undefined;
        }),
      ];
    }
    return [k, v];
  });
}

function validateSchemaUrl(schemaUrl?: string): string | undefined {
  if (typeof schemaUrl === 'string' || schemaUrl === undefined) {
    return schemaUrl;
  }

  diag.warn(
    'Schema URL must be string or undefined, got %s. Schema URL will be ignored.',
    schemaUrl
  );

  return undefined;
}

function mergeSchemaUrl(
  old: Resource,
  updating: Resource | null
): string | undefined {
  const oldSchemaUrl = old?.schemaUrl;
  const updatingSchemaUrl = updating?.schemaUrl;

  const isOldEmpty = oldSchemaUrl === undefined || oldSchemaUrl === '';
  const isUpdatingEmpty =
    updatingSchemaUrl === undefined || updatingSchemaUrl === '';

  if (isOldEmpty) {
    return updatingSchemaUrl;
  }

  if (isUpdatingEmpty) {
    return oldSchemaUrl;
  }

  if (oldSchemaUrl === updatingSchemaUrl) {
    return oldSchemaUrl;
  }

  diag.warn(
    'Schema URL merge conflict: old resource has "%s", updating resource has "%s". Resulting resource will have undefined Schema URL.',
    oldSchemaUrl,
    updatingSchemaUrl
  );

  return undefined;
}
