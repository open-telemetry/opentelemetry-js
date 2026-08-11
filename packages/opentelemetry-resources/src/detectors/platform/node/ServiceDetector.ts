/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { getStringFromEnv } from '@opentelemetry/core';
import { ATTR_SERVICE_INSTANCE_ID } from '../../../semconv';
import { randomUUID } from 'crypto';
import type { ResourceDetectionConfig } from '../../../config';
import type { DetectedResource, ResourceDetector } from '../../../types';

/**
 * ServiceDetector detects resources related to the service.
 */
class ServiceDetector implements ResourceDetector {
  detect(_config?: ResourceDetectionConfig): DetectedResource {
    const serviceName = getStringFromEnv('OTEL_SERVICE_NAME');

    return {
      attributes: {
        ...(serviceName ? { [ATTR_SERVICE_NAME]: serviceName } : {}),
        [ATTR_SERVICE_INSTANCE_ID]: randomUUID(),
      },
    };
  }
}

export const serviceDetector = new ServiceDetector();
