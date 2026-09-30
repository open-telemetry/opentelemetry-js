/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ATTR_SERVICE_INSTANCE_ID } from '../../../semconv';
import { randomUUID } from 'crypto';
import type { ResourceDetectionConfig } from '../../../config';
import type { DetectedResource, ResourceDetector } from '../../../types';

/**
 * ServiceInstanceIdDetector detects the resources related to the service instance ID.
 */
class ServiceInstanceIdDetector implements ResourceDetector {
  // Multiple calls to ServiceInstanceIdDetector return the same ID.
  private _serviceInstanceId: string | undefined;

  detect(_config?: ResourceDetectionConfig): DetectedResource {
    if (!this._serviceInstanceId) {
      this._serviceInstanceId = randomUUID();
    }
    return {
      attributes: {
        [ATTR_SERVICE_INSTANCE_ID]: this._serviceInstanceId,
      },
    };
  }
}

export const serviceInstanceIdDetector = new ServiceInstanceIdDetector();
