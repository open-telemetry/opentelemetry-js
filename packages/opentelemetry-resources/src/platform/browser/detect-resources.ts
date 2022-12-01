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

import { Resource } from '../../Resource';
import { ResourceDetectionConfig } from '../../config';
import { diag } from '@opentelemetry/api';

/**
 * Runs all resource detectors and returns the results merged into a single Resource. Promise
 * does not resolve until all the underlying detectors have resolved, unlike
 * detectResourcesSync.
 *
 * @deprecated use detectResourceSync() instead.
 * @param config Configuration for resource detection
 */
export const detectResources = async (
  config: ResourceDetectionConfig = {}
): Promise<Resource> => {
  const internalConfig: ResourceDetectionConfig = Object.assign(config);

  const resources: Resource[] = await Promise.all(
    (internalConfig.detectors || []).map(async d => {
      try {
        const resource = await d.detect(internalConfig);
        diag.debug(`${d.constructor.name} found resource.`, resource);
        return resource;
      } catch (e) {
        diag.debug(`${d.constructor.name} failed: ${e.message}`);
        return Resource.empty();
      }
    })
  );

  return resources.reduce(
    (acc, resource) => acc.merge(resource),
    Resource.empty()
  );
};

/**
 * Runs all resource detectors synchronously, merging their results. Any asynchronous
 * attributes will be merged together in-order after they resolve.
 *
 * @param config Configuration for resource detection
 */
export const detectResourcesSync = (
  config: ResourceDetectionConfig = {}
): Resource => {
  const internalConfig: ResourceDetectionConfig = Object.assign(config);

  const resources: Resource[] = (internalConfig.detectors ?? []).map(d => {
    try {
      const resourceOrPromise = d.detect(internalConfig);
      let resource: Resource;
      if (resourceOrPromise instanceof Promise) {
        const createPromise = async () => {
          const resolved = await resourceOrPromise;
          await resolved.waitForAsyncAttributes();
          return resolved.attributes;
        };
        resource = new Resource({}, createPromise());
      } else {
        resource = resourceOrPromise;
      }

      resource.waitForAsyncAttributes().then(() => {
        diag.debug(`${d.constructor.name} found resource.`, resource);
      }).catch(e => {
        diag.debug(`${d.constructor.name} failed: ${e.message}`);
      });

      return resource;
    } catch (e) {
      diag.debug(`${d.constructor.name} failed: ${e.message}`);
      return Resource.empty();
    }
  });

  return resources.reduce(
    (acc, resource) => acc.merge(resource),
    Resource.empty()
  );;
};
