/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ATTR_SERVICE_INSTANCE_ID } from '../../../semconv';
import { randomUUID } from 'crypto';
import type { ResourceDetectionConfig } from '../../../config';
import type { DetectedResource, ResourceDetector } from '../../../types';

// Multiple calls to ServiceInstanceIdDetector return the same ID.
const SERVICE_INSTANCE_ID = randomUUID();

/**
 * ServiceInstanceIdDetector detects the resources related to the service instance ID.
 */
class ServiceInstanceIdDetector implements ResourceDetector {
  detect(_config?: ResourceDetectionConfig): DetectedResource {
    return {
      attributes: {
        [ATTR_SERVICE_INSTANCE_ID]: SERVICE_INSTANCE_ID,
      },
    };
  }
}

/**
 * @experimental
 */
export const serviceInstanceIdDetector = new ServiceInstanceIdDetector();
