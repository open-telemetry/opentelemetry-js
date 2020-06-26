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
import {
  ResourceDetectionConfig,
  ResourceDetectionConfigWithLogger,
} from '../../config';
import { Logger } from '@opentelemetry/api';
import * as util from 'util';
import { NoopLogger } from '@opentelemetry/core';

const DETECTORS: Array<Detector> = [envDetector, awsEc2Detector, gcpDetector];

/**
 * Runs all resource detectors and returns the results merged into a single
 * Resource.
 *
 * @param config Configuration for resource detection
 */
export const detectResources = async (
  config: ResourceDetectionConfig = {}
): Promise<Resource> => {
  const internalConfig: ResourceDetectionConfigWithLogger = Object.assign(
    {
      logger: new NoopLogger(),
    },
    config
  );

  const resources: Array<Resource> = await Promise.all(
    DETECTORS.map(d => {
      try {
        return d.detect(internalConfig);
      } catch {
        return Resource.empty();
      }
    })
  );
  // Log Resources only if there is a user-provided logger
  if (config.logger) {
    logResources(config.logger, resources);
  }
  return resources.reduce(
    (acc, resource) => acc.merge(resource),
    Resource.createTelemetrySDKResource()
  );
};

/**
 * Writes debug information about the detected resources to the logger defined in the resource detection config, if one is provided.
 *
 * @param logger The {@link Logger} to write the debug information to.
 * @param resources The array of {@link Resource} that should be logged. Empty entried will be ignored.
 */
const logResources = (logger: Logger, resources: Array<Resource>) => {
  resources.forEach((resource, index) => {
    // Print only populated resources
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
};
