/**
 * Copyright 2020, OpenTelemetry Authors
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

const DETECTORS: Array<Detector> = [envDetector, awsEc2Detector, gcpDetector];

/**
 * Runs all resource detectors and returns the results merged into a single
 * Resource.
 */
export const detectResources = async (): Promise<Resource> => {
  const resources: Array<Resource> = await Promise.all(
    DETECTORS.map(d => {
      try {
        return d.detect();
      } catch {
        return Resource.empty();
      }
    })
  );
  return resources.reduce(
    (acc, resource) => acc.merge(resource),
    Resource.createTelemetrySDKResource()
  );
};
