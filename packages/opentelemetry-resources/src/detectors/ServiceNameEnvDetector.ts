/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Attributes } from '@opentelemetry/api';
import { getStringFromEnv } from '@opentelemetry/core';
import type { DetectedResource, ResourceDetector } from '../types';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

/**
 * ServiceNameEnvDetector detects 'service.name' from OTEL_SERVICE_NAME.
 */
class ServiceNameEnvDetector implements ResourceDetector {
  detect(): DetectedResource {
    const attributes: Attributes = {};
    const serviceName = getStringFromEnv('OTEL_SERVICE_NAME');
    if (serviceName) {
      attributes[ATTR_SERVICE_NAME] = serviceName;
    }
    return { attributes };
  }
}

export const serviceNameEnvDetector = new ServiceNameEnvDetector();
