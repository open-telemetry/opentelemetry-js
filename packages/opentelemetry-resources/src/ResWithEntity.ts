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

import { Attributes, AttributeValue, diag } from '@opentelemetry/api';
import { Entity, EntityRef, mergeEntities } from './entity';
import { DetectedResourceAttributes, ResourceAttributes } from './types';
import { isPromiseLike } from './utils';

export class ResWithEntity {
  private _rawAttributes: [string, AttributeValue | Promise<AttributeValue>][];
  private _asyncAttributesPending = false;
  private _entities: Entity[];
  private _entityRefs: EntityRef[];
  private _asyncAttributesPromise?: Promise<ResourceAttributes>;

  private _memoizedAttributes?: Attributes;

  constructor(
    /**
     * A dictionary of attributes with string keys and values that provide
     * information about the entity as numbers, strings or booleans
     * TODO: Consider to add check/validation on attributes.
     */
    attributes: DetectedResourceAttributes,
    /** @deprecated please put all sync and async atributes in the first parameter */
    asyncAttributesPromise?: Promise<ResourceAttributes>,
    entities: Entity[] = []
  ) {
    this._entities = entities;
    this._asyncAttributesPromise = asyncAttributesPromise;
    this._rawAttributes = Object.entries(attributes).map(([k, v]) => {
      if (isPromiseLike(v)) {
        // side-effect
        this._asyncAttributesPending = true;

        return [
          k,
          v.then(
            v => v,
            err => {
              diag.debug(
                "a resource's async attributes promise rejected: %s",
                err
              );
              return [k, undefined];
            }
          ),
        ];
      }

      return [k, v];
    });

    this._entityRefs = entities.map(entity => {
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
  }

  public get asyncAttributesPending() {
    return (
      this._asyncAttributesPromise != null ||
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

    if (this._asyncAttributesPromise) {
      for (const [k, v] of await Promise.all(
        Object.entries(await this._asyncAttributesPromise)
      )) {
        if (v != null) {
          this._rawAttributes.push([k, v]);
        }
      }
    }

    this._rawAttributes = await Promise.all(
      this._rawAttributes.map<Promise<[string, AttributeValue]>>(
        async ([k, v]) => [k, await v]
      )
    );
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
        attrs[k] = v;
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
      attrs[k] ??= v;
    }

    // only memoize output if all attributes are settled
    if (!this._asyncAttributesPending) {
      this._memoizedAttributes = attrs;
    }

    return attrs;
  }

  public get entityRefs() {
    return this._entityRefs;
  }

  public merge(resource: ResWithEntity) {
    // incoming attributes and entities have a lower priority
    const rawAttributes: DetectedResourceAttributes = {};
    for (const [k, v] of [...this._rawAttributes, ...resource._rawAttributes]) {
      rawAttributes[k] ??= v;
    }

    const entities = mergeEntities(...this._entities, ...resource._entities);

    return new ResWithEntity(rawAttributes, undefined, entities);
  }
}
