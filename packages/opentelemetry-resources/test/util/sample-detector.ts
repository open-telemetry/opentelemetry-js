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

import {
  ATTR_CLOUD_ACCOUNT_ID,
  ATTR_CLOUD_AVAILABILITY_ZONE,
  ATTR_CLOUD_PROVIDER,
  ATTR_CLOUD_REGION,
  ATTR_HOST_ID,
  ATTR_HOST_TYPE,
} from '../../src/semconv';
import { ResourceDetector } from '../../src';
import { DetectedResource } from '../../src/types';

class SampleDetector implements ResourceDetector {
  detect(): DetectedResource {
    return {
      attributes: {
        [ATTR_CLOUD_PROVIDER]: 'provider',
        [ATTR_CLOUD_ACCOUNT_ID]: 'accountId',
        [ATTR_CLOUD_REGION]: 'region',
        [ATTR_CLOUD_AVAILABILITY_ZONE]: 'zone',
        [ATTR_HOST_ID]: 'instanceId',
        [ATTR_HOST_TYPE]: 'instanceType',
      },
    };
  }
}

export const sampleDetector = new SampleDetector();
