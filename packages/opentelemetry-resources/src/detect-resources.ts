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

import { Resource } from './Resource';
import { ResourceDetectionConfig } from './config';
import { diag } from '@opentelemetry/api';
import { isPromiseLike } from './utils';
import { Detector, DetectorSync } from './types';
import { IResource } from './IResource';

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
): Promise<IResource> => {
  const resources: IResource[] = await Promise.all(
    (config.detectors || []).map(async d => {
      try {
        const resource = await d.detect(config);
        diag.debug(`${d.constructor.name} found resource.`, resource);
        return resource;
      } catch (e) {
        diag.debug(`${d.constructor.name} failed: ${e.message}`);
        return Resource.empty();
      }
    })
  );

  // Future check if verbose logging is enabled issue #1903
  logResources(resources);

  return resources.reduce(
    (acc, resource) => acc.merge(resource),
    Resource.empty()
  );
};

/**
 * Runs all resource detectors synchronously, merging their results. In case of attribute collision later resources will take precedence.
 *
 * @param config Configuration for resource detection
 */
export const detectResourcesSync = (
  config: ResourceDetectionConfig = {}
): IResource => {
  const resources: IResource[] = (config.detectors ?? []).map(
    (d: Detector | DetectorSync) => {
      try {
        const resourceOrPromise = d.detect(config);
        let resource: IResource;
        if (isPromiseLike<Resource>(resourceOrPromise)) {
          const createPromise = async () => {
            const resolvedResource = await resourceOrPromise;
            return resolvedResource.attributes;
          };
          resource = new Resource({}, createPromise());
        } else {
          resource = resourceOrPromise as IResource;
        }

        if (resource.waitForAsyncAttributes) {
          void resource
            .waitForAsyncAttributes()
            .then(() =>
              diag.debug(`${d.constructor.name} found resource.`, resource)
            );
        } else {
          diag.debug(`${d.constructor.name} found resource.`, resource);
        }

        return resource;
      } catch (e) {
        diag.error(`${d.constructor.name} failed: ${e.message}`);
        return Resource.empty();
      }
    }
  );

  const mergedResources = resources.reduce(
    (acc, resource) => acc.merge(resource),
    Resource.empty()
  );

  if (mergedResources.waitForAsyncAttributes) {
    void mergedResources.waitForAsyncAttributes().then(() => {
      // Future check if verbose logging is enabled issue #1903
      logResources(resources);
    });
  }

  return mergedResources;
};

/**
 * Writes debug information about the detected resources to the logger defined in the resource detection config, if one is provided.
 *
 * @param resources The array of {@link Resource} that should be logged. Empty entries will be ignored.
 */
const logResources = (resources: Array<IResource>) => {
  resources.forEach(resource => {
    // Print only populated resources
    if (Object.keys(resource.attributes).length > 0) {
      const resourceDebugString = JSON.stringify(resource.attributes, null, 4);
      diag.verbose(resourceDebugString);
    }
  });
};
