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
import { Resource } from './Resource';
import { emptyResource, resourceFromDetectedResource } from './ResourceImpl';
import { ResourceDetectionConfig } from './config';

/**
 * Runs all resource detectors asynchronously and merges the results
 * into a single Resource instance. Each detector may return attributes
 * asynchronously (e.g., from a remote API).
 *
 * This function ensures all detectors are awaited **in sequence** and
 * their results are merged, so no attributes are lost due to incomplete
 * async calls.
 *
 * @param config Configuration for resource detection
 * @returns A Promise resolving to a single merged Resource
 */
export const detectResources = async (
  config: ResourceDetectionConfig = {}
): Promise<Resource> => {
  // Get the list of detectors from config, or empty array if none
  const detectors = config.detectors || [];
  // Start with an empty resource object
  let resource = emptyResource();

  // Sequentially run each detector and merge its result
  for (const d of detectors) {
    try {
      // Await the detector, which may be async (network, disk, etc)
      const detected = await resourceFromDetectedResource(
        await d.detect(config)
      );
      diag.debug(`${d.constructor.name} found resource.`, detected);
      // Merge the detected resource into the main resource object
      resource = resource.merge(detected);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      // If a detector throws, log the error but continue to the next
      diag.debug(`${d.constructor.name} failed: ${e.message}`);
      // Optionally, continue with previous merged resource
    }
  }

  // Return the fully merged resource with all detected attributes
  return resource;
};
