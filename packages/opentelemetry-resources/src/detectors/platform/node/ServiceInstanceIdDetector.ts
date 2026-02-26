/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ATTR_SERVICE_INSTANCE_ID } from '../../../semconv';
import { randomUUID } from 'crypto';
import { ResourceDetectionConfig } from '../../../config';
import { DetectedResource, ResourceDetector } from '../../../types';

/**
 * ServiceInstanceIdDetector detects the resources related to the service instance ID.
 */
class ServiceInstanceIdDetector implements ResourceDetector {
  detect(_config?: ResourceDetectionConfig): DetectedResource {
    return {
      attributes: {
        [ATTR_SERVICE_INSTANCE_ID]: randomUUID(),
      },
    };
  }
}

/**
 * @experimental
 */
export const serviceInstanceIdDetector = new ServiceInstanceIdDetector();
