/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Attributes } from '@opentelemetry/api';
import { ATTR_OS_TYPE, ATTR_OS_VERSION } from '../../../semconv';
import { platform, release } from 'os';
import { ResourceDetectionConfig } from '../../../config';
import { DetectedResource, ResourceDetector } from '../../../types';
import { normalizeType } from './utils';

/**
 * OSDetector detects the resources related to the operating system (OS) on
 * which the process represented by this resource is running.
 */
class OSDetector implements ResourceDetector {
  detect(_config?: ResourceDetectionConfig): DetectedResource {
    const attributes: Attributes = {
      [ATTR_OS_TYPE]: normalizeType(platform()),
      [ATTR_OS_VERSION]: release(),
    };
    return { attributes };
  }
}

export const osDetector = new OSDetector();
