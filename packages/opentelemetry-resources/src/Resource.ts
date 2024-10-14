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
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_TELEMETRY_SDK_LANGUAGE,
  SEMRESATTRS_TELEMETRY_SDK_NAME,
  SEMRESATTRS_TELEMETRY_SDK_VERSION,
} from '@opentelemetry/semantic-conventions';
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
  private _syncAttributes?: ResourceAttributes;
  private _asyncAttributesPromise?: Promise<ResourceAttributes>;
  private _attributes?: ResourceAttributes;
  private _schemaUrl?: string; // Added schemaUrl property

  /**
   * Check if async attributes have resolved. This is useful to avoid awaiting
   * waitForAsyncAttributes (which will introduce asynchronous behavior) when not necessary.
   *
   * @returns true if the resource "attributes" property is not yet settled to its final value
   */
  public asyncAttributesPending?: boolean;

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
      [SEMRESATTRS_SERVICE_NAME]: defaultServiceName(),
      [SEMRESATTRS_TELEMETRY_SDK_LANGUAGE]:
        SDK_INFO[SEMRESATTRS_TELEMETRY_SDK_LANGUAGE],
      [SEMRESATTRS_TELEMETRY_SDK_NAME]:
        SDK_INFO[SEMRESATTRS_TELEMETRY_SDK_NAME],
      [SEMRESATTRS_TELEMETRY_SDK_VERSION]:
        SDK_INFO[SEMRESATTRS_TELEMETRY_SDK_VERSION],
    });
  }

  constructor(
    attributes: ResourceAttributes,
    asyncAttributesPromise?: Promise<ResourceAttributes>,
    schemaUrl?: string  // Added schemaUrl parameter
  ) {
    this._attributes = attributes;
    this.asyncAttributesPending = asyncAttributesPromise != null;
    this._syncAttributes = this._attributes ?? {};
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
    this._schemaUrl = schemaUrl; // Store the schemaUrl
  }

  get attributes(): ResourceAttributes {
    if (this.asyncAttributesPending) {
      diag.error(
        'Accessing resource attributes before async attributes settled'
      );
    }

    return this._attributes ?? {};
  }

  /**
   * Returns the schema URL of the resource.
   */
  public getSchemaUrl(): string | undefined {
    return this._schemaUrl;
  }

  /**
   * Returns a promise that will never be rejected. Resolves when all async attributes have finished being added to
   * this Resource's attributes. This is useful in exporters to block until resource detection
   * has finished.
   */
  async waitForAsyncAttributes?(): Promise<void> {
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

    // Merge schema URLs, handling conflicts
    const mergedSchemaUrl = this._mergeSchemaUrls(this._schemaUrl, (other as Resource)._schemaUrl);

    if (
      !this._asyncAttributesPromise &&
      !(other as Resource)._asyncAttributesPromise
    ) {
      return new Resource(mergedSyncAttributes, undefined, mergedSchemaUrl);
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

    return new Resource(mergedSyncAttributes, mergedAttributesPromise, mergedSchemaUrl);
  }

  /**
   * Helper function to merge schema URLs. If both schema URLs are present and differ,
   * a warning is logged and the first schema URL is prioritized.
   */
  private _mergeSchemaUrls(
    schemaUrl1?: string,
    schemaUrl2?: string
  ): string | undefined {
    if (schemaUrl1 && schemaUrl2 && schemaUrl1 !== schemaUrl2) {
      diag.warn('Schema URLs differ. Using the original schema URL.');
    }
    return schemaUrl1 || schemaUrl2;
  }
}
