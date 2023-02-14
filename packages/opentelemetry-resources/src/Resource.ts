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

import { diag } from '@opentelemetry/api';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { SDK_INFO } from '@opentelemetry/core';
import { ResourceAttributes } from './types';
import { defaultServiceName } from './platform';
import { IResource } from './IResource';

/**
 * A Resource describes the entity for which a signals (metrics or trace) are
 * collected.
 */
export class Resource implements IResource {
  static readonly EMPTY = new Resource({});
  private _syncAttributes: ResourceAttributes;
  private _asyncAttributesPromise: Promise<ResourceAttributes> | undefined;

  /**
   * Check if async attributes have resolved. This is useful to avoid awaiting
   * waitForAsyncAttributes (which will introduce asynchronous behavior) when not necessary.
   *
   * @returns true if the resource "attributes" property is not yet settled to its final value
   */
  public asyncAttributesPending: boolean;

  /**
   * Returns an empty Resource
   */
  static empty(): IResource {
    return Resource.EMPTY;
  }

  /**
   * Returns a Resource that identifies the SDK in use.
   */
  static default(): IResource {
    return new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: defaultServiceName(),
      [SemanticResourceAttributes.TELEMETRY_SDK_LANGUAGE]:
        SDK_INFO[SemanticResourceAttributes.TELEMETRY_SDK_LANGUAGE],
      [SemanticResourceAttributes.TELEMETRY_SDK_NAME]:
        SDK_INFO[SemanticResourceAttributes.TELEMETRY_SDK_NAME],
      [SemanticResourceAttributes.TELEMETRY_SDK_VERSION]:
        SDK_INFO[SemanticResourceAttributes.TELEMETRY_SDK_VERSION],
    });
  }

  constructor(
    /**
     * A dictionary of attributes with string keys and values that provide
     * information about the entity as numbers, strings or booleans
     * TODO: Consider to add check/validation on attributes.
     */
    private _attributes: ResourceAttributes,
    asyncAttributesPromise?: Promise<ResourceAttributes>
  ) {
    this.asyncAttributesPending = asyncAttributesPromise != null;
    this._syncAttributes = _attributes;
    this._asyncAttributesPromise = asyncAttributesPromise?.then(
      asyncAttributes => {
        this._attributes = Object.assign({}, this._attributes, asyncAttributes);
        this.asyncAttributesPending = false;
        return asyncAttributes;
      },
      err => {
        diag.debug("a resource's async attributes promise rejected: %s", err);
        this.asyncAttributesPending = false;
        return {};
      }
    );
  }

  get attributes(): ResourceAttributes {
    if (this.asyncAttributesPending) {
      diag.error(
        'Accessing resource attributes before async attributes settled'
      );
    }

    return this._attributes;
  }

  /**
   * Returns a promise that will never be rejected. Resolves when all async attributes have finished being added to
   * this Resource's attributes. This is useful in exporters to block until resource detection
   * has finished.
   */
  async waitForAsyncAttributes(): Promise<void> {
    if (this.asyncAttributesPending) {
      await this._asyncAttributesPromise;
    }
  }

  /**
   * Returns a new, merged {@link Resource} by merging the current Resource
   * with the other Resource. In case of a collision, other Resource takes
   * precedence.
   *
   * @param other the Resource that will be merged with this.
   * @returns the newly merged Resource.
   */
  merge(other: IResource | null): IResource {
    if (!other) return this;

    // SpanAttributes from other resource overwrite attributes from this resource.
    const mergedSyncAttributes = {
      ...this._syncAttributes,
      //Support for old resource implementation where _syncAttributes is not defined
      ...((other as Resource)._syncAttributes ?? other.attributes),
    };

    if (
      !this._asyncAttributesPromise &&
      !(other as Resource)._asyncAttributesPromise
    ) {
      return new Resource(mergedSyncAttributes);
    }

    const mergedAttributesPromise = Promise.all([
      this._asyncAttributesPromise,
      (other as Resource)._asyncAttributesPromise,
    ]).then(([thisAsyncAttributes, otherAsyncAttributes]) => {
      return {
        ...this._syncAttributes,
        ...thisAsyncAttributes,
        //Support for old resource implementation where _syncAttributes is not defined
        ...((other as Resource)._syncAttributes ?? other.attributes),
        ...otherAsyncAttributes,
      };
    });

    return new Resource(mergedSyncAttributes, mergedAttributesPromise);
  }
}
