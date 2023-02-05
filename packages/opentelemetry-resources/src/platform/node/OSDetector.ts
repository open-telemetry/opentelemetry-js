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

import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { Resource } from '../../Resource';
import { Detector, ResourceAttributes } from '../../types';
import { ResourceDetectionConfig } from '../../config';
import { platform, release } from 'os';
import { IResource } from '../../IResource';
import { normalizeType } from './utils';

/**
 * OSDetector detects the resources related to the operating system (OS) on
 * which the process represented by this resource is running.
 */
class OSDetector implements Detector {
  detect(_config?: ResourceDetectionConfig): Promise<IResource> {
    const attributes: ResourceAttributes = {
      [SemanticResourceAttributes.OS_TYPE]: normalizeType(platform()),
      [SemanticResourceAttributes.OS_VERSION]: release(),
    };
    return Promise.resolve(new Resource(attributes));
  }
}

export const osDetector = new OSDetector();
