/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { diag } from '@opentelemetry/api';
import type { Resource } from './Resource';
import { emptyResource, resourceFromDetectedResource } from './ResourceImpl';
import type { ResourceDetectionConfig } from './config';
import type { ResourceDetector } from './types';

// JavaScript callers can pass anything in config.detectors, and a non-detector
// would otherwise throw from the catch below.
function isResourceDetector(
  detector: unknown,
  index: number
): detector is ResourceDetector {
  if (
    typeof detector === 'object' &&
    detector !== null &&
    'detect' in detector &&
    typeof detector.detect === 'function'
  ) {
    return true;
  }
  diag.warn(
    `detectResources: skipping detectors[${index}] (${String(detector)}), which is not a resource detector.`
  );
  return false;
}

/**
 * Runs all resource detectors and returns the results merged into a single Resource.
 *
 * @param config Configuration for resource detection
 */
export const detectResources = (
  config: ResourceDetectionConfig = {}
): Resource => {
  const resources: Resource[] = (config.detectors || []).map((d, i) => {
    if (!isResourceDetector(d, i)) return emptyResource();
    try {
      const resource = resourceFromDetectedResource(d.detect(config));
      diag.debug(`${d.constructor.name} found resource.`, resource);
      return resource;
    } catch (e) {
      diag.debug(`${d.constructor.name} failed: ${e.message}`);
      return emptyResource();
    }
  });

  return resources.reduce(
    (acc, resource) => acc.merge(resource),
    emptyResource()
  );
};
