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
import { envDetector, awsEc2Detector, gcpDetector } from './detectors';
import { Detector } from '../../types';
import { ResourceDetectionConfig } from '../../config';
import { Logger } from '@opentelemetry/api';
import * as util from 'util';

const DETECTORS: Array<Detector> = [envDetector, awsEc2Detector, gcpDetector];

/**
 * Runs all resource detectors and returns the results merged into a single
 * Resource.
 *
 * @param config Configuration object for resource detection
 */
export const detectResources = async (
  config: ResourceDetectionConfig = {}
): Promise<Resource> => {
  const resources: Array<Resource> = await Promise.all(
    DETECTORS.map(d => {
      try {
        return d.detect(config);
      } catch {
        return Resource.empty();
      }
    })
  );
  logResources(config.logger, resources);
  return resources.reduce(
    (acc, resource) => acc.merge(resource),
    Resource.createTelemetrySDKResource()
  );
};

/**
 * Writes debug information about the detected resources to the logger defined in the resource detection config, if one is provided.
 *
 * @param logger The logger to write the debug information to.
 * @param resources The array of resources that should be logged. Empty entried will be ignored.
 */
const logResources = (
  logger: Logger | undefined,
  resources: Array<Resource>
) => {
  if (logger) {
    resources.forEach((resource, index) => {
      // Only print populated resources
      if (Object.keys(resource.labels).length > 0) {
        const resourceDebugString = util.inspect(resource.labels, {
          depth: 2,
          breakLength: Infinity,
          sorted: true,
          compact: false,
        });
        const detectorName = DETECTORS[index].constructor
          ? DETECTORS[index].constructor.name
          : 'Unknown detector';
        logger.debug(`${detectorName} found resource.`);
        logger.debug(resourceDebugString);
      }
    });
  }
};
