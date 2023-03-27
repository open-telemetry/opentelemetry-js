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
  CLOUD_ACCOUNT_ID,
  CLOUD_AVAILABILITY_ZONE,
  CLOUD_PROVIDER,
  CLOUD_REGION,
  HOST_ID,
  HOST_TYPE,
} from '@opentelemetry/semantic-conventions';
import { Detector, Resource } from '../../src';

class SampleDetector implements Detector {
  async detect(): Promise<Resource> {
    return new Resource({
      [CLOUD_PROVIDER]: 'provider',
      [CLOUD_ACCOUNT_ID]: 'accountId',
      [CLOUD_REGION]: 'region',
      [CLOUD_AVAILABILITY_ZONE]: 'zone',
      [HOST_ID]: 'instanceId',
      [HOST_TYPE]: 'instanceType',
    });
  }
}

export const sampleDetector = new SampleDetector();
