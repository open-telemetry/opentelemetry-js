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
import { SDK_INFO } from '@opentelemetry/core';
import {
  ATTR_SERVICE_NAME,
  ATTR_TELEMETRY_SDK_LANGUAGE,
  ATTR_TELEMETRY_SDK_NAME,
  ATTR_TELEMETRY_SDK_VERSION,
} from '@opentelemetry/semantic-conventions';
import { IResource } from './IResource';
import { defaultServiceName } from './platform';
import { DetectedResource, DetectedResourceAttributes } from './types';
import { identity, isPromiseLike } from './utils';

export class Resource implements IResource {
  private _rawAttributes: [
    string,
    AttributeValue | Promise<AttributeValue> | undefined,
  ][];
  private _asyncAttributesPending = false;

  private _memoizedAttributes?: Attributes;

  public static EMPTY = new Resource({});
  /**
   * Returns a Resource that identifies the SDK in use.
   */
  static default(): IResource {
    return new Resource({
      attributes: {
        [ATTR_SERVICE_NAME]: defaultServiceName(),
        [ATTR_TELEMETRY_SDK_LANGUAGE]: SDK_INFO[ATTR_TELEMETRY_SDK_LANGUAGE],
        [ATTR_TELEMETRY_SDK_NAME]: SDK_INFO[ATTR_TELEMETRY_SDK_NAME],
        [ATTR_TELEMETRY_SDK_VERSION]: SDK_INFO[ATTR_TELEMETRY_SDK_VERSION],
      },
    });
  }

  constructor(
    /**
     * A dictionary of attributes with string keys and values that provide
     * information about the entity as numbers, strings or booleans
     * TODO: Consider to add check/validation on attributes.
     */
    resource: DetectedResource
  ) {
    const attributes = resource.attributes ?? {};
    this._rawAttributes = Object.entries(attributes).map(([k, v]) => {
      if (isPromiseLike(v)) {
        // side-effect
        this._asyncAttributesPending = true;

        return [
          k,
          v.then(identity, err => {
            diag.debug(
              "a resource's async attributes promise rejected: %s",
              err
            );
            return [k, undefined];
          }),
        ];
      }

      return [k, v];
    });
  }

  public get asyncAttributesPending() {
    return this._asyncAttributesPending;
  }

  public async waitForAsyncAttributes(): Promise<void> {
    if (!this.asyncAttributesPending) {
      return;
    }

    this._rawAttributes = await Promise.all(
      this._rawAttributes.map<Promise<[string, AttributeValue | undefined]>>(
        async ([k, v]) => [k, await v]
      )
    );

    this._asyncAttributesPending = false;
  }

  public get attributes(): Attributes {
    if (this.asyncAttributesPending) {
      diag.error(
        'Accessing resource attributes before async attributes settled'
      );
    }

    // TODO
    if (this._memoizedAttributes) {
      return this._memoizedAttributes;
    }

    const attrs: Attributes = {};
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

  public merge(resource: Resource | null) {
    if (resource == null) return this;

    // incoming attributes have a lower priority
    const attributes: DetectedResourceAttributes = {};
    for (const [k, v] of [...this._rawAttributes, ...resource._rawAttributes]) {
      attributes[k] ??= v;
    }

    return new Resource({ attributes });
  }
}
