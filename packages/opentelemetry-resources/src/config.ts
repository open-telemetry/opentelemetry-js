/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ResourceDetector } from './types';

/**
 * ResourceDetectionConfig provides an interface for configuring resource auto-detection.
 */
export interface ResourceDetectionConfig {
  detectors?: Array<ResourceDetector>;
}
