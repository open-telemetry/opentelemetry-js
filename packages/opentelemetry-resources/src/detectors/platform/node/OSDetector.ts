/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
