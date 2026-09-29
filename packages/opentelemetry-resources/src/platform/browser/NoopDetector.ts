/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { DetectedResource, ResourceDetector } from '../../types';

class NoopDetector implements ResourceDetector {
  detect(): DetectedResource {
    return { attributes: {} };
  }
}

const noopDetector = new NoopDetector();

// No-ops keep the node surface, so isomorphic code can register them unconditionally.
export const hostDetector = noopDetector;
export const osDetector = noopDetector;
export const processDetector = noopDetector;
export const serviceInstanceIdDetector = noopDetector;
