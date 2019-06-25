/**
 * Copyright 2019, OpenTelemetry Authors
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

import { Resource } from '@opentelemetry/types';

/**
 * Returns a new Resource that is a combination of labels of two Resources. In
 * case of a collision, current Resource takes precedence.
 *
 * For example, from two Resources - one representing the host and one
 * representing a container, resulting Resource will describe both.
 *
 * @param resource The resource object.
 * @param otherResource The resource object, that will be merged with resource.
 * @returns the newly merged Resource.
 */
export function merge(resource: Resource, otherResource: Resource): Resource {
  if (!Object.keys(resource.labels).length) return otherResource;
  if (!Object.keys(otherResource.labels).length) return resource;

  return {
    // Labels from resource overwrite labels from otherResource.
    labels: Object.assign({}, otherResource.labels, resource.labels),
  };
}
