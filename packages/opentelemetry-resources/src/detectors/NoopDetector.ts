/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DetectedResource, ResourceDetector } from '../types';

export class NoopDetector implements ResourceDetector {
  detect(): DetectedResource {
    return {
      attributes: {},
    };
  }
}

export const noopDetector = new NoopDetector();
