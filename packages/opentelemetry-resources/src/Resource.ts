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
import {
  ATTR_SERVICE_NAME, ATTR_TELEMETRY_SDK_LANGUAGE, ATTR_TELEMETRY_SDK_NAME, ATTR_TELEMETRY_SDK_VERSION,
} from '@opentelemetry/semantic-conventions';
import { SDK_INFO } from '@opentelemetry/core';
import { defaultServiceName } from './platform';
import { IResource } from './IResource';
import { isPromiseLike } from './utils';

/**
 * A Resource describes the entity for which a signals (metrics or trace) are
 * collected.
 */
export class Resource implements IResource {
  static readonly EMPTY = new Resource(Promise.resolve({}));
  private _attributes: Promise<Attributes>;

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
    return new Resource(Promise.resolve({
      [ATTR_SERVICE_NAME]: defaultServiceName(),
      [ATTR_TELEMETRY_SDK_LANGUAGE]:
        SDK_INFO[ATTR_TELEMETRY_SDK_LANGUAGE],
      [ATTR_TELEMETRY_SDK_NAME]:
        SDK_INFO[ATTR_TELEMETRY_SDK_NAME],
      [ATTR_TELEMETRY_SDK_VERSION]:
        SDK_INFO[ATTR_TELEMETRY_SDK_VERSION],
    }));
  }

  constructor(
    /**
     * A dictionary of attributes with string keys and values that provide
     * information about the entity as numbers, strings or booleans
     * TODO: Consider to add check/validation on attributes.
     */
    attributes: Attributes | Promise<Attributes>
  ) {
    if (isPromiseLike(attributes)) {
      this._attributes = attributes.catch(err => {
        diag.debug("a resource's async attributes promise rejected: %s", err);
        return {};
      });
    } else {
      this._attributes = Promise.resolve(attributes);
    }
  }

  get attributes(): Promise<Attributes> {
    return this._attributes;
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

    return new Resource(Promise.allSettled([
      this._attributes,
      other.attributes,
    ]).then((attribPromises) => {
      let result = {};

      for (const prom of attribPromises) {
        if (prom.status === 'rejected') {
          diag.debug("a resource's async attributes promise rejected: %s", prom.reason);
        } else {
          result = { ...result, ...prom.value};
        }
      }
      return result;
    }));
  }
}
