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

import { ATTR_SERVICE_INSTANCE_ID } from '../../../semconv';
import { randomUUID } from 'crypto';
import { ResourceDetectionConfig } from '../../../config';
import { DetectedResource, ResourceDetector } from '../../../types';
import { getStringFromEnv, getStringListFromEnv } from '@opentelemetry/core';

/**
 * ServiceInstanceIdDetector detects the resources related to the service instance ID.
 */
class ServiceInstanceIdDetector implements ResourceDetector {
  detect(_config?: ResourceDetectionConfig): DetectedResource {
    let serviceInstanceID;
    if (
      getStringFromEnv('OTEL_RESOURCE_ATTRIBUTES')?.includes(
        'service.instance.id'
      )
    ) {
      const resources = getStringListFromEnv('OTEL_RESOURCE_ATTRIBUTES') || [];
      for (const resource of resources) {
        const [key, value] = resource.split('=');
        if (key === 'service.instance.id') {
          serviceInstanceID = value;
          break;
        }
      }
    }

    return {
      attributes: {
        [ATTR_SERVICE_INSTANCE_ID]: serviceInstanceID ?? randomUUID(),
      },
    };
  }
}

/**
 * @experimental
 */
export const serviceInstanceIdDetector = new ServiceInstanceIdDetector();
