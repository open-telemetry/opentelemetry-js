/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Attributes } from '@opentelemetry/api';
import { diag } from '@opentelemetry/api';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import type { ResourceDetectionConfig } from '../config';
import type { DetectedResource } from '../types';
import { getStringFromEnv } from '@opentelemetry/core';
import { ResourceAttributesEnvDetector } from './ResourceAttributesEnvDetector';

/**
 * EnvDetector reads attributes from OTEL_RESOURCE_ATTRIBUTES and
 * OTEL_SERVICE_NAME.
 *
 * @deprecated Use {ResourceAttributesEnvDetector} and {ServiceNameEnvDetector}
 */
class EnvDetector extends ResourceAttributesEnvDetector {
  /**
   * Returns a {@link Resource} populated with attributes from the
   * OTEL_RESOURCE_ATTRIBUTES environment variable. Note this is an async
   * function to conform to the Detector interface.
   *
   * @param config The resource detection config
   */
  override detect(_config?: ResourceDetectionConfig): DetectedResource {
    const attributes: Attributes = {};

    const rawAttributes = getStringFromEnv('OTEL_RESOURCE_ATTRIBUTES');
    const serviceName = getStringFromEnv('OTEL_SERVICE_NAME');

    if (rawAttributes) {
      try {
        const parsedAttributes = this._parseResourceAttributes(rawAttributes);
        Object.assign(attributes, parsedAttributes);
      } catch (e) {
        diag.debug(`EnvDetector failed: ${e instanceof Error ? e.message : e}`);
      }
    }

    if (serviceName) {
      attributes[ATTR_SERVICE_NAME] = serviceName;
    }

    return { attributes };
  }
}

/**
 * @deprecated Use {resourceAttributesEnvDetector} and {serviceNameEnvDetector}
 */
export const envDetector = new EnvDetector();
