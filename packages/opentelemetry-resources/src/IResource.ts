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

import { Attributes } from '@opentelemetry/api';

/**
 * An interface that represents a resource. A Resource describes the entity for which signals (metrics or trace) are
 * collected.
 *
 */
export interface IResource {
  /**
   * Check if async attributes have resolved. This is useful to avoid awaiting
   * waitForAsyncAttributes (which will introduce asynchronous behavior) when not necessary.
   *
   * @returns true if the resource "attributes" property is not yet settled to its final value
   */
  asyncAttributesPending?: boolean;

  /**
   * @returns the Resource's attributes.
   */
  readonly attributes: Attributes;

  /**
   * Returns a promise that will never be rejected. Resolves when all async attributes have finished being added to
   * this Resource's attributes. This is useful in exporters to block until resource detection
   * has finished.
   */
  waitForAsyncAttributes?(): Promise<void>;

  /**
   * Returns a new, merged {@link Resource} by merging the current Resource
   * with the other Resource. In case of a collision, other Resource takes
   * precedence.
   *
   * @param other the Resource that will be merged with this.
   * @returns the newly merged Resource.
   */
  merge(other: IResource | null): IResource;
}
